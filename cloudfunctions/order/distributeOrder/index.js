const cloud = require('wx-server-sdk')
const moment = require('moment')

const {
  PA_ORDER_STATUS,
} = require('../const')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})

const _ = db.command
// 配送订单
exports.main = async (event, context) => {
  const {
    orderNo
  } = event
  try {
    const openid = cloud.getWXContext().OPENID // 用户openid
    // 校验是否有权限
    let userRes = await db.collection('user').where({
      _openid: openid
    }).get()
    userRes = userRes.data && userRes.data[0]
    let orderRes = await db.collection('order').doc(orderNo).get()
    orderRes = orderRes.data
    if (userRes) {
      if (orderRes) {
        // 用户是否是该订单门店的 负责人
        if (userRes.store.includes(orderRes.storeInfo.storeId)) {
          // 不能履约当前日期以后的订单
          const diff = moment(db.serverDate()).diff(moment(orderRes.distributeDate), 'days')
          if (diff >= 0) {
            const transaction = await db.startTransaction()
            await transaction.collection('order').doc(orderNo).update({
              data: {
                distributeStatus: 1
              }
            })
            // 父订单信息
            const paOrderRes = await db.collection('wx-order').doc(orderRes.outTradeNo).get()
            const orderType = paOrderRes.data && paOrderRes.data.orderType
            // 单天订单还是一周订单
            if (orderType === 1) { // 如果是单天订单 直接翻转父订单状态
              await transaction.collection('wx-order').doc(orderRes.outTradeNo).update({
                data: {
                  orderStatus: PA_ORDER_STATUS.DEAL_DONE,
                  dealTime: db.serverDate()
                }
              })
            } else {
              let orders = paOrderRes.data && paOrderRes.data.orders // 所有子订单号数组
              const index = orders.findIndex(item => item === orderNo)
              orders.splice(index, 1) // 去除当前订单：因为当前订单还在transaction中 distributeStatus还未变更
              if (orders && orders.length) {
                const tasks = []
                orders.forEach(item => {
                  const promise = db.collection('order').doc(item).get()
                  tasks.push(promise)
                })
                let result = await Promise.all(tasks)
                result = result.map(item => item.data.distributeStatus)
                if (result.every(item => item === 1)) { // 当除了orderNo的订单以外的 所有子订单 都配送完成时 翻转父订单的订单状态为 交易完成
                  await transaction.collection('wx-order').doc(orderRes.outTradeNo).update({
                    data: {
                      orderStatus: PA_ORDER_STATUS.DEAL_DONE,
                      dealTime: db.serverDate()
                    }
                  })
                }
              }
            }
            await transaction.commit()
            let res = await db.collection('order').doc(orderNo).get()
            res = (res && res.data) || {}
            return {
              success: true,
              data: {
                orderNo: res._id, // 订单号
                name: res.product.name, // 套餐名称
                product: res.product.products.map(v => {
                  return {
                    name: v.detail.name,
                    count: v.count
                  }
                }), // 订单商品
                phone: res.userInfo.phone, // 消费者手机号
                status: res.orderStatus, // 订单状态
                distributeStatus: res.distributeStatus, // 配送状态
                distributeDate: res.distributeDate, // 配送时间
              }
            }
          } else {
            return {
              success: false,
              error: {
                message: '只能配送当天以前的订单'
              }
            }
          }
        } else {
          return {
            success: false,
            error: {
              message: '您暂无权限'
            }
          }
        }
      } else {
        return {
          success: false,
          error: {
            message: '订单信息有误'
          }
        }
      }
    } else {
      return {
        success: false,
        error: {
          message: '用户信息有误'
        }
      }
    }

  } catch (e) {
    return {
      success: false,
      error: e
    }
  }
}
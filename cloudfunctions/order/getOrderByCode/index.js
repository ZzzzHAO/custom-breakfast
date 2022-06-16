const cloud = require('wx-server-sdk');
const moment = require('moment')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})
const _ = db.command
// 通过取餐码获取子订单信息
exports.main = async (event, context) => {
  const {
    code
  } = event
  try {
    // 现查找当前门店
    let storeRes = await db.collection('store').where({
      _openid: cloud.getWXContext().OPENID
    }).get()
    storeRes = storeRes.data && storeRes.data[0]
    if (storeRes) {
      let orderRes = await db.collection('order').where({
        code, // 取餐码
        distributeDate: _.and(_.gte(moment(db.serverDate()).startOf('day').toDate()), _.lt(moment(db.serverDate()).endOf('day').toDate())), // 当天
        storeInfo: {
          storeId: storeRes._id, // 当前门店
        }
      }).get()
      orderRes = orderRes.data
      if (orderRes.length) {
        return {
          success: true,
          data: {
            orderList: orderRes.map(item => {
              return {
                orderNo: item._id, // 订单号
                name: item.product.name, // 套餐名称
                product: item.product.products.map(v => {
                  return {
                    name: v.detail.name,
                    count: v.count
                  }
                }), // 订单商品
                phone: item.userInfo.phone, // 消费者手机号
                status: item.orderStatus, // 订单状态
                distributeStatus: item.distributeStatus, // 配送状态
                distributeDate: item.distributeDate, // 配送时间
              }
            })
          }
        }
      } else {
        return {
          success: false,
          error: {
            message: '未查到该订单'
          }
        }
      }
    } else {
      return {
        success: false,
        error: {
          message: '暂无您的门店信息'
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
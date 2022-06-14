const cloud = require('wx-server-sdk');
const moment = require('moment')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
const _ = db.command
// 通过取餐码获取订单信息
exports.main = async (event, context) => {
  const {
    seq
  } = event
  try {
    let storeRes = await db.collection('user').where({
      _openid: cloud.getWXContext().OPENID
    }).get()
    storeRes = storeRes.data && storeRes.data[0]
    if (storeRes && storeRes.store && storeRes.store.length) {
      let orderRes = await db.collection('order').where({
        seq,
        distributeDate: _.and(_.gt(moment(new Date('2022/06/20')).startOf('day').toDate()), _.lt(moment(new Date('2022/06/20')).endOf('day').toDate())),
        'storeInfo.storeId': storeRes.store[0]
      }).get()
      orderRes = orderRes.data
      if (orderRes.length) {
        return {
          success: true,
          data: {
            orderList: orderRes.map(item => {
              return {
                orderNo: item._id, // 订单号
                name: item.product.name,
                product: item.product.products.map(v => {
                  // return {
                  //   products: v.products.map(p => {
                  return {
                    name: v.detail.name,
                    count: v.count
                  }
                  //   })
                  // }
                }), // 订单商品
                phone: item.userInfo.phone, // 消费者手机号
                status: item.status, // 订单状态
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
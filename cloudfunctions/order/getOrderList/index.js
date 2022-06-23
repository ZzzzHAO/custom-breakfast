const cloud = require('wx-server-sdk');
const getOrderDetail = require('../getOrderDetail')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})

const _ = db.command
// 用户获取自己的订单列表
exports.main = async (event, context) => {
  const {
    pageNo,
    pageSize
  } = event
  try {
    const openid = cloud.getWXContext().OPENID // 用户openid
    let orderRes = await db.collection('wx-order').where({
        orderStatus: _.eq(2), // 只返回支付成功的订单
        userInfo: {
          openid
        }
      }).skip(pageSize * (pageNo - 1))
      .limit(pageSize) // 限制返回数量为 10 条
      .get()
    orderRes = orderRes.data
    let orderList = []
    if (orderRes.length) {
      const tasks = []
      orderRes.forEach(async (item) => {
        const orderNo = item._id
        const promise = getOrderDetail.main({
          orderNo
        })
        tasks.push(promise)
      })
      orderList = await Promise.all(tasks)
      orderList = orderList.map(item => item.data.detail)
      return {
        success: true,
        data: {
          orderList
        }
      }
    } else {
      return {
        success: true,
        data: {
          orderList
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
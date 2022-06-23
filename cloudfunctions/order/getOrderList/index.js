const cloud = require('wx-server-sdk');
const getOrderDetail = require('../getOrderDetail')
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
// 用户获取自己的订单列表
exports.main = async (event, context) => {
  const {
    type = 1,
      pageNo,
      pageSize
  } = event
  try {
    const openid = cloud.getWXContext().OPENID // 用户openid
    let orderStatus = {
      1: _.or(_.eq(PA_ORDER_STATUS.PAY_SUCCESS), _.eq(PA_ORDER_STATUS.DEAL_DONE)),
      2: _.eq(PA_ORDER_STATUS.PAY_SUCCESS),
      3: _.eq(PA_ORDER_STATUS.DEAL_DONE)
    } [type]
    let orderRes = await db.collection('wx-order').where({
        orderStatus,
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
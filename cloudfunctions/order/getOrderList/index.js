const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})
// 获取套餐list
exports.main = async (event, context) => {
  const {
    pageNo,
    pageSize
  } = event
  try {
    let orderRes = await db.collection('wx-order').where({
      _openid: cloud.getWXContext().OPENID
    }).skip(pageSize * (pageNo - 1))
      .limit(pageSize) // 限制返回数量为 10 条
      .get()
    orderRes = orderRes.data
    if (orderRes.length) {
      orderRes.forEach(async item => {
        const outTradeNo = item._id
        const childOrder = await db.collection('order').where({
          outTradeNo
        }).get()
        item.orders = childOrder.data
      })
      return {
        success: true,
        data: {
          orderList: orderRes
        }
      }
    } else {
      return {
        success: false,
        error: {
          message: '未查到门店内套餐'
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
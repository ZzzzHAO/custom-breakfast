const cloud = require('wx-server-sdk');
const moment = require('moment')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
// 获取商品详情
exports.main = async (event, context) => {
  const {
    packageId,
    range = ''
  } = event
  if (productId) {
    try {
      let packageRes = await db.collection('order').where({
        'product._id': 'ca780ad562a4743006daa0e84c332b31'
      }).count()
      console.log(packageRes)
    } catch (e) {
      return {
        success: false,
        error: e
      }
    }
  } else {
    return {
      success: false,
      error: {
        message: '请输入商品Id'
      }
    }
  }
}
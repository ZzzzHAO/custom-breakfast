const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
// 获取商品详情
exports.main = async (event, context) => {
  const {
    productId
  } = event
  if (productId) {
    try {
      let productRes = await db.collection('product').where({
        _id: productId + ''
      }).get()
      productRes = productRes.data
      if (productRes.length) {
        return {
          success: true,
          data: {
            ...productRes[0]
          }
        }
      } else {
        return {
          success: false,
          error: {
            message: '未找到该商品'
          }
        }
      }
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
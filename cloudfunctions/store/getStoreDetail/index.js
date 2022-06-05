const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
// 获取店铺详情
exports.main = async (event, context) => {
  const {
    storeId
  } = event
  if (storeId) {
    try {
      let storeRes = await db.collection('store').where({
        _id: storeId + ''
      }).get()
      storeRes = storeRes.data
      if (storeRes.length) {
        return {
          success: true,
          data: {
            ...storeRes[0]
          }
        }
      } else {
        return {
          success: false,
          error: {
            message: '未找到该店铺'
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
        message: '请输入门店Id'
      }
    }
  }
}
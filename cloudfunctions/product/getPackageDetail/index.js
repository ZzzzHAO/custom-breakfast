const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
// 获取banner云函数入口函数
exports.main = async (event, context) => {
  const {
    packageId
  } = event
  if (packageId) {
    try {
      let packageRes = await db.collection('package').where({
        _id: packageId + ''
      }).get()
      packageRes = packageRes.data
      if (packageRes.length) {
        return {
          success: true,
          data: {
            ...packageRes[0]
          }
        }
      } else {
        return {
          success: false,
          error: {
            message: '未找到该套餐'
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
        message: '请输入套餐Id'
      }
    }
  }
}
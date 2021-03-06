const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})
// 获取套餐详情
exports.main = async (event, context) => {
  const {
    packageId
  } = event
  if (packageId) {
    try {
      let packageRes = await db.collection('package').doc(packageId + '').get()
      packageRes = packageRes.data
      if (packageRes) {
        return {
          success: true,
          data: {
            ...packageRes
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
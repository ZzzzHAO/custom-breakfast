const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})
// 获取banner
exports.main = async (event, context) => {
  try {
    const bannerRes = await db.collection('banner').get()
    return {
      success: true,
      data: {
        banner: bannerRes.data.slice(0, 5)
      }
    }
  } catch (e) {
    return {
      success: false,
      error: e
    }
  }
}
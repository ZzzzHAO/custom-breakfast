const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
// 获取banner云函数入口函数
exports.main = async (event, context) => {
  const {
    storeId,
    pageNo,
    pageSize
  } = event
  try {
    const packageRes = await db.collection('package').where({
        store: storeId || '0a4ec1f96297164707fbcd7a39751170'
      }).skip(pageSize * (pageNo - 1))
      .limit(pageSize) // 限制返回数量为 10 条
      .get()
    return {
      success: true,
      data: {
        packageList: packageRes.data
      }
    }
  } catch (e) {
    return {
      success: false,
      error: e
    }
  }
}
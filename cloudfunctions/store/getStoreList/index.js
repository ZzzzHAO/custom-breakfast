const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
// 获取店铺list
exports.main = async (event, context) => {
  const {
    pageNo,
    pageSize
  } = event
  try {
    const storeRes = await db.collection('store').skip(pageSize * (pageNo - 1))
      .limit(pageSize) // 限制返回数量为 10 条
      .get()
    return {
      success: true,
      data: {
        storeList: storeRes.data
      }
    }
  } catch (e) {
    return {
      success: false,
      error: e
    }
  }
}
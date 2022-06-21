const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})
// 获取店铺list
exports.main = async (event, context) => {
  const {
    pageNo = 1,
      pageSize = 10
  } = event
  try {
    const storeRes = await db.collection('store').skip(pageSize * (pageNo - 1))
      .limit(pageSize) // 限制返回数量为 10 条
      .get()
    return {
      success: true,
      data: {
        storeList: storeRes.data.map(item => {
          return {
            id: item._id,
            name: item.name,
            address: item.address,
            openTime: item.openTime
          }
        })
      }
    }
  } catch (e) {
    return {
      success: false,
      error: e
    }
  }
}
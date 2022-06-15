const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})
// 获取商品列表
exports.main = async (event, context) => {
  const {
    storeId,
    pageNo,
    pageSize
  } = event
  try {
    const productData = await db.collection('product').where({
      store: storeId || '0a4ec1f96297164707fbcd7a39751170'
    }).skip(pageSize * (pageNo - 1))
      .limit(pageSize) // 限制返回数量为 10 条
      .get()
    return {
      success: true,
      data: {
        productList: productData.data
      }
    }
  } catch (e) {
    return {
      success: false,
      error: e
    }
  }
}
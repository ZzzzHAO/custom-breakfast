const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
// 获取套餐list
exports.main = async (event, context) => {
  const {
    package
  } = event
  try {
    // 获取套餐内商品
    const products = package.products // 套餐内 具体商品
    const tasks = [] // promise 异步数组
    products.forEach(item => {
      const promise = db.collection('product').where({
        _id: item.id
      }).get()
      tasks.push(promise)
    })
    let productsRes = await Promise.all(tasks)
    productsRes = productsRes.map(item => item.data[0])
    products.forEach(item => {
      for (let i = 0; i < productsRes.length; i++) {
        const snapshot = productsRes[i]
        // 如果有就保存快照 没有 则保存undefined
        if (snapshot) {
          if (item.id === snapshot._id) {
            item.detail = snapshot
          }
        } else {
          item.detail = undefined
        }
      }
    })
    return {
      success: true,
      data: {
        ...package
      }
    }
  } catch (e) {
    return {
      success: false,
      error: e
    }
  }
}
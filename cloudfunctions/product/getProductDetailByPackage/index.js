const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
const getProductDetail = async function (package) {
  // 获取套餐内商品
  const products = package.products // 套餐内 具体商品
  const tasks = [] // promise 异步数组
  products.forEach(item => {
    const promise = db.collection('product').doc(item.id).get()
    tasks.push(promise)
  })
  let productsRes = await Promise.all(tasks)
  productsRes = productsRes.map(item => item.data)
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
    ...package
  }
}

// 根据套餐获取商品快照
exports.main = async (event, context) => {
  const {
    packages
  } = event
  try {
    if (packages.length) {
      const tasks = []
      packages.forEach(item => {
        const promise = getProductDetail(item)
        tasks.push(promise)
      })
      const result = await Promise.all(tasks)
      return {
        success: true,
        data: {
          packages: result
        }
      }
    } else {
      return {
        success: false,
        error: {
          message: '请输入套餐列表'
        }
      }
    }
  } catch (e) {
    return {
      success: false,
      error: e
    }
  }
}
const cloud = require('wx-server-sdk');
const getProductDetailByPackage = require('../getProductDetailByPackage/index')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
// 获取套餐list
exports.main = async (event, context) => {
  const {
    storeId,
    pageNo,
    pageSize
  } = event
  try {
    let packageRes = await db.collection('package').where({
      store: storeId || '6d85a2b962a0adae0981cf6e396616d2'
    }).skip(pageSize * (pageNo - 1))
      .limit(pageSize) // 限制返回数量为 10 条
      .get()
    packageRes = packageRes.data
    console.log(packageRes)
    packageRes = packageRes.filter(item => item.onSale)
    console.log(packageRes)
    const tasks = []
    if (packageRes.length) {
      for (let i = 0; i < packageRes.length; i++) {
        let package = packageRes[i]
        const promise = getProductDetailByPackage.main({ package })
        tasks.push(promise)
      }
      let result = await Promise.all(tasks)
      result = result.map(item => item.data)
      result = result.map(item => {
        return {
          ...item,
          products: item.products.map(p => {
            return {
              id: p.id,
              count: p.count,
              name: p.detail.name
            }
          })
        }
      })
      return {
        success: true,
        data: {
          packageList: result
        }
      }
    } else {
      return {
        success: true,
        data: {
          packageList: []
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
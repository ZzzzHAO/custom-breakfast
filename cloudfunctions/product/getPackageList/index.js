const cloud = require('wx-server-sdk');
const getProductDetailByPackage = require('../getProductDetailByPackage/index')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})
// 获取套餐list
exports.main = async (event, context) => {
  const {
    storeId,
    pageNo,
    pageSize
  } = event
  try {
    let packageRes = await db.collection('package').where({
      storeId
    }).skip(pageSize * (pageNo - 1))
      .limit(pageSize) // 限制返回数量为 10 条
      .get()
    packageRes = packageRes.data
    packageRes = packageRes.filter(item => item.onSale)
    if (packageRes.length) {
      // 获取套餐商品详细信息
      let result = await getProductDetailByPackage.main({ packages: packageRes })
      if (result.success) {
        let packages = result.data.packages
        packages = packages.map(item => {
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
            packageList: packages
          }
        }
      } else {
        return {
          success: false,
          error: result.error
        }
      }
    } else {
      return {
        success: false,
        error: {
          message: '未查到门店内上架套餐'
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
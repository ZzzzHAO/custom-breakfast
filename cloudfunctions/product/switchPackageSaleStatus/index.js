const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})
// 上、下架套餐
exports.main = async (event, context) => {
  let {
    packages,
    onSale
  } = event
  try {
    if (onSale !== undefined) {
      const {
        OPENID
      } = cloud.getWXContext()
      let storeRes = await db.collection('store').where({
        _openid: OPENID,
      }).get()
      storeRes = storeRes.data && storeRes.data[0]
      if (storeRes) {
        if (!packages || packages.length === 0) { // 如果不传 则全部上下架
          packages = await db.collection('package').where({
            storeId: storeRes._id
          }).get()
          packages = packages.data.map(item => item._id)
        }
        console.log(packages)
        const length = packages.length
        const transaction = await db.startTransaction()
        // TODO:需要校验 商品是否都是上架状态
        for (let index = 0; index < length; index++) {
          const packageId = packages[index]
          await transaction.collection('package').doc(packageId).update({
            data: {
              onSale // 默认不上架
            }
          })
        }
        await transaction.commit()
        return {
          success: true,
          data: {}
        }
      } else {
        return {
          success: false,
          error: {
            message: '未找到您的门店信息，不能进行上/下架操作'
          }
        }
      }
    } else {
      return {
        success: false,
        error: {
          message: '上下架参数优化'
        }
      }
    }
  } catch (error) {
    return {
      success: false,
      error
    }
  }
};
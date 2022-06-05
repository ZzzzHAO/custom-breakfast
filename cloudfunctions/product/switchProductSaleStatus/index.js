const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
// 上、下架商品
exports.main = async (event, context) => {
  let {
    products,
    onSale = true
  } = event
  const length = products.length
  if (length) {
    try {
      const {
        OPENID
      } = cloud.getWXContext()
      let storeRes = await db.collection('store').where({
        creator: OPENID,
      }).get()
      storeRes = storeRes.data && storeRes.data[0]
      if (storeRes) {
        const transaction = await db.startTransaction()
        for (let index = 0; index < length; index++) {
          const item = products[index]
          await transaction.collection('product').where({
            _id: item
          }).update({
            data: {
              onSale // 默认不上架
            }
          })
          if (index === length - 1) {
            await transaction.commit()
            return {
              success: true,
              data: {}
            }
          }
        }
      } else {
        return {
          success: false,
          error: {
            message: '未找到您的门店信息'
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        error
      }
    }
  }
};
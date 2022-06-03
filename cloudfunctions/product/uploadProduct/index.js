const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
const _ = db.command
// 上架商品
exports.main = async (event, context) => {
  let {
    products
  } = event
  if (products.length) {
    try {
      const {
        OPENID
      } = cloud.getWXContext()
      const storeInfo = (await db.collection('store').where({
        creator: OPENID,
      }).get()).data[0]
      if (storeInfo) {
        const storeId = storeInfo._id
        products.forEach(async item => {
          await db.collection('product').add({
            data: {
              amount: +item.amount,
              image: item.image,
              name: item.name,
              price: +item.price,
              category: +item.category,
              stock: +item.stock,
              uploadTime: db.serverDate(),
              store: storeId,
              creator: OPENID
            }
          })
        })
        return {
          success: true,
          data: {}
        }
      } else {
        return {
          success: false,
          error: {
            message: '未找到门店信息'
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
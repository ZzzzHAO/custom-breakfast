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
      const storeInfo = await db.collection('store').where({
        owner: cloud.getWXContext().OPENID,
      }).get()
      const storeId = storeInfo.data[0]._id
      products.forEach(async item => {
        await db.collection('product').add({
          data: {
            amount: +item.amount * 100,
            image: item.image,
            name: item.name,
            price: +item.price * 100,
            category: +item.category,
            stock: +item.stock,
            uploadTime: db.serverDate(),
            store: storeId,
            creator: cloud.getWXContext().OPENID
          }
        })
      })
      return {
        success: true,
        data: {}
      }
    } catch (error) {
      return {
        success: false,
        error
      }
    }
  }
};
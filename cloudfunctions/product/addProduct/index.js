const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
const _ = db.command
// 录入商品
exports.main = async (event, context) => {
  let {
    products
  } = event
  const length = products.length
  if (length) {
    try {
      const {
        OPENID
      } = cloud.getWXContext()
      // 只有门店拥有者才能上传商品
      let storeRes = await db.collection('store').where({
        creator: OPENID,
      }).get()
      storeRes = storeRes.data && storeRes.data[0]
      if (storeRes) {
        const transaction = await db.startTransaction()
        const storeId = storeRes._id
        for (let index = 0; index < length; index++) {
          const item = products[index]
          await transaction.collection('product').add({
            data: {
              amount: +item.amount, // 成本价格
              image: item.image, // 图片
              name: item.name, // 商品民称
              price: +item.price, // 商品售价
              category: +item.category, // 商品品类
              onSale: false, // 默认不上架
              createTime: db.serverDate(), // 创建时间
              store: storeId, // 门店id
              creator: OPENID // 创建者
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
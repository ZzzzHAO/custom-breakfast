const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
const _ = db.command
// 删除商品
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
      let storeRes = await db.collection('store').where({
        creator: OPENID,
      }).get()
      storeRes = storeRes.data && storeRes.data[0]
      if (storeRes) {
        const storeId = storeRes._id
        const porductRes = await db.collection('product').where({
          _id: _.in(products),
          store: storeId
        }).get()
        // 是否找到全部商品
        if (porductRes.data && porductRes.data.length === products.length) {
          // 是否全部下架
          if (porductRes.data.every(item => !item.onSale)) {
            await db.runTransaction(async transaction => {
              await transaction.collection('product').where({
                _id: _.in(products),
                store: storeId
              }).remove()
            })
            return {
              success: true,
              data: {}
            }
          } else {
            return {
              success: false,
              error: {
                message: '商品还在上架状态，请先下架商品'
              }
            }
          }
        } else {
          return {
            success: false,
            error: {
              message: '商品查找错误，请重新核对'
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
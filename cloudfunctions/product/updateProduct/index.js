const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
const _ = db.command
// 更新商品信息
exports.main = async (event, context) => {
  let {
    productId,
    ...updteInfo
  } = event
  try {
    if (productId) {
      const {
        OPENID
      } = cloud.getWXContext()
      const productRes = await db.collection('product').doc(productId).get()
      const product = productRes.data
      if (product) {
        const storeRes = await db.collection('store').doc(product.store).get()
        const store = storeRes.data
        // 是否是店主
        if (store.creator === OPENID) {
          const transaction = await db.startTransaction()
          await transaction.collection('product').doc(productId).update({
            data: {
              amount: +updteInfo.amount || +product.amount,
              image: updteInfo.image || product.image,
              name: updteInfo.name || product.name,
              price: +updteInfo.price || +product.price,
              category: +updteInfo.category || +product.category,
              stock: +updteInfo.stock || +product.stock,
            }
          })
          await transaction.commit()
          return {
            success: true,
            data: {}
          }
        } else {
          return {
            success: false,
            error: {
              message: '您没有权限更新商品信息'
            }
          }
        }
      } else {
        return {
          success: false,
          error: {
            message: '未找到该商品'
          }
        }
      }
    } else {
      return {
        success: false,
        error: {
          message: '缺少productId字段'
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
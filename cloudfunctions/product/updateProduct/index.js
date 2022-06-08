const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
const _ = db.command
// 录入商品
exports.main = async (event, context) => {
  let {
    porductId,
    updteInfo
  } = event
  try {
    if (porductId) {
      const {
        OPENID
      } = cloud.getWXContext()
      const productRes = await db.collection('product').where({
        _id: porductId
      }).count()
      const total = productRes.total
      if (total === 1) {
        const transaction = await db.startTransaction()
        await transaction.collection('product').where({
          _id: porductId
        }).update({
          data: {
            amount: +updteInfo.amount,
            image: updteInfo.image,
            name: updteInfo.name,
            price: +updteInfo.price,
            category: +updteInfo.category,
            stock: +updteInfo.stock,
          }
        })
        await transaction.commit()
      } else {
        return {
          success: false,
          error: {
            message: total ? '商品信息有误请联系管理员' : '未找到该商品'
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
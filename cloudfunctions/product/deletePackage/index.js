const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})
const _ = db.command
// 删除套餐
exports.main = async (event, context) => {
  let {
    packages
  } = event
  const length = packages.length
  if (length) {
    try {
      const {
        OPENID
      } = cloud.getWXContext()
      let storeRes = await db.collection('store').where({
        _openid: OPENID,
      }).get()
      storeRes = storeRes.data && storeRes.data[0]
      if (storeRes) {
        const storeId = storeRes._id
        const packageRes = await db.collection('package').where({
          _id: _.in(packages),
          store: storeId
        }).get()
        // 是否找到全部商品
        if (packageRes.data && packageRes.data.length === packages.length) {
          // 是否全部下架
          if (packageRes.data.every(item => !item.onSale)) {
            await db.runTransaction(async transaction => {
              await transaction.collection('package').where({
                _id: _.in(packages),
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
                message: '套餐还在上架状态，请先下架商品'
              }
            }
          }
        } else {
          return {
            success: false,
            error: {
              message: '套餐查找错误，请重新核对'
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
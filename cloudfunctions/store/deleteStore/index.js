const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})
const _ = db.command
// 删除门店
exports.main = async (event, context) => {
  let {
    stores
  } = event
  const length = stores.length
  if (length) {
    try {
      const {
        OPENID
      } = cloud.getWXContext()
      let userRes = await db.collection('user').where({
        openId: OPENID
      }).get()
      userRes = userRes.data && userRes.data[0]
      // 只有管理员可以删除门店
      if (userRes && userRes.isAdmin) {
        // 获取店铺信息
        const storeRes = await db.collection('store').where({
          _id: _.in(stores),
        }).get()
        // 是否找到所有门店
        if (storeRes.data && storeRes.data.length === stores.length) {
          const transaction = await db.startTransaction()
          await transaction.collection('store').where({
            _id: _.in(stores)
          }).remove()
          await transaction.commit()
          return {
            success: true,
            data: {}
          }
        } else {
          return {
            success: false,
            error: {
              message: '未找到对应门店信息'
            }
          }
        }
      } else {
        return {
          success: false,
          error: {
            message: '您暂无权限，请联系管理员删除'
          }
        }
      }
    } catch (error) {
      console.log(error)
      return {
        success: false,
        error
      }
    }
  }
};
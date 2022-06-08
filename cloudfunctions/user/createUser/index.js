const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
const _ = db.command
// 删除套餐
exports.main = async (event, context) => {
  let {
    phone,
    store
  } = event
  const openId = cloud.getWXContext().OPENID;
  try {
    const result = await db.runTransaction(async transaction => {
      let userRes = await transaction.collection('user').where({
        openId
      }).get()
      userRes = userRes.data && userRes.data[0]
      console.log(userRes)
      if (!userRes) {
        const data = {
          phone,
          openId,
          createTime: db.serverDate()
        }
        // 如果是店铺员工 则追加店铺信息
        if (store) {
          data.store = store
        }
        await transaction.collection('user').add({
          data
        })
        return {
          success: true,
          data: {}
        }
      } else {
        await transaction.rollback(-100)
        // TODO 验证
        return {
          success: false,
          error: {
            message: '您已完成注册'
          }
        }
      }
    })
    return {
      ...result
    }
  } catch (error) {
    return {
      success: false,
      error
    }
  }
};
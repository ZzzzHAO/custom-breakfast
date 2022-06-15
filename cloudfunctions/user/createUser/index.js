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
    phone,
    openid
  } = event
  try {
    let userRes = await db.collection('user').where({
      _openid: openid
    }).get()
    userRes = userRes.data
    if (!userRes) {
      await db.collection('user').add({
        data: {
          _openid: openid,
          phone,
          createTime: db.serverDate()
        }
      })
      return {
        success: true,
        data: {}
      }
    } else {
      return {
        success: false,
        error: {
          message: '您已完成注册'
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
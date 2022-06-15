const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})
const _ = db.command
// 获取用户信息
exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID;
  try {
    let userRes = await db.collection('user').where({
      _openid: openid
    }).get()
    userRes = userRes.data && userRes.data[0]
    return {
      success: true,
      data: {
        userInfo: userRes
      }
    }
  } catch (error) {
    return {
      success: false,
      error
    }
  }
};
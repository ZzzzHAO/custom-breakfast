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
    code
  } = event
  try {
    const {
      OPENID
    } = cloud.getWXContext()
    let userRes = await db.collection('user').where({
      _openid: OPENID
    }).get()
    userRes = userRes.data && userRes.data[0]
    if (!userRes) {
      if (code) {
        // 获取用户手机号
        const phoneRes = await cloud.openapi.phonenumber.getPhoneNumber({
          code
        })
        const phone = phoneRes.phoneInfo && phoneRes.phoneInfo.phoneNumber // 下单人手机号
        await db.collection('user').add({
          data: {
            _openid: OPENID,
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
            message: '入参异常'
          }
        }
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
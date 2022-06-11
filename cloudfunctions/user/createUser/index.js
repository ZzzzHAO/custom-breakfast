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
    openId
  } = event
  try {
    let userRes = await db.collection('user').where({
      openId
    }).get()
    userRes = userRes.data && userRes.data[0]
    if (!userRes) {
      const transaction = await db.startTransaction()
      await transaction.collection('user').add({
        data: {
          phone,
          openId,
          createTime: db.serverDate()
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
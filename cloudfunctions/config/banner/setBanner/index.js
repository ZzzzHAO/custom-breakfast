const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
// 设置banner
exports.main = async (event, context) => {
  let {
    banner
  } = event
  if (banner.length) {
    try {
      // 新增
      await db.runTransaction(async transaction => {
        for (let i = 0; i < banner.length; i++) {
          const item = banner[i]
          await db.collection('banner').add({
            data: {
              name: item.name,
              image: item.image,
              jumpUrl: item.jumpUrl,
              validateTiem: item.validateTiem,
              createTime: db.serverDate(),
              creator: cloud.getWXContext().OPENID
            }
          })
          if (i === banner.length - 1) {
            await transaction.commit()
            return {
              success: true,
              data: {}
            }
          }
        }
      })
    } catch (error) {
      return {
        success: false,
        error
      }
    }
  }
};
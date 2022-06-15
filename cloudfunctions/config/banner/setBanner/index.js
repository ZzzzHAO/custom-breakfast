const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})
// 设置banner
exports.main = async (event, context) => {
  let {
    banner
  } = event
  if (banner.length) {
    try {
      // 新增
      const result = await db.runTransaction(async transaction => {
        for (let i = 0; i < banner.length; i++) {
          const item = banner[i]
          await db.collection('banner').add({
            data: {
              name: item.name,
              image: item.image,
              jumpUrl: item.jumpUrl,
              validateTiem: item.validateTiem,
              createTime: db.serverDate(),
              _openid: cloud.getWXContext().OPENID
            }
          })
          if (i === banner.length - 1) {
            return {
              success: true,
              data: {}
            }
          }
        }
      })
      return result
    } catch (error) {
      return {
        success: false,
        error
      }
    }
  }
};
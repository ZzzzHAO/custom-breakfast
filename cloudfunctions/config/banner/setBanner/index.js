const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
// 设置banner云函数入口函数
exports.main = async (event, context) => {
  let {
    banner
  } = event
  if (banner.length) {
    try {
      // 新增
      banner.forEach(async item => {
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
      })
      return {
        success: true,
        data: {}
      }
    } catch (error) {
      return {
        success: false,
        error
      }
    }
  }
};
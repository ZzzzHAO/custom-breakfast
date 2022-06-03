// 云函数入口文件
const banner = require('./banner/index')

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event._path) {
    case 'banner/getBanner':
      return await banner.getBanner.main(event, context);
    case 'banner/setBanner':
      return await banner.setBanner.main(event, context);
    default:
      return {
        success: false,
          error: {
            message: '系统异常，请稍后再试(1001)'
          }
      }
  }
}
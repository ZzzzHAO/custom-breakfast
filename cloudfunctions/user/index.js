// 云函数入口文件
const createUser = require('./createUser/index')
const getUser = require('./getUser/index')

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event._path) {
    case 'createUser':
      return await createUser.main(event, context);
    case 'getUser':
      return await getUser.main(event, context);
    default:
      return {
        success: false,
        error: {
          message: '系统异常，请稍后再试(1001)'
        }
      }
  }
}
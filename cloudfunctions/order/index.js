// 云函数入口文件
const createOrder = require('./createOrder/index')
const splitOrder = require('./splitOrder/index')

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event._path) {
    case 'createOrder':
      return await createOrder.main(event, context);
    case 'splitOrder':
      return await splitOrder.main(event, context);
    default:
      return {
        success: false,
        error: {
          message: '系统异常，请稍后再试(1001)'
        }
      }
  }
}
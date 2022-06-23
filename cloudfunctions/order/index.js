// 云函数入口文件
const createOrder = require('./createOrder/index')
const getOrderList = require('./getOrderList/index')
const getOrderDetail = require('./getOrderDetail/index')
const getOrderByCode = require('./getOrderByCode/index')
const distributeOrder = require('./distributeOrder/index')

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event._path) {
    case 'createOrder':
      return await createOrder.main(event, context);
    case 'getOrderList':
      return await getOrderList.main(event, context);
    case 'getOrderDetail':
      return await getOrderDetail.main(event, context);
    case 'getOrderByCode':
      return await getOrderByCode.main(event, context);
    case 'distributeOrder':
      return await distributeOrder.main(event, context);
    default:
      return {
        success: false,
          error: {
            message: '系统异常，请稍后再试(1001)'
          }
      }
  }
}
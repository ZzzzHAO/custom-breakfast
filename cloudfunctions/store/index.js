// 云函数入口文件
const createStore = require('./createStore/index')
const getStoreList = require('./getStoreList/index')

// 云函数入口函数
exports.main = async (event, context) => {

  switch (event._path) {
    case 'createStore':
      return await createStore.main(event, context);
    case 'getStoreList':
      return await getStoreList.main(event, context);
    default:
      return {
        success: false,
          error: {
            message: '系统异常，请稍后再试(1001)'
          }
      }
  }
}
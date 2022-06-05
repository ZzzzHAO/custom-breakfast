// 云函数入口文件
const createStore = require('./createStore/index')
const deleteStore = require('./deleteStore/index')
const getStoreList = require('./getStoreList/index')
const getStoreDetail = require('./getStoreDetail/index')

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event._path) {
    case 'createStore':
      return await createStore.main(event, context);
    case 'deleteStore':
      return await deleteStore.main(event, context);
    case 'getStoreList':
      return await getStoreList.main(event, context);
    case 'getStoreDetail':
      return await getStoreDetail.main(event, context);
    default:
      return {
        success: false,
          error: {
            message: '系统异常，请稍后再试(1001)'
          }
      }
  }
}
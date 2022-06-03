// 云函数入口文件
const downloadPackage = require('./downloadPackage/index')
const downloadProduct = require('./downloadProduct/index')
const getPackageDetail = require('./getPackageDetail/index')
const getPackageList = require('./getPackageList/index')
const getProductDetail = require('./getProductDetail/index')
const getProductList = require('./getProductList/index')
const uploadPackage = require('./uploadPackage/index')
const uploadProduct = require('./uploadProduct/index')

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event._path) {
    case 'downloadPackage':
      return await downloadPackage.main(event, context);
    case 'downloadProduct':
      return await downloadProduct.main(event, context);
    case 'getPackageDetail':
      return await getPackageDetail.main(event, context);
    case 'getPackageList':
      return await getPackageList.main(event, context);
    case 'getProductDetail':
      return await getProductDetail.main(event, context);
    case 'getProductList':
      return await getProductList.main(event, context);
    case 'uploadPackage':
      return await uploadPackage.main(event, context);
    case 'uploadProduct':
      return await uploadProduct.main(event, context);
    default:
      return {
        success: false,
          error: {
            message: '系统异常，请稍后再试(1001)'
          }
      }
  }
}
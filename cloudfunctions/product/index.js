// 云函数入口文件
const deletePackage = require('./deletePackage/index')
const deleteProduct = require('./deleteProduct/index')
const getPackageDetail = require('./getPackageDetail/index')
const getPackageList = require('./getPackageList/index')
const getProductDetail = require('./getProductDetail/index')
const getProductList = require('./getProductList/index')
const addPackage = require('./addPackage/index')
const addProduct = require('./addProduct/index')
const switchProductSaleStatus = require('./switchProductSaleStatus/index')
const switchPackageSaleStatus = require('./switchPackageSaleStatus/index')
const updateProduct = require('./updateProduct/index')
const updateProductStock = require('./updateProductStock/index')
const getProductDetailByPackage = require('./getProductDetailByPackage/index')

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event._path) {
    case 'deletePackage':
      return await deletePackage.main(event, context);
    case 'deleteProduct':
      return await deleteProduct.main(event, context);
    case 'updateProduct':
      return await updateProduct.main(event, context);
    case 'getPackageDetail':
      return await getPackageDetail.main(event, context);
    case 'getPackageList':
      return await getPackageList.main(event, context);
    case 'getProductDetail':
      return await getProductDetail.main(event, context);
    case 'getProductList':
      return await getProductList.main(event, context);
    case 'addPackage':
      return await addPackage.main(event, context);
    case 'addProduct':
      return await addProduct.main(event, context);
    case 'switchProductSaleStatus':
      return await switchProductSaleStatus.main(event, context);
    case 'switchPackageSaleStatus':
      return await switchPackageSaleStatus.main(event, context);
    case 'updateProductStock':
      return await updateProductStock.main(event, context);
    case 'getProductDetailByPackage':
      return await getProductDetailByPackage.main(event, context);
    default:
      return {
        success: false,
        error: {
          message: '系统异常，请稍后再试(1001)'
        }
      }
  }
}
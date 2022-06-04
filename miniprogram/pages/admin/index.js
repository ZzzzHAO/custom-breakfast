// pages/admin/index.js
import ajax from '../../common/ajax'
import products from './products'
import packages from './packages'
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  uploadBanner(e) {
    ajax.request('config/banner/setBanner', {
      banner: [{
        name: '轮播图',
        image: 'cloud://cloud1-3g1ptrnzda536c06.636c-cloud1-3g1ptrnzda536c06-1300751264/banner.jpg',
        jumpUrl: '',
        validateTiem: new Date(),
      }, {
        name: '轮播图',
        image: 'cloud://cloud1-3g1ptrnzda536c06.636c-cloud1-3g1ptrnzda536c06-1300751264/banner.jpg',
        jumpUrl: '',
        validateTiem: new Date(),
      }, {
        name: '轮播图',
        image: 'cloud://cloud1-3g1ptrnzda536c06.636c-cloud1-3g1ptrnzda536c06-1300751264/banner.jpg',
        jumpUrl: '',
        validateTiem: new Date(),
      }]
    }).then(res => {
      console.log(res)
    })
  },
  getBanner() {
    ajax.request('config/banner/getBanner').then(res => {
      this.setData({
        banner: res.banner
      })
    })
  },
  uploadProduct(e) {
    ajax.request('product/uploadProduct', {
      products: products.products
    }).then(res => {
      console.log(res)
    })
  },
  switchProductSaleStatus(e) {
    ajax.request('product/switchProductSaleStatus', {
      onSale: true,
      products: ['0ab5303b629a2d18078b86ae2e341643']
    }).then(res => {
      console.log(res)
    })
  },
  uploadPackage(e) {
    ajax.request('product/uploadPackage', {
      packages: packages.packages
    }).then(res => {
      console.log(res)
    })
  },
  switchPackageSaleStatus(e) {
    ajax.request('product/switchPackageSaleStatus', {
      onSale: true,
      packages: ['0a4ec1f9629a3950087bf95708fbd43a']
    }).then(res => {
      console.log(res)
    })
  },
  createStore(e) {
    if (e.detail.code) {
      ajax.request('store/createStore', {
        code: e.detail.code,
        name: '晨光烧饼',
        address: '浦驰路188弄',
        logo: '',
        openTime: new Date(),
        closeTime: new Date(),
      }).then(res => {
        console.log(res)
      })
    }
  },
  getStoreList(e) {
    ajax.request('store/getStoreList', {
      pageNo: 1,
      pageSize: 10
    }).then(res => {
      console.log(res)
    })
  },
  getProductList(e) {
    ajax.request('product/getProductList', {
      pageNo: 3,
      pageSize: 10
    }).then(res => {
      console.log(res)
    })
  },
  getProductDetail(e) {
    ajax.request('product/getProductDetail', {
      productId: '8f75309d62971838067fbf1820e1ab87'
    }).then(res => {
      console.log(res)
    })
  },
  getPackageList(e) {
    ajax.request('product/getPackageList', {
      pageNo: 1,
      pageSize: 10
    }).then(res => {
      console.log(res)
    })
  },
  getPackageDetail(e) {
    ajax.request('product/getPackageDetail', {
      packageId: '058dfefe6297370e06b390df00c6329a'
    }).then(res => {
      console.log(res)
    })
  }
})
// pages/admin/index.js
import ajax from '../../common/ajax'
import products from './products'
import packages from './packages'
const moment = require('moment')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isNewCustomer: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getUser()
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
  addProduct(e) {
    ajax.request('product/addProduct', {
      products: products.products
    }).then(res => {
      console.log(res)
    })
  },
  deleteProduct(e) {
    ajax.request('product/deleteProduct', {
      products: ['0ab5303b629a2d19078b86c769e6cb7b']
    }).then(res => {
      console.log(res)
    })
  },
  updateProduct(e) {
    ajax.request('product/updateProduct', {
      productId: '0ab5303b629a2d17078b869c4b62f87c',
      stock: 10000
    }).then(res => {
      console.log(res)
    })
  },
  updateProductStock(e) {
    ajax.request('product/updateProductStock', {
      outTradeNo: '317f3e0f38a14dd8ff7add1f71e0824f',
    }).then(res => {
      console.log(res)
    })
  },
  switchProductSaleStatus(e) {
    ajax.request('product/switchProductSaleStatus', {
      onSale: true, // 上架
      products: ['0ab5303b629a2d18078b86ae2e341643']
    }).then(res => {
      console.log(res)
    })
  },
  addPackage(e) {
    ajax.request('product/addPackage', {
      packages: packages.packages
    }).then(res => {
      console.log(res)
    })
  },
  deletePackage(e) {
    ajax.request('product/deletePackage', {
      packages: ['0a4ec1f9629a3950087bf95708fbd43a']
    }).then(res => {
      console.log(res)
    })
  },
  switchPackageSaleStatus(e) {
    ajax.request('product/switchPackageSaleStatus', {
      onSale: true, // 上架
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
  deleteStore(e) {
    ajax.request('store/deleteStore', {
      stores: ['0a4ec1f96297164707fbcd7a39751170']
    }).then(res => {
      console.log(res)
    })
  },
  getStoreList(e) {
    ajax.request('store/getStoreList', {
      pageNo: 1,
      pageSize: 10
    }).then(res => {
      console.log(res)
    })
  },
  getStoreDetail(e) {
    ajax.request('store/getStoreDetail', {
      storeId: '0a4ec1f96297164707fbcd7a39751170'
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
  },
  pay(e) {
    const params = {
      amount: 1,
      packages: [{
        id: '8f75309d629cb8c2072baed713629e52',
        date: moment(new Date()).format('YYYY-MM-DD')
      }]
      // packages: [{
      //   id: '8f75309d629cb8c2072baed713629e52',
      //   date: moment(new Date()).format('YYYY-MM-DD')
      // }, {
      //   id: '8f75309d629cb8c2072baed965ff21f5',
      //   date: moment(new Date()).add(1, 'd').format('YYYY-MM-DD')
      // }]
    }
    if (this.data.isNewCustomer) {
      const code = e.detail.code
      if (code) {
        params.code = e.detail.code
      } else {
        return
      }
    }
    wx.getLocalIPAddress({
      success(res) {
        params.ip = res.localip // ip地址
        ajax.request('order/createOrder', params).then(res => {
          console.log(res)
          wx.requestPayment({
            ...res,
            success(res) {
              console.log('pay success', res)
            },
          })
        })
      }
    })
  },
  getUser(e) {
    ajax.request('user/getUser').then(res => {
      let isNewCustomer = true
      if (res.userInfo) {
        isNewCustomer = false
      }
      this.setData({
        isNewCustomer
      })
    })
  }
})
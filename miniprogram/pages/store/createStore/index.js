// pages/store/createStore/index.js
import ajax from '../../../common/ajax'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isNewCustomer: true, // 是否是新用户
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getUserInfo()
  },

  // 获取用户信息
  getUserInfo(e) {
    ajax.request('user/getUserInfo').then(res => {
      console.log(res)
      let isNewCustomer = true
      if (res.userInfo) {
        isNewCustomer = false
      }
      this.setData({
        isNewCustomer
      })
    })
  },
  // 注册新用户
  reqister(e) {
    const code = e.detail.code
    if (code) {
      ajax.request('user/createUser', {
        code
      }).then(res => {
        this.setData({
          isNewCustomer: false
        })
        // 支付弹窗
        this.createStore()
      })
    } else {
      wx.showToast({
        title: '授权失败',
        icon: 'none'
      })
      return;
    }
  },
  createStore(e) {
    ajax.request('store/createStore', {
      name: '晨光烧饼',
      address: '浦驰路188弄',
      logo: '',
      takeUpTime: '上午8:00-上午10：00', // 取餐时间
    }).then(res => {
      console.log(res)
    })
  },
})
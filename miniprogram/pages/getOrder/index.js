// pages/queryOrder/index.js
import ajax from '../../common/ajax'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    code: '',
    focus: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  input(e) {
    const {
      value
    } = e.detail
    if (value.length === 4) {
      this.getOrderByCode(value)
    }
  },
  getOrderByCode(code) {
    ajax.request('order/getOrderByCode', {
      code
    }).then(res => {
      console.log(res)
    })
  },
  clear(e) {
    console.log(e)
    this.setData({
      code: '',
      focus: true
    })
  }
})
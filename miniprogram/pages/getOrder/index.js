// pages/queryOrder/index.js
import ajax from '../../common/ajax'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    seq: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  input(e) {
    this.setData({
      seq: e.detail.value
    })
  },
  getOrder(e) {
    ajax.request('order/getOrderByCode', {
      seq: this.data.seq
    }).then(res => {
      console.log(res)
    })
  }
})
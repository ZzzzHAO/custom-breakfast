// pages/home/index.js
import ajax from '../../common/ajax'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    banner: [],
    tabs: [{
      id: 1,
      name: '预约明天'
    }, {
      id: 2,
      name: '预约一周'
    }], // 首页标签数组
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.init()
  },

  init() {},
  getBanner() {
    ajax.request('config/banner/getBanner').then(res => {
      this.setData({
        banner: res.banner
      })
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
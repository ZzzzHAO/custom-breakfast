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

  init() {
    this.getBanner()
    this.getPackageList()
  },
  // 获取banner
  getBanner() {
    ajax.request('config/banner/getBanner').then(res => {
      console.log(res)
      this.setData({
        banner: res.banner
      })
    })
  },
  // 获取套餐list
  getPackageList(e) {
    ajax.request('product/getPackageList', {
      storeId: '6d85a2b962a0adae0981cf6e396616d2',
      pageNo: 1,
      pageSize: 10
    }).then(res => {
      console.log(res)
      this.setData({
        packages: res.packageList || []
      })
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
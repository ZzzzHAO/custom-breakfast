// pages/order/orderList/index.js
import ajax from '../../../common/ajax'
import {
  px2rpx,
  loop
} from '../../../common/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [{
      id: 1,
      name: '全部',
      refresh: false,
    }, {
      id: 2,
      name: '待付款',
      refresh: false,
    }, {
      id: 3,
      name: '待取餐',
      refresh: false,
    }, {
      id: 4,
      name: '已完成',
      refresh: false,
    }, {
      id: 5,
      name: '已取消',
      refresh: false,
    }], // 首页标签数组
    orderList: [],
    page: {
      pageSize: 10,
      pageNo: 1
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const tabsHeight = px2rpx(44) + 'rpx'
    const safeHeight = 'env(safe-area-inset-bottom)'
    this.setData({
      scrollStyle: `height: calc(100vh - ${tabsHeight} - ${safeHeight})`,
    });
    this.getOrderList()
  },
  async getOrderList() {
    const {
      page
    } = this.data
    ajax.request('order/getOrderList', page).then(res => {
      const {
        orderList
      } = res
      console.log(orderList)
      this.setData({
        orderList
      })
    })
  }
})
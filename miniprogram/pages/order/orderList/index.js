// pages/order/orderList/index.js
import ajax from '../../../common/ajax'
import {
  px2rpx,
} from '../../../common/util'
const moment = require('moment')
const PA_ORDER_STATUS = {
  1: '待付款',
  2: '买家已付款',
  3: '支付失败',
  4: '退款中',
  5: '退款成功',
  6: '退款失败',
  7: '部分退款',
  8: '交易完成',
}
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
      id: 3,
      name: '待取餐',
      refresh: false,
    }, {
      id: 4,
      name: '已完成',
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
    ajax.request('order/getOrderList', {
      ...page,
      type: 1
    }).then(res => {
      const {
        orderList
      } = res
      console.log(orderList)
      this.setData({
        orderList: orderList.map(item => {
          return {
            ...item,
            orderStatus: PA_ORDER_STATUS[item.orderStatus],
            orders: item.orders.map(order => {
              return {
                ...order,
                distributeDate: moment(order.distributeDate).format('YYYY-MM-DD')
              }
            })
          }
        })
      })
    })
  }
})
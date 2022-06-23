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
      page: {
        pageSize: 10,
        pageNo: 1
      },
    }, {
      id: 2,
      name: '待取餐',
      refresh: false,
      page: {
        pageSize: 10,
        pageNo: 1
      },
    }, {
      id: 3,
      name: '已完成',
      refresh: false,
      page: {
        pageSize: 10,
        pageNo: 1
      },
    }], // 首页标签数组
    orderList: [],
    allList: [], // TODO 放入tabs里
    undoneList: [],
    doneList: [],
    currentTabIndex: 0 // 当前tab
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

  tabChange(e) {
    this.setData({
      currentTabIndex: e.detail.index
    })
    this.getOrderList()
  },

  async getOrderList() {
    const {
      currentTabIndex,
      tabs,
    } = this.data
    const currentTab = tabs[currentTabIndex]
    ajax.request('order/getOrderList', {
      ...currentTab.page,
      type: currentTab.id
    }).then(res => {
      let {
        orderList,
        total
      } = res
      orderList = orderList.map(item => {
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
      const key = {
        0: 'allList',
        1: 'undoneList',
        2: 'doneList'
      }[currentTabIndex]
      this.setData({
        [key]: this.data[key].concat(orderList)
      })
    })
  }
})
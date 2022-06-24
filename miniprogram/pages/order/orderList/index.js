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
      loading: false, // 是否加载中
      refresh: false,
      inited: false, // 数据是否已初始化
      list: [],
      total: Infinity,
      page: {
        pageSize: 10,
        pageNo: 0
      },
    }, {
      id: 2,
      name: '待取餐',
      loading: false,
      refresh: false,
      inited: false, // 数据是否已初始化
      list: [],
      total: Infinity,
      page: {
        pageSize: 10,
        pageNo: 0
      },
    }, {
      id: 3,
      name: '已完成',
      loading: false,
      refresh: false,
      inited: false, // 数据是否已初始化
      list: [],
      total: Infinity,
      page: {
        pageSize: 10,
        pageNo: 0
      },
    }], // 首页标签数组
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
    const currentTabIndex = e.detail.index
    this.setData({
      currentTabIndex
    })
    if (!this.data.tabs[currentTabIndex].inited) { // 未初始化
      this.getOrderList()
    }
  },

  async getOrderList(refresh) {
    const {
      currentTabIndex,
      tabs,
    } = this.data
    const currentTab = tabs[currentTabIndex]
    // 判断是否全部加载
    if ((currentTab.list.length < currentTab.total) || refresh === true) {
      if (!currentTab.loading) {
        // loading状态
        this.setData({
          tabs: tabs.map((item, index) => {
            if (index === currentTabIndex) {
              return {
                ...item,
                loading: true
              }
            } else {
              return item
            }
          })
        })
        // 请求订单数据
        const pageNo = refresh ? 1 : this.data.tabs[currentTabIndex].page.pageNo + 1
        const pageSize = this.data.tabs[currentTabIndex].page.pageSize
        const res = await ajax.request('order/getOrderList', {
          pageNo,
          pageSize,
          type: currentTab.id
        })
        let {
          orderList,
          total
        } = res
        orderList = orderList.map(item => {
          return {
            ...item,
            orderStatus: PA_ORDER_STATUS[item.orderStatus], // 翻译订单状态
            orders: item.orders.map(order => {
              return {
                ...order,
                distributeDate: moment(order.distributeDate).format('YYYY-MM-DD') // 格式化配送时间
              }
            })
          }
        })
        this.setData({
          tabs: this.data.tabs.map((item, index) => {
            if (index === currentTabIndex) {
              return {
                ...item,
                inited: true, // 初始化完成
                total,
                loading: false,
                list: refresh ? orderList : [...item.list, ...orderList],
                page: {
                  ...item.page,
                  pageNo
                }
              }
            } else {
              return item
            }
          })
        })
      }
    }
  },

  async refresh() {
    const {
      currentTabIndex,
      tabs
    } = this.data

    if (!tabs[currentTabIndex].refresh) {
      this.setData({
        tabs: tabs.map((item, index) => {
          if (index === currentTabIndex) {
            return {
              ...item,
              refresh: true
            }
          } else {
            return item
          }
        })
      })
      // 刷新请求
      await this.getOrderList(true)
      this.setData({
        tabs: this.data.tabs.map((item, index) => {
          if (index === currentTabIndex) {
            return {
              ...item,
              refresh: false
            }
          } else {
            return item
          }
        })
      })
    }
  }
})
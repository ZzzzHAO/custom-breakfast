// pages/home/index.js
import ajax from '../../common/ajax'
import { px2rpx } from '../../common/util'
const moment = require('moment')
const DAY_ENUM = {
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
  0: '周日',
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    banner: [],
    tabs: [{
      id: 1,
      name: '预约明天',
      refresh: false,
    }, {
      id: 2,
      name: '预约一周',
      refresh: false,
    }], // 首页标签数组
    amountStr: '', // 按钮金额文案
    singleAmountStr: '', // 单天金额文案 缓存
    weekAmountStr: '', // 一周金额文案 缓存
    isNewCustomer: true,
    currentTab: 1, // 当前tab
    renderedList: [], // 已渲染tab
    showMenu: false, // 是否展示菜单
    checkedItem: {}, // 清空勾选项
    weekPackages: [], // 清空周套餐数组
    weekAmount: 0, // 周套餐价格
    scrollEnable: false, // 是否可滚动
    popupStyle: '' // 菜单样式
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.init() // 初始化
    const headerHeight = px2rpx(getApp().globalData.navPos.headerHeight) + 'rpx'; // 获取自定义头部高度
    const bannerHeight = '288rpx'
    const tabsHeight = px2rpx(44) + 'rpx'
    const safeHeight = 'env(safe-area-inset-bottom)'
    this.setData({
      scrollStyle: `height: calc(100vh - ${bannerHeight} - ${tabsHeight} - ${headerHeight} - ${safeHeight})`,
      wrapStyle: `padding-top: ${headerHeight}`,
      popupStyle: `height:100%;width: 60vw;background-color:#ff`,
      overlayStyle: `position: fixed;height: calc(100vh - ${headerHeight});top: ${headerHeight};over-folow:hidden`,
      wrapStyle: `position: fixed;height: calc(100vh - ${headerHeight});top: ${headerHeight};width: 100vw;background-color:red;`
    });
    setTimeout(() => {
      this.setData({
        scrollEnable: true
      })
    }, 900)
  },

  init() {
    this.getUser() // 获取用户信息
    this.getBanner() // 获取轮播图
    this.renderTab(this.data.currentTab) // 获取套餐列表
  },
  // 获取banner
  getBanner() {
    ajax.request('config/banner/getBanner').then(res => {
      this.setData({
        banner: res.banner
      })
    })
  },
  // 获取用户信息
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
  },
  // 获取套餐list
  async getPackageList(e) {
    const res = await ajax.request('product/getPackageList', {
      storeId: 'f6797f72feae4d74d1fa497ca3b47f82',
      pageNo: 1,
      pageSize: 10
    })
    const packages = res.packageList || []
    return packages
  },
  // 下啦刷新
  async refresh(e) {
    const tabId = e.currentTarget.dataset.id;
    const refreshTab = this.data.tabs.find((tab) => tab.id === tabId);
    if (!refreshTab.refresh) {
      let tabs = this.data.tabs.map((tab) => {
        if (tab.id === tabId) {
          return {
            ...tab,
            refresh: true,
          };
        } else {
          return tab;
        }
      });
      this.setData({
        tabs,
      });
      await this.renderTab(tabId, true);
      tabs = this.data.tabs.map((tab) => {
        if (tab.id === tabId) {
          return {
            ...tab,
            refresh: false,
          };
        } else {
          return tab;
        }
      });
      this.setData({
        tabs,
      });
    }
  },
  tabChange(e) {
    const tabId = e.detail.name;
    // 设为当前tab
    this.setData({
      currentTab: tabId,
      amountStr: tabId === 1 ? this.data.singleAmountStr : this.data.weekAmountStr,
    });
    // 如未渲染过 则render
    if (!this.data.renderedList.includes(tabId)) {
      this.renderTab(tabId);
    }
  },
  async renderTab(tabId, isRefresh) {
    // 将此pageId设置为已渲染
    if (!isRefresh) {
      this.setData({
        renderedList: [...this.data.renderedList, tabId], // 已渲染列表
        currentTab: tabId, // 当前page
      })
    }
    if (tabId === 1) {
      this.setData({
        isLoading: true,
        amountStr: '', // 文案清空
        checkedItem: {}, // 清空勾选项
      });
      const packages = await this.getPackageList()
      this.setData({
        packages,
      })
    } else if (tabId === 2) {
      this.setData({
        isLoading: true,
        amountStr: '', // 文案清空
        weekPackages: [], // 清空周套餐数组
        weekAmount: 0
      });
      let packages = await this.getPackageList()
      const length = packages.length
      if (length) {
        let dateArr = []
        for (let i = 0; i < 7; i++) {
          const dateObj = {}
          const next = i + 1
          dateObj.day = moment(new Date()).add(next, 'd').days()
          dateObj.dayStr = DAY_ENUM[moment(new Date()).add(next, 'd').days()]
          dateObj.date = moment(new Date()).add(next, 'd').format('YYYY-MM-DD')
          dateObj.dateStr = moment(new Date()).add(next, 'd').format('MM-DD')
          dateArr.push(dateObj)
        }
        dateArr = dateArr.filter(item => item.day !== 0 && item.day !== 6)
        dateArr = dateArr.slice(0, length)
        let amount = 0
        for (let i = 0; i < length; i++) {
          dateArr[i].package = packages[i]
          amount += packages[i].price
        }
        const amountStr = `    ${amount / 100}元`
        this.setData({
          weekPackages: dateArr,
          weekAmount: amount,
          weekAmountStr: amountStr,
          amountStr,
        })
      }
    }
  },
  moveUp(e) {
    const { index } = e.currentTarget.dataset
    let { weekPackages } = this.data
    if (index !== 0) {
      const currentPackage = weekPackages[index].package
      const lastPackage = weekPackages[index - 1].package
      weekPackages = weekPackages.map((v, i) => {
        if (i === index - 1) {
          return {
            ...v,
            package: currentPackage
          }
        } else if (i === index) {
          return {
            ...v,
            package: lastPackage
          }
        } else {
          return v
        }
      })
    }
    this.setData({
      weekPackages
    })
  },
  // 勾选套餐
  check(e) {
    const checkedItem = e.currentTarget.dataset.package
    const amountStr = `    ${checkedItem.price / 100}元`
    this.setData({
      checkedItem,
      singleAmountStr: amountStr,
      amountStr,
    })
  },
  // 支付
  pay(e) {
    const { currentTab, checkedItem, weekPackages, weekAmount, isNewCustomer } = this.data
    const params = {}
    if (isNewCustomer) {
      const code = e.detail.code
      if (code) {
        params.code = e.detail.code
      } else {
        wx.showToast({
          title: '授权失败',
          icon: 'none'
        })
        return;
      }
    }
    // 预约明天
    if (currentTab === 1) {
      if (checkedItem._id) {
        params.packages = [{
          id: checkedItem._id,
          date: moment(new Date()).add(1, 'd').format('YYYY-MM-DD')
        }]
        params.amount = checkedItem.price
      } else {
        wx.showToast({
          title: '请选择套餐',
          icon: 'none'
        })
        return
      }
    } else {
      // 预约一周
      if (weekPackages.length) {
        params.packages = weekPackages.map(item => {
          return {
            id: item.package._id,
            date: item.date
          }
        })
        params.amount = weekAmount
      } else {
        wx.showToast({
          title: '请选择套餐',
          icon: 'none'
        })
        return
      }
    }
    wx.getLocalIPAddress({
      success(res) {
        params.ip = res.localip // ip地址
        ajax.request('order/createOrder', params).then(res => {
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
  // 关闭菜单
  openMenu(e) {
    this.setData({
      showMenu: true
    })
  },
  // 关闭菜单
  closeMenu(e) {
    this.setData({
      showMenu: false
    })
  }
})
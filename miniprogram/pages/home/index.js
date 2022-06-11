// pages/home/index.js
import ajax from '../../common/ajax'
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
    disabled: true,
    amountStr: '', // 按钮金额文案
    singleAmountStr: '', // 单天金额文案 缓存
    weekAmountStr: '', // 一周金额文案 缓存
    isNewCustomer: true,
    currentTab: 1, // 当前tab
    renderedList: [], // 已渲染tab
    showMenu: false // 是否展示菜单
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.init() // 初始化
    const headerHeight = getApp().globalData.navPos.headerHeight; // 获取自定义头部高度
    this.setData({
      // 缓存
      headerHeight,
      // 内部滚动区高度： (屏幕高度:100vh - (底部安全距离:env(safe-area-inset-bottom) + banner高度:260rpx + tab标签高度:44px + 自定义头部高度:headerHeight))
      scrollStyle: `height: calc(100vh - (env(safe-area-inset-bottom) + 260rpx + 44px + ${headerHeight}px))`,
      // 外部滚动区 内边距：自定义头部高度
      wrapStyle: `padding-top: ${headerHeight}px`,
    });
  },

  init() {
    this.getUser() // 获取用户信息
    this.getBanner() // 获取轮播图
    this.renderTab(this.data.currentTab) // 获取套餐列表
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
    this.setData({
      packages
    })
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
      disabled: tabId === 1 ? (this.data.checkedItem ? false : true) : false
    });
    // 如未渲染过 则render
    if (!this.data.renderedList.includes(tabId)) {
      this.renderTab(tabId);
    }
  },
  async renderTab(tabId) {
    // 将此pageId设置为已渲染
    this.setData({
      renderedList: [...this.data.renderedList, tabId], // 已渲染列表
      currentTab: tabId, // 当前page
      isLoading: true,
      amountStr: ''
    });
    if (tabId === 1) {
      await this.getPackageList()
    } else if (tabId === 2) {
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
          amountStr,
          weekAmountStr: amountStr
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
  moveDown(e) {
    const { index } = e.currentTarget.dataset
    let { weekPackages } = this.data
    if (index !== weekPackages.length - 1) {
      const currentPackage = weekPackages[index].package
      const nextPackage = weekPackages[index + 1].package
      weekPackages = weekPackages.map((v, i) => {
        if (i === index) {
          return {
            ...v,
            package: nextPackage
          }
        } else if (i === index + 1) {
          return {
            ...v,
            package: currentPackage
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
      radio: checkedItem._id,
      checkedItem,
      disabled: false,
      amountStr,
      singleAmountStr: amountStr
    })
  },
  // 支付
  pay(e) {
    const { currentTab, disabled, checkedItem, weekPackages, weekAmount } = this.data
    if (!disabled) {
      const params = {}
      // 预约明天
      if (currentTab === 1 && checkedItem) {
        params.packages = [{
          id: checkedItem._id,
          date: moment(new Date()).add(1, 'd').format('YYYY-MM-DD')
        }]
        params.amount = checkedItem.price
      } else {
        // 预约一周
        params.packages = weekPackages.map(item => {
          return {
            id: item.package._id,
            date: item.date
          }
        })
        params.amount = weekAmount
      }
      if (this.data.isNewCustomer) {
        const code = e.detail.code
        if (code) {
          params.code = e.detail.code
        } else {
          return
        }
      }
      wx.getLocalIPAddress({
        success(res) {
          params.ip = res.localip // ip地址
          ajax.request('order/createOrder', params).then(res => {
            console.log(res)
            wx.requestPayment({
              ...res,
              success(res) {
                console.log('pay success', res)
              },
            })
          })
        }
      })
    } else {
      wx.showToast({
        title: '请选择套餐',
        icon: 'none'
      })
    }
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
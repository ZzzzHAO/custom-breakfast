// pages/home/index.js
import ajax from '../../common/ajax'
import {
  px2rpx,
  loop
} from '../../common/util'
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
    isNewCustomer: true,
    currentTab: 1, // 当前tab
    renderedList: [], // 已渲染tab
    checkedItem: {}, // 清空勾选项
    weekPackages: [], // 清空周套餐数组
    weekAmount: 0, // 周套餐价格
    popupStyle: '', // 菜单样式
    showDetail: false, // 是否展示订单详情
    showConfirm: false, // 是否展示订单确认
    discountStr: '', // 优惠文案
    takeTime: '', // 取餐时间
    dateArr: [], // 未来7天日期数组 （去除周六周日）
    showChagenPopup: false, // 是否展示选择套餐弹窗
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
    });
    // 未来七天初始化
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
    dateArr = dateArr.filter(item => item.day !== 0 && item.day !== 6) // 过滤 周六周日
    this.setData({
      dateArr,
      'tabs[0].name': `预约 ${dateArr[0].dateStr}`
    })
  },

  async init() {
    this.getBanner() // 获取轮播图
    this.getUserInfo() // 获取用户信息
    await this.getStoreList() // 获取门店列表
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
  getUserInfo(e) {
    ajax.request('user/getUserInfo').then(res => {
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
  async getStoreList(e) {
    const res = await ajax.request('store/getStoreList')
    const store = res.storeList && res.storeList[0]
    this.setData({
      storeInfo: store,
      takeUpTime: store.takeUpTime
    })
  },
  // 获取套餐list
  async getPackageList(e) {
    const res = await ajax.request('product/getPackageList', {
      storeId: this.data.storeInfo.id,
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
  // tab change事件
  tabChange(e) {
    const tabId = e.detail.name;
    // 设为当前tab
    this.setData({
      currentTab: tabId,
    });
    // 如未渲染过 则render
    if (!this.data.renderedList.includes(tabId)) {
      this.renderTab(tabId);
    }
  },
  // 渲染tab页
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
        checkedItem: {}, // 清空勾选项
      });
      await this.getPackageList()
    } else if (tabId === 2) {
      this.setData({
        isLoading: true,
        weekPackages: [], // 清空周套餐数组
        weekAmount: 0
      });
      let packages = await this.getPackageList()
      const length = packages.length
      if (length) {
        const dateArr = this.data.dateArr.slice(0, length)
        let amount = 0
        for (let i = 0; i < length; i++) {
          dateArr[i].package = packages[i]
          amount += packages[i].price
        }
        this.setData({
          weekPackages: dateArr,
          weekAmount: amount,
        })
        this.calcDiscount()
      }
    }
  },
  // 计算周套餐 优惠金额
  calcDiscount() {
    const {
      weekPackages
    } = this.data
    const discountAmount = weekPackages.reduce((acc, cur) => {
      return acc + (cur.package.oldPrice - cur.package.price)
    }, 0) || 0
    this.setData({
      discountStr: discountAmount ? `已优惠 ¥${discountAmount/100}` : ''
    })

  },
  // 勾选套餐
  check(e) {
    const checkedItem = e.currentTarget.dataset.package
    this.setData({
      checkedItem,
    })
  },
  // 隐藏订单确认弹窗
  confirmClose() {
    this.setData({
      showConfirm: false
    })
  },
  // 开关订单确认弹窗detail
  toogleDetail(e) {
    this.setData({
      showDetail: !this.data.showDetail
    })
  },
  // 支付
  goConfirm(e) {
    const {
      currentTab,
      checkedItem,
      weekPackages,
      weekAmount,
      isNewCustomer
    } = this.data
    const params = {
      ip: '',
      type: currentTab
    }
    // 预约明天
    if (currentTab === 1) {
      params.packages = [{
        id: checkedItem._id,
        date: this.data.dateArr[0].date,
        name: checkedItem.name,
        amount: checkedItem.oldPrice
      }]
      params.amount = checkedItem.oldPrice
      params.type = 1
    } else {
      // 预约一周
      params.packages = weekPackages.map(item => {
        return {
          id: item.package._id,
          date: item.date,
          name: item.package.name,
          amount: item.package.price
        }
      })
      params.amount = weekAmount
      params.type = 2
    }
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
    const self = this
    wx.getLocalIPAddress({
      success(res) {
        let ip = res.localip
        if (ip === 'unknown') {
          ip = '127.0.0.1'
        }
        params.ip = ip // ip地址
      },
      complete() {
        self.setData({
          showConfirm: true,
          showDetail: false, // 默认不展开
          orderParams: params
        })
      }
    })
  },
  // 支付
  pay() {
    const {
      orderParams,
    } = this.data
    const self = this
    ajax.request('order/createOrder', orderParams).then(res => {
      const outTradeNo = res.outTradeNo
      wx.requestPayment({
        ...res,
        success(payRes) {
          self.loopPayStatus(outTradeNo)
        },
        fail(payRes) {
          if (payRes.errMsg !== 'requestPayment:fail cancel') {
            wx.showToast({
              title: '支付失败(100001)',
              icon: 'none'
            })
          }
        }
      })
    })
  },
  // 轮训支付结果
  loopPayStatus(outTradeNo) {
    const loopInterval = [0, 500, 1000, 1000]
    loop((done, fail, order) => {
      setTimeout(async () => {
        const result = await ajax.request('order/getOrderDetail', {
          orderNo: outTradeNo
        })
        if (result.detail.orderStatus !== 1) { // 不为已创建 则表示支付状态已经翻转
          done(() => {
            if (result.detail.orderStatus === 2) { // 支付成功
              wx.showToast({
                title: '支付成功',
                icon: 'none',
                success() {
                  wx.navigateTo({
                    url: '/pages/order/orderList/index',
                  })
                }
              })
              this.setData({
                showConfirm: false
              })
            } else if (result.detail.orderStatus === 3) { // 支付失败
              wx.showToast({
                title: '支付失败(100003)',
                icon: 'none'
              })
            } else {
              wx.showToast({
                title: '支付失败(100004)', // 支付异常
                icon: 'none'
              })
            }
          })
        } else {
          fail(() => {
            wx.showToast({
              title: '支付失败(100002)',
              icon: 'none'
            })
          })
        }
      }, loopInterval[order])
    })(4)
  },
  // 去订单列表
  goOrderList(e) {
    wx.navigateTo({
      url: '/pages/order/orderList/index',
    })
  },
  // 关闭修改弹窗
  changePopupClose(e) {
    this.setData({
      showChagenPopup: false
    })
  },
  // 打开修改弹窗
  openChangePopup(e) {
    const date = e.currentTarget.dataset.date
    const current = this.data.weekPackages.find(item => item.dateStr === date)
    const currentSelectPackage = current.package
    const currentSelectDate = current.dateStr
    this.setData({
      showChagenPopup: true,
      currentSelectPackage,
      currentSelectDate
    })
  },
  // 选择要改为哪种套餐
  choosePackage(e) {
    const currentSelectPackage = e.currentTarget.dataset.package
    this.setData({
      currentSelectPackage
    })
  },
  // 确认修改
  changePackage(e) {
    const {
      weekPackages,
      packageChangeTo,
      currentSelectDate,
      currentSelectPackage
    } = this.data
    const newWeekPackages = weekPackages.map(item => {
      console.log(item.dateStr)
      if (item.dateStr === currentSelectDate) {
        return {
          ...item,
          package: currentSelectPackage
        }
      } else {
        return item
      }
    })
    this.setData({
      showChagenPopup: false,
      weekPackages: newWeekPackages
    })
    this.calcDiscount() // 计算优惠金额
  },
  // 图片预览
  preview(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.url, // 当前显示图片的 http 链接
      urls: [e.currentTarget.dataset.url] // 需要预览的图片 http 链接列表
    })
  }
})
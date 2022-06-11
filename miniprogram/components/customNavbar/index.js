const {
  globalData
} = getApp()
const navPos = globalData.navPos
Component({
  // 放开样式，让外面的可以传过来
  options: {
    styleIsolation: 'apply-shared'
  },
  /**
   * 组件的属性列表
   */
  properties: {
    // 标题
    title: String,
    // 标题颜色
    titleColor: {
      type: String,
      value: '#000'
    },
    // 返回箭头颜色
    backIconColor: String,
    showBack: {
      type: Boolean,
      value: true
    },
    showPerson: {
      type: Boolean,
      value: false
    },
    // 文本是否剧中，是的话左边留位置
    textCenter: {
      type: Boolean,
      value: false
    },
    // 是否默认返回, 设置成false, 可以通过 bindback 取到事件
    autoBack: {
      type: Boolean,
      value: true
    },
    // 
    noBg: Boolean
  },
  /**
   * 组件的初始数据
   */
  data: {
    navPos,
    centerStyle: ''
  },
  ready() {
    this.getStyle()
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 中间区域样式
    getStyle() {
      if (!this.data.textCenter && !this.data.title) return
      const distance = navPos.right - (this.data.showBack ? 20 : 0)
      this.setData({
        centerStyle: 'padding-left:' + distance + 'px;text-align:center;'
      })
    },
    // 点返回的操作
    goBackPage() {
      const pageList = getCurrentPages()
      // 允许自动跳转
      if (this.data.autoBack) {
        if (pageList.length > 1) {
          if (this.data.title === '收银台') { // 收银台不能回退上个页面
            wx.redirectTo({
              url: `/orderPages/orderList/index?type=pendingPayment`,
            })
          } else { // 回退上个页面
            wx.navigateBack({
              delta: 1
            })
          }
        } else {
          wx.switchTab({
            url: '/pages/home/index',
          })
        }
      }
      // 抛出事件
      this.triggerEvent('back')
    },
    // person点击
    clickPerson(e) {
      this.triggerEvent('clickPerson')
    }
  },
});

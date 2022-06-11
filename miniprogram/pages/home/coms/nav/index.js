// pages/seckill/components/nav/index.js
const { globalData } = getApp();
const navPos = globalData.navPos;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showBack: {
      type: Boolean,
      value: true,
    },
    // 文本是否剧中，是的话左边留位置
    textCenter: {
      type: Boolean,
      value: false,
    },
    // 是否默认返回, 设置成false, 可以通过 bindback 取到事件
    autoBack: {
      type: Boolean,
      value: true,
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    navPos,
    centerStyle: "",
  },
  ready() {
    this.getStyle();
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 中间区域样式
    getStyle() {
      if (!this.data.textCenter) return;
      const distance = navPos.right - (this.data.showBack ? 20 : 0);
      this.setData({
        centerStyle: "padding-left:" + distance + "px;text-align:center;",
      });
    },
    // 点返回的操作
    goBackPage() {
      const pageList = getCurrentPages();
      // 允许自动跳转
      if (this.data.autoBack && pageList.length > 1) {
        wx.navigateBack({
          delta: 1,
        });
      }
      // 抛出事件
      this.triggerEvent("back");
    },
  },
});

const { Utils } = getApp()
Component({
  /**
   * 页面的初始数据
   */
  data: {
    // 选中第几个
    selected: 0,
    list: [
      {
        url: "/pages/home/index",
        name: "首页",
        count: "",
        iconUrl: "./icon/home.svg",
        iconActiveUrl: "./icon/home-select.svg",
      },
      {
        url: "/pages/category/index",
        name: "分类",
        count: "",
        iconUrl: "./icon/sort.svg",
        iconActiveUrl: "./icon/sort-selected.svg",
      },
      {
        url: "/pages/chat/index",
        name: "聊天",
        count: "",
        iconUrl: "./icon/chat.svg",
        iconActiveUrl: "./icon/chat-selected.svg",
      },
      {
        url: "/pages/cart/index",
        name: "购物车",
        count: "",
        iconUrl: "./icon/cart.svg",
        iconActiveUrl: "./icon/cart-selected.svg",
      },
      {
        url: "/pages/mine/index",
        name: "我的",
        count: "",
        iconUrl: "./icon/mine.svg",
        iconActiveUrl: "./icon/mine-selected.svg",
      },
    ],
  },
  methods: {
    async changeTabBar(e) {
      const { index, url } = e.currentTarget.dataset;
      if (index == this.data.selected) return;
      // tab切换时请求认证状态，做弹窗拦截(除了个人中心，个人中心页面会单独请求)
      if (index !== 4) {
        Utils.getAuthStatus(url);
      }
      // 首页/分类不用校验登陆
      if (/0|1/.test(index)) {
        this.goPage(index, url);
        return;
      }
      Utils.loginValidate(() => {
        this.goPage(index, url);
      }, url);
    },
    goPage(index, url) {
      this.setData({
        selected: index,
      });
      wx.switchTab({
        url,
      });
    },
  },
});

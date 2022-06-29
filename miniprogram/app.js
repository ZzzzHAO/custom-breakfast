// app.js
import "./common/overrideWX.js";
App({
  globalData: {
    navPos: {}, // 获取导航数据
  },
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      });
    }
    this.getNavPos();
  },
  // 获取导航的数据
  getNavPos() {
    // 获取菜单按钮（右上角胶囊按钮)位置信息
    const { height, top, left, width, right } =
      wx.getMenuButtonBoundingClientRect();
    const systemInfo = (this.globalData.systemInfo = wx.getSystemInfoSync());
    // 状态栏高度
    const statusBarHeight = systemInfo.statusBarHeight;
    // 总的窗宽度
    const winWidth = systemInfo.windowWidth;
    // 胶囊与状态栏的距离
    const distance = top - statusBarHeight;
    // 导航所占的高度
    const fullHeight = distance * 2 + height;
    this.globalData.navPos = {
      // 导航剩下的宽度
      surplusWidth: left,
      // 导航实际高度与上下的空隙
      distance,
      // 状态栏高度
      top: statusBarHeight,
      //可用区域距离右边的距离
      right: winWidth - left,
      // 不算上下边距
      height,
      // 导航高度，算上上下边距
      fullHeight,
      // 导航 + 状态栏
      headerHeight: fullHeight + statusBarHeight,
    };
  }
});
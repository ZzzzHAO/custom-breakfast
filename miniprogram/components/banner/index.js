// components/banner/index.js 轮播组件
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Array,
      value: [],
    },
  },

  observers: {
    data(value) {
      this.setData({
        banner: value.sort(),
      });
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    banner: [],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 跳转至banner落地页
    jumpUrl(e) {
      const url = e.currentTarget.dataset.url; // 跳转url
    },
  },
});
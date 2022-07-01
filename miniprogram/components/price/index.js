import {
  normalizeUnits
} from "moment";

// components/amount/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    value: {
      type: Number
    },
    size: {
      type: String,
      value: 'medium'
    },
    color: {
      type: String,
      value: '#333'
    },
    bold: {
      type: Boolean,
      value: false
    },
    discount: {
      type: Boolean,
      value: false
    }
  },

  observers: {
    value: function (val) {
      let priceString = val + ''
      if (priceString) {
        const value = Number(val)
        const options = {
          style: 'currency',
          currency: 'CNY',
        };
        priceString = value.toLocaleString('zh-CN', options);
        const symbol = priceString.slice(0, 1)
        const int = priceString.slice(1).split('.')[0]
        const float = priceString.slice(1).split('.')[1]
        this.setData({
          symbol,
          int,
          float
        })
      }
      this.setData({
        priceString,
      })
    },
  },

  attached(e) {
    this.setData({
      priceStyle: `color:${this.data.color};font-weight:${this.data.bold?'bold':'normal'};font-family:${this.data.bold?'PingFangSC-Semibold':'PingFangSC-Regular'}`
    })
  },


  /**
   * 组件的初始数据
   */
  data: {
    priceStyle: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
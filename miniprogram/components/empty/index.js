// 列表为空时的组件
// 不同类型下的图片
const typeMap = {
  address: {
    img: './img/address.svg',
    text: '暂无收货地址'
  },
  cart: {
    img: './img/cart.svg',
    text: '您的购物车空空如也'
  },
  coupon: {
    img: './img/coupon.svg',
    text: '暂无优惠券'
  },
  invoice: {
    img: './img/invoice.svg',
    text: '暂无发票信息'
  },
  order: {
    img: './img/order.svg',
    text: '暂无订单/服务单信息'
  },
  search: {
    img: './img/search.svg',
    text: '没有找到商品'
  },
  default: {
    img: './img/default.svg',
    text: '暂无数据'
  }
}
Component({
  // 开放外面样式，可以传进来
  options: {
    styleIsolation: 'shared'
  },
  /**
   * 组件的属性列表
   */
  properties: {
    // 那种类型(typeMap)
    type: {
      type: String,
      value: 'default'
    },
    // 下方文本
    text: String,
    // 图片地址
    imgUrl: String,
    // 可以隐藏文本，然后自定义
    hideText: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    currnetObj: {
      img: '',
      text: ''
    }
  },
  ready () {
    this.setCurrentInfo()
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 根据传进来的type组装数据
    setCurrentInfo () {
      const type = this.data.type
      let obj = typeMap[type]
      if (!obj) {
        obj = typeMap['default']
      }
      const  currnetObj = {... obj}
      if (this.data.text) {
        currnetObj.text = this.data.text
      }
      if (this.data.imgUrl) {
        currnetObj.img = this.data.imgUrl
      }
      this.setData({
        currnetObj
      })
    }
  }
})

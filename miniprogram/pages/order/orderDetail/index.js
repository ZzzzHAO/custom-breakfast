// pages/order/orderDetail/index.js
import ajax from '../../../common/ajax'
const moment = require('moment')
const PA_ORDER_STATUS = {
  1: '待付款',
  2: '买家已付款',
  3: '支付失败',
  4: '退款中',
  5: '退款成功',
  6: '退款失败',
  7: '部分退款',
  8: '交易完成',
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderInfo: null // 订单详情
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      orderNo: options.orderNo
    })
    this.getOrderDetail()
  },
  // 获取订单详情
  getOrderDetail() {
    const {
      orderNo
    } = this.data
    ajax.request('order/getOrderDetail', {
      orderNo
    }).then(res => {
      console.log(res)
      const orderInfo = res.detail
      if (res.detail) {
        this.setData({
          orderInfo: {
            ...orderInfo,
            orderStatus: PA_ORDER_STATUS[orderInfo.orderStatus],
            createTime: moment(orderInfo.createTime).format('YYYY-MM-DD HH:MM:SS'),
            payTime: moment(orderInfo.payTime).format('YYYY-MM-DD HH:MM:SS'),
            dealTime: moment(orderInfo.dealTime).format('YYYY-MM-DD HH:MM:SS')
          }
        })
      }
    })
  }
})
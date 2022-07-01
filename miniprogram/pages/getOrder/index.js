// pages/queryOrder/index.js
import ajax from '../../common/ajax'
const moment = require('moment')
const CH_ORDER_STATUS = {
  1: '待支付',
  2: '支付成功',
  3: '支付失败',
  4: '退款中',
  5: '退款成功',
  6: '退款失败',
  7: '交易完成',
}
const DISTRIBUTE_STATUS = {
  0: '待配送',
  1: '已配送',
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    code: '', // 取餐码
    focus: true, // input 聚焦
    orderInfo: null, // 订单信息
    showDatePicker: false, // 是否展示 DatePicker
    currentDate: new Date().getTime(), // datepicker value值
    currentDateStr: moment(new Date()).format('YYYY-MM-DD'), // datepicker value值
    dateFormatter: (type, value) => {
      if (type === "year") {
        return `${value}年`;
      }
      if (type === "month") {
        return `${value}月`;
      }
      if (type === "day") {
        return `${value}日`;
      }
      return value;
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  input(e) {
    const {
      value
    } = e.detail
    if (value.length === 4) {
      this.setData({
        code: value
      })
      this.getOrderByCode()
    } else {
      this.setData({
        orderInfo: null
      })
    }
  },
  // 通过取餐码获取订单信息
  getOrderByCode() {
    const code = this.data.code
    if (code) {
      ajax.request('order/getOrderByCode', {
        code,
        date: this.data.currentDateStr
      }).then(res => {
        let {
          orderList
        } = res
        if (orderList.length) {
          const orderInfo = orderList[0]
          this.setData({
            orderInfo: {
              ...orderInfo,
              statusStr: CH_ORDER_STATUS[orderInfo.status],
              distributeStatusStr: DISTRIBUTE_STATUS[orderInfo.distributeStatus],
              phoneMask: `${orderInfo.phone.substr(0,3)}****${orderInfo.phone.substr(-4)}`
            },
            focus: false
          })
        }
      }).catch(e => {
        this.setData({
          orderInfo: null
        })
      })
    }
  },
  // 清空输入框
  clear(e) {
    this.setData({
      code: '',
      focus: true,
      orderInfo: null
    })
  },
  // 拨打客户电话
  callPhone(e) {
    const {
      phone
    } = e.target.dataset
    wx.makePhoneCall({
      phoneNumber: phone //仅为示例，并非真实的电话号码
    })
  },
  // 配送
  distribute(e) {
    const orderInfo = this.data.orderInfo
    ajax.request('order/distributeOrder', {
      orderNo: orderInfo.orderNo
    }).then(res => {
      this.getOrderByCode()
    })
  },
  // 打开时间选择器
  openDatePicker(e) {
    this.setData({
      showDatePicker: true,
    });
  },
  // 时间选择器 隐藏
  hideDatePicker(val) {
    this.setData({
      showDatePicker: false,
    });
  },
  // 时间选择器确认事件
  handleDatePicker(val) {
    this.setData({
      currentDate: val.detail,
      currentDateStr: moment(val.detail).format('YYYY-MM-DD'),
      showDatePicker: false,
    })
    if (this.data.code && this.data.code.length === 4) {
      this.getOrderByCode()
    }
  },
  goDetail(e) {
    const {
      no
    } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/order/orderDetail/index?orderNo=${no}`,
    })
  }
})
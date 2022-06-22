const PA_ORDER_STATUS = {
  CREATE_SUCCESS: 1, // 已创建
  PAY_SUCCESS: 2, // 支付成功
  PAY_FAIL: 3, // 支付失败
  REFUND_ING: 4, // 退款中
  REFUND_SUCCESS: 5, // 退款成功
  REFUND_FAIL: 6, // 退款失败
  PART_REFUND: 7, // 部分退款
  DEAL_DONE: 8 // 交易完成 
}
const CH_ORDER_STATUS = {
  CREATE_SUCCESS: 1, // 已创建
  PAY_SUCCESS: 2, // 支付成功
  PAY_FAIL: 3, // 支付失败
  REFUND_ING: 4, // 退款中
  REFUND_SUCCESS: 5, // 退款成功
  REFUND_FAIL: 6, // 退款失败
  DEAL_DONE: 7 // 交易完成 
}

const DISTRIBUTE_STATUS = {
  NO: 0, // 待配送
  YES: 1 // 已配送
}

const ORDER_TYPE = {
  DAY: 1, // 单天订单
  WEEK: 2 // 一周订单
}
module.exports = {
  PA_ORDER_STATUS,
  CH_ORDER_STATUS,
  DISTRIBUTE_STATUS
}
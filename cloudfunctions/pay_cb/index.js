const cloud = require('wx-server-sdk');
const {
  PA_ORDER_STATUS,
  CH_ORDER_STATUS
} = require('./const')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})
const _ = db.command
// 微信支付回调
exports.main = async (event, context) => {
  try {
    const {
      outTradeNo,
      resultCode,
      returnCode
    } = event
    let paStatus = PA_ORDER_STATUS.PAY_FAIL // 支付失败
    let chStatus = CH_ORDER_STATUS.PAY_FAIL // 支付失败
    if (returnCode === 'SUCCESS' && resultCode === 'SUCCESS') {
      paStatus = PA_ORDER_STATUS.PAY_SUCCESS // 支付成功
      chStatus = CH_ORDER_STATUS.PAY_SUCCESS // 支付成功
    }
    const transaction = await db.startTransaction()
    await transaction.collection('wx-order').doc(outTradeNo).update({
      data: {
        orderStatus: paStatus, // 支付状态翻转
        payResult: {
          success: paStatus === PA_ORDER_STATUS.PAY_SUCCESS,
          detail: event
        }, // 支付结果
        payTime: db.serverDate() // 支付时间
      }
    })
    await transaction.collection('order').where({
      outTradeNo
    }).update({
      data: {
        orderStatus: chStatus, // 支付状态翻转
      }
    })
    await transaction.commit()
    // TODO 失败处理
    return {
      errcode: 0
    }
  } catch (error) {
    // 始终通知微信：已收到支付结果
    return {
      errcode: 0
    }
  }
};
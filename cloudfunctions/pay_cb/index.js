const cloud = require('wx-server-sdk');
const {
  PA_ORDER_STATUS,
  CH_ORDER_STATUS,
  DISTRIBUTE_STATUS
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
    // 更新销量结果
    const updateSalesResult = {
      success: false, // 销量和库存是否更新成功
      error: {}
    }
    // 拆单结果
    const splitOrderResult = {
      success: false, // 拆单是否成功
      error: {}
    }
    if (returnCode === 'SUCCESS' && resultCode === 'SUCCESS') {
      paStatus = PA_ORDER_STATUS.PAY_SUCCESS // 支付成功
      // 更新销量
      const updateRes = await cloud.callFunction({
        name: 'product',
        data: {
          _path: 'updateSales',
          outTradeNo
        }
      })
      updateSalesResult.success = updateRes.result.success
      if (!updateSalesResult.success) {
        updateSalesResult.error = updateRes.result.error
      }
      // 支付成功拆分订单
      const splitRes = await cloud.callFunction({
        name: 'order',
        data: {
          _path: 'splitOrder',
          outTradeNo
        }
      })
      splitOrderResult.success = splitRes.result.success
      if (!splitOrderResult.success) {
        splitOrderResult.error = splitRes.result.error
      }
    }
    const transaction = await db.startTransaction()
    await transaction.collection('wx-order').doc(outTradeNo).update({
      data: {
        updateSalesResult,// 更新销量结果
        splitOrderResult, // 拆单结果
        orderStatus: paStatus, // 支付状态翻转
        payResult: {
          success: paStatus === PA_ORDER_STATUS.PAY_SUCCESS,
          detail: event
        }, // 支付结果
        payTime: db.serverDate() // 支付时间
      }
    })
    await transaction.commit()
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
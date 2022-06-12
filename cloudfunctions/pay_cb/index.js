const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})
const _ = db.command
// 微信支付回调
exports.main = async (event, context) => {
  const {
    outTradeNo,
    resultCode,
    returnCode
  } = event
  let status = 2 // 支付失败
  let wxStatus = 4 // 支付失败
  if (returnCode === 'SUCCESS' && resultCode === 'SUCCESS') {
    status = 1 // 支付成功
    wxStatus = 3 // 支付成功
    await cloud.callFunction({
      name: 'product',
      data: {
        _path: 'updateProductStock',
        outTradeNo
      }
    })
  }
  const transaction = await db.startTransaction()
  await transaction.collection('order').where({
    outTradeNo
  }).update({
    data: {
      status // 支付状态翻转
    }
  })
  await transaction.collection('wx-order').doc(outTradeNo).update({
    data: {
      status: wxStatus, // 支付状态翻转
      payResult: event, // 支付结果
      payTime: db.serverDate() // 支付时间
    }
  })
  await transaction.commit()
  return {
    errcode: 0
  }
};
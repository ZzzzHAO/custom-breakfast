const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})
const _ = db.command
// 录入商品
exports.main = async (event, context) => {
  const {
    outTradeNo,
    resultCode,
    returnCode
  } = event
  const transaction = await db.startTransaction()
  let status = 2 // 支付失败
  if (returnCode === 'SUCCESS' && resultCode === 'SUCCESS') {
    status = 1 // 支付成功
    // TODO 更新商品库存
  }
  await transaction.collection('order').where({
    outTradeNo
  }).update({
    data: {
      status, // 支付状态翻转
      result: event
    }
  })
  await transaction.commit()
  return {
    errcode: 0
  }
};
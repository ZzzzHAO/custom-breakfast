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
  const transaction = await db.startTransaction()
  await transaction.collection('order').where({
    _id: event.outTradeNo,
  }).update({
    data: {
      status: 1,
      payResult: event
    }
  })
  await transaction.commit()
  return {
    errcode: 0
  }
};
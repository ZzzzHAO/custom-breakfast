const cloud = require('wx-server-sdk');
const moment = require('moment')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
const _ = db.command
// 获取套餐list
exports.main = async (event, context) => {
  try {
    const total = await db.collection('order').where({
      distributeDate: _.and(_.gt(moment(new Date('2022/06/15')).startOf('day').toDate()), _.lt(moment(new Date('2022/06/15')).endOf('day').toDate())),
      'storeInfo.storeId': 'f6797f72feae4d74d1fa497ca3b47f81'
    }).get()
    return { total, time: new Date(db.serverDate()).getTime() }
  } catch (e) {
    return {
      success: false,
      error: e
    }
  }
}
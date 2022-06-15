const cloud = require('wx-server-sdk');
const moment = require('moment')
const {
  PA_ORDER_STATUS
} = require('../const')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})
const _ = db.command
// 获取套餐list
exports.main = async (event, context) => {
  try {
    return {
      success: true,
      data: {
        detail: PA_ORDER_STATUS
      }
    }
  } catch (e) {
    return {
      success: false,
      error: e
    }
  }
}
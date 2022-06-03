const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
// 创建门店
exports.main = async (event, context) => {
  let {
    name,
    address,
    logo,
    openTime,
    closeTime,
    code
  } = event
  try {
    const phoneInfo = await cloud.openapi.phonenumber.getPhoneNumber({
      code
    })
    await db.collection('store').add({
      data: {
        creator: cloud.getWXContext().OPENID,
        name,
        address,
        logo,
        openTime,
        closeTime,
        phone: phoneInfo.phoneInfo.phoneNumber
      }
    })
    return {
      success: true,
      data: {}
    }
  } catch (error) {
    return {
      success: false,
      error
    }
  }
};
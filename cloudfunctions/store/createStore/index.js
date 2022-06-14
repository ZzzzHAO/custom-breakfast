const cloud = require('wx-server-sdk');
const {
  uuid
} = require('../util')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
const _ = db.command
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
    const {
      OPENID
    } = cloud.getWXContext()
    let phone = '' // 用户手机号
    // 获取用户信息
    let userRes = await db.collection('user').where({
      openId: OPENID
    }).get()
    userRes = userRes.data && userRes.data[0]
    if (userRes) {
      phone = userRes.phone
    } else {
      // 新用户
      if (code) {
        // 获取用户手机号
        const phoneRes = await cloud.openapi.phonenumber.getPhoneNumber({
          code
        })
        phone = phoneRes.phoneInfo && phoneRes.phoneInfo.phoneNumber // 下单人手机号
        // 新增用户
        const result = await cloud.callFunction({
          name: 'user',
          data: {
            _path: 'createUser',
            phone,
            openId: OPENID
          }
        })
        if (!result.result.success) {
          return result
        }
      } else {
        return {
          success: false,
          error: {
            message: '获取用户信息失败'
          }
        }
      }
    }
    const transaction = await db.startTransaction()
    const storeId = uuid()
    await transaction.collection('store').add({
      data: {
        _id: storeId,
        _openid: OPENID,
        createTime: db.serverDate(),
        manager: [OPENID],
        name,
        address,
        logo,
        openTime,
        closeTime
      }
    })
    await transaction.collection('user').where({
      openId: OPENID
    }).update({
      data: {
        store: _.push([storeId])
      }
    })
    await transaction.commit()
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
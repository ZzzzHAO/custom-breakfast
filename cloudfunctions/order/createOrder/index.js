const cloud = require('wx-server-sdk');
const { uuid } = require('../util')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})
const _ = db.command
// 录入商品
exports.main = async (event, context) => {
  let {
    amount,
    packages,
    ip = '127.0.0.1',
    code
  } = event
  const length = packages.length
  if (length) {
    try {
      const {
        OPENID
      } = cloud.getWXContext()
      // 获取用户手机号
      let phoneRes = await cloud.openapi.phonenumber.getPhoneNumber({
        code
      })
      phone = phoneRes.phoneInfo.phoneNumber
      // 查找套餐信息
      let packageRes = await db.collection('package').where({
        _id: _.in(packages.map(item => item.id)),
      }).get()
      packageRes = packageRes.data
      if (packageRes && packageRes.length === packages.length) {
        // 是否已下架
        const onSale = packageRes.every(item => item.onSale)
        if (onSale) {
          // 支付金额是否与前端金额一致
          const price = packageRes.map(item => item.price).reduce((acc, cur) => {
            return acc + cur
          }, 0)
          if (price === amount) {
            // 拆分订单
            for (let i = 0; i < length; i++) {
              const package = packageRes[i]
              const storeId = package.store || ''
              // 获取店铺信息
              let storeRes = await db.collection('store').where({
                _id: storeId
              }).get()
              storeRes = (storeRes.data && storeRes.data[0]) || {}
              // 统一下单
              const outTradeNo = uuid()
              const params = {
                body: `${storeRes.name}-${package.name}`,
                outTradeNo,
                spbillCreateIp: ip,
                subMchId: "1626802696",
                totalFee: package.price,
                envId: 'cloud1-3g1ptrnzda536c06',
                functionName: "pay_cb"
              }
              console.log(params)
              const res = await cloud.cloudPay.unifiedOrder(params)
              if (res.returnCode === 'SUCCESS') {
                const transaction = await db.startTransaction()
                await transaction.collection('order').add({
                  data: {
                    _id: outTradeNo,
                    creator: OPENID,
                    store: storeId,
                    createTime: db.serverDate(),
                    status: 0, // 0 待支付
                    wxOrder: res
                  }
                })
                await transaction.commit()
                return {
                  success: true,
                  data: {
                    ...res.payment
                  }
                }
              } else {
                return {
                  success: false,
                  error: {
                    message: res.returnMsg
                  }
                }
              }
            }
          } else {
            return {
              success: false,
              error: {
                message: '金额错误'
              }
            }
          }
        } else {
          return {
            success: false,
            error: {
              message: '该套餐已经下架'
            }
          }
        }
      } else {
        return {
          success: false,
          error: {
            message: '套餐不存在'
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        error
      }
    }
  } else {
    return {
      success: false,
      error: {
        message: '请选择套餐'
      }
    }
  }
};
const cloud = require('wx-server-sdk');
const moment = require('moment')
const {
  uuid
} = require('../util')

const DAY_ENUM = {
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
  0: '周日',
}


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
        await cloud.callFunction({
          name: 'user',
          data: {
            _path: 'createUser',
            phone,
            openId: OPENID
          }
        })
      } else {
        return {
          success: false,
          error: {
            message: '获取用户信息失败'
          }
        }
      }
    }
    const length = packages.length // 购买套餐数组
    if (length) {
      // 查找套餐信息
      const tasks = [] // 查询商品信息任务队列
      packages.forEach(item => {
        const promise = db.collection('package').where({
          _id: item.id
        }).get()
        tasks.push(promise)
      })
      let packageRes = await Promise.all(tasks)
      packageRes = packageRes.map(item => item.data[0]) // 商品信息列表
      // 是否都找到
      if (packageRes.every(item => item)) {
        const storeId = packageRes[0].store // 门店号
        // 所有套餐是否属于同一家store
        if (packageRes.every(item => item.store === storeId)) {
          // 如果一致 获取店铺信息
          let storeRes = await db.collection('store').where({
            _id: storeId
          }).get()
          storeRes = (storeRes.data && storeRes.data[0]) || {}
          // 是否已下架
          const onSale = packageRes.every(item => item.onSale)
          if (onSale) {
            // 需支付金额
            const price = packageRes.map(item => item.price).reduce((acc, cur) => {
              return acc + cur
            }, 0)
            // 支付金额是否与前端金额一致
            if (price === amount) {
              // 排序
              packages = packages.map(item => {
                const day = moment(item.date).day()
                return {
                  ...item,
                  day,
                  dayStr: DAY_ENUM[day]
                }
              }).sort((a, b) => {
                return a.day - b.day
              })
              let body = `${storeRes.name}--`
              body += packages.map(item => item.dayStr).join('、')
              body += '套餐组合'
              try {
                const wxTransaction = await db.startTransaction()
                // 生成父单号
                const outTradeNo = uuid()
                // 生成 微信总订单 到数据库
                await wxTransaction.collection('wx-order').add({
                  data: {
                    _id: outTradeNo, // 商户订单号
                    creator: OPENID, // 创建者
                    phone, // 下单人手机号
                    store: storeId, // 门店id
                    price, // 价格
                    orders: [], // 子订单号数组
                    product: packageRes, // 订单商品
                    createTime: db.serverDate(), // 创建时间
                    status: 0 // 0 创建中 1 创建成功 2 创建失败 3
                  }
                })
                await wxTransaction.commit()

                // 调用微信统一下单
                const res = await cloud.cloudPay.unifiedOrder({
                  body, // 商品名称
                  outTradeNo, // 商户订单号
                  spbillCreateIp: ip, // 终端ip地址
                  subMchId: "1626802696", // 商户号
                  totalFee: price, // 支付金额
                  envId: 'cloud1-3g1ptrnzda536c06', // 云函数环境id
                  functionName: "pay_cb" // 支付回调 云函数name
                })

                // 下单后开起另一个事务 更新父订单 生成子订单
                const transaction = await db.startTransaction()
                if (res.returnCode === 'SUCCESS' && res.resultCode === 'SUCCESS') {
                  // 更新父订单状态
                  await transaction.collection('wx-order').where({
                    _id: outTradeNo
                  }).update({
                    data: {
                      status: 1, // 0 创建中 1 创建成功 2 创建失败
                      result: res // 微信订单 创建成功信息
                    }
                  })
                  // 拆分订单
                  for (let i = 0; i < length; i++) {
                    let package = packageRes[i]
                    // 获取套餐内商品快照
                    package = await cloud.callFunction({
                      name: 'product',
                      data: {
                        _path: 'getProductDetailByPackage',
                        package
                      }
                    })
                    package = package.result.data
                    const orderNo = uuid() // uuid 作为子订单号
                    await transaction.collection('order').add({
                      data: {
                        _id: orderNo, // 子订单号
                        distributeDate: moment(packages[i].date).toDate(), // 配送日期
                        outTradeNo, // 父订单号
                        creator: OPENID, // 创建者
                        phone, // 下单人手机号
                        store: storeId, // 门店号
                        createTime: db.serverDate(), // 创建时间
                        status: 0, // 0 待支付 1 支付成功 2 支付失败 3 已取消 4 退款中 5 退款成功 6 退款失败
                        distributeStatus: 0, // 0 待配送 1 已配送
                        product: package, // 套餐信息
                      },
                    })
                    // 往父订单追加子订单信息
                    await transaction.collection('wx-order').where({
                      _id: outTradeNo
                    }).update({
                      data: {
                        orders: _.push([orderNo])
                      }
                    })
                    if (i === length - 1) {
                      await transaction.commit()
                      return {
                        success: true,
                        data: {
                          ...res.payment
                        }
                      }
                    }
                  }
                } else {
                  await transaction.collection('wx-order').where({
                    outTradeNo
                  }).update({
                    data: {
                      status: 2, // 0 创建中 1 创建成功 2 创建失败
                      result: res
                    }
                  })
                  await transaction.commit()
                  return {
                    success: false,
                    error: {
                      message: `微信订单创建失败，${res.returnMsg}`
                    }
                  }
                }
              } catch (e) {
                return {
                  success: false,
                  error: e
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
              message: '您选购的套餐组合不属于同一家门店，请重新选择'
            }
          }
        }
      } else {
        return {
          success: false,
          error: {
            message: '所选套餐不存在'
          }
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
  } catch (error) {
    return {
      success: false,
      error
    }
  }
};
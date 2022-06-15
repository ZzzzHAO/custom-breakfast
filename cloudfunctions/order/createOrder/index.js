const cloud = require('wx-server-sdk');
const moment = require('moment')
const {
  PA_ORDER_STATUS,
  CH_ORDER_STATUS,
  DISTRIBUTE_STATUS
} = require('../const')
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

// 生成不重复取餐码
const createSeq = async function (storeId) {
  let max = 9999,
    pad = 4; // 默认4位取餐号
  // 当天的订单数量
  const totalRes = await db.collection('order').where({
    distributeDate: _.and(_.gt(moment(db.serverDate()).startOf('day').toDate()), _.lt(moment(db.serverDate()).endOf('day').toDate())),
    'storeInfo.storeId': storeId
  }).count()
  const {
    total
  } = totalRes
  // 当该门店单日订单量超过5000单时 取餐号扩展至6位
  if (total >= 5000) {
    max = 999999
    pad = 6
  }
  const code = (Math.floor(Math.random() * max) + '').padStart(pad, '0') // 取餐码
  const codeRes = await db.collection('order').where({
    code
  }).count()
  // 如果已存在该取餐码 则重新生成
  if (codeRes.total) {
    return createSeq()
  } else {
    return code
  }
}

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
      const isWeek = length > 1 // 是否为预约一周
      packages = packages.sort((a, b) => {
        return moment(a.date).valueOf() - moment(b.date).valueOf()
      }) // 按照配送时间排序
      // 查找套餐信息
      const tasks = [] // 查询商品信息任务队列
      packages.forEach(item => {
        const promise = db.collection('package').doc(item.id).get()
        tasks.push(promise)
      })
      let packageRes = await Promise.all(tasks)
      packageRes = packageRes.map(item => item.data) // 商品信息列表
      // 是否都找到
      if (packageRes.every(item => item)) {
        const storeId = packageRes[0].store // 门店号
        // 所有套餐是否属于同一家store
        if (packageRes.every(item => item.store === storeId)) {
          // 如果一致 获取店铺信息
          let storeRes = await db.collection('store').doc(storeId).get()
          storeRes = storeRes.data
          // 是否已下架
          const onSale = packageRes.every(item => item.onSale)
          if (onSale) {
            // 需支付金额 如果是一天单点 则取oldPrice原价，否则取优惠价price
            const price = packageRes.map(item => isWeek ? item.price : item.oldPrice).reduce((acc, cur) => {
              return acc + cur
            }, 0)
            // 支付金额是否与前端金额一致
            if (price === amount) {
              // 周几 字段
              packages = packages.map(item => {
                const day = moment(item.date).day()
                return {
                  ...item,
                  dayStr: DAY_ENUM[day]
                }
              })
              let body = `${storeRes.name}：`
              body += packages.map(item => item.dayStr).join('、')
              body += '套餐组合'
              // 获取套餐内商品快照
              packageRes = await cloud.callFunction({
                name: 'product',
                data: {
                  _path: 'getProductDetailByPackage',
                  packages: packageRes
                }
              })
              if (packageRes.result.success) {
                packageRes = packageRes.result.data.packages
              } else {
                return {
                  success: false,
                  error: {
                    message: '查找商品信息出错'
                  }
                }
              }
              // 将套餐快照保存至packages
              packages.forEach(item => {
                item.detail = packageRes.find(package => item.id === package._id)
              })
              // 生成父订单号
              const outTradeNo = uuid()
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
              // 微信统一下单成功
              if (res.returnCode === 'SUCCESS' && res.resultCode === 'SUCCESS') {
                // 开启事务
                const transaction = await db.startTransaction()
                const userInfo = {
                  openId: OPENID, // 用户openid
                  phone, // 下单人手机号
                }
                const storeInfo = {
                  storeId, // 门店Id
                  storeName: storeRes.name
                }
                const orders = [] // 子订单缓存数组
                // 新建子订单
                for (let i = 0; i < length; i++) {
                  let package = packages[i]
                  // 生成子订单号
                  const orderNo = 'CH' + uuid()
                  const code = await createSeq(storeInfo.storeId) // 创建取餐码
                  await transaction.collection('order').add({
                    data: {
                      _id: orderNo, // 子订单号
                      createTime: db.serverDate(), // 创建时间
                      outTradeNo, // 父订单号
                      orderStatus: CH_ORDER_STATUS.CREATE_SUCCESS, // 已创建
                      distributeStatus: DISTRIBUTE_STATUS.NO, // 待配送
                      distributeDate: moment(package.date).toDate(), // 配送日期
                      orderAmount: isWeek ? package.detail.price : package.detail.oldPrice, // 子订单金额 如果是预约一周则为优惠价 price，否则为原价 oldPrice
                      product: package.detail, // 子订单商品 套餐快照
                      userInfo, // 用户信息
                      storeInfo, // 门店信息
                      code // 取餐码
                    },
                  })
                  // 往父订单追加子订单信息
                  orders.push(orderNo)
                }
                // 生成 微信总订单 到数据库
                await transaction.collection('wx-order').add({
                  data: {
                    _id: outTradeNo, // 商户订单号
                    orders, // 子订单号数组
                    createTime: db.serverDate(), // 创建时间
                    orderStatus: PA_ORDER_STATUS.CREATE_SUCCESS, // 已创建状态
                    createResult: res, // 微信订单 创建成功信息
                    product: packages, // 订单商品快照
                    orderAmount: price, // 订单金额
                    // 用户信息
                    userInfo,
                    // 门店信息
                    storeInfo,
                  }
                })
                await transaction.commit()
                return {
                  success: true,
                  data: {
                    ...res.payment
                  }
                }
              } else { // 微信统一下单失败
                return {
                  success: false,
                  error: {
                    message: `统一下单失败`
                  }
                }
              }
            } else {
              return {
                success: false,
                error: {
                  message: '金额校验错误'
                }
              }
            }
          } else {
            return {
              success: false,
              error: {
                message: '所选套餐已经下架'
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
            message: '未查询到所选套餐'
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
      error: {
        message: '创建订单失败'
      }
    }
  }
};
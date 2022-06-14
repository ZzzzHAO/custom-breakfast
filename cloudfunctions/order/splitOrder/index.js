const cloud = require('wx-server-sdk');
const {
  CH_ORDER_STATUS,
  DISTRIBUTE_STATUS
} = require('../const')
const moment = require('moment')
const {
  uuid
} = require('../util')


cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})
const _ = db.command
// 生成不重复取餐码
const createSeq = async function (storeId) {
  let max = 9999, pad = 4; // 默认4位取餐号
  // 当天的订单数量
  const totalRes = await db.collection('order').where({
    distributeDate: _.and(_.gt(moment(db.serverDate()).startOf('day').toDate()), _.lt(moment(db.serverDate()).endOf('day').toDate())),
    'storeInfo.storeId': storeId
  }).count()
  const { total } = totalRes
  // 当该门店单日订单量超过5000单时 取餐号扩展至6位
  if (total >= 5000) {
    max = 999999
    pad = 6
  }
  const seq = (Math.floor(Math.random() * max) + '').padStart(pad, '0') // 取餐码
  const sameSeq = await db.collection('order').where({
    seq
  }).count()
  // 如果已存在该取餐码 则重新生成
  if (sameSeq.total) {
    return createSeq()
  } else {
    return seq
  }
}
// 录入商品
exports.main = async (event, context) => {
  let {
    outTradeNo
  } = event
  try {
    if (outTradeNo) {
      let wxOrderRes = await db.collection('wx-order').doc(outTradeNo).get()
      wxOrderRes = wxOrderRes.data
      if (wxOrderRes) {
        const { userInfo, storeInfo, product } = wxOrderRes
        const packages = product // 订单套餐数组
        const length = packages.length
        // 拆分订单
        if (length) {
          const transaction = await db.startTransaction()
          for (let i = 0; i < length; i++) {
            let package = packages[i]
            // 生成子订单号
            const orderNo = 'CH' + uuid()
            const seq = await createSeq(storeInfo.storeId) // 创建取餐码
            await transaction.collection('order').add({
              data: {
                _id: orderNo, // 子订单号
                createTime: db.serverDate(), // 创建时间
                outTradeNo, // 父订单号
                status: CH_ORDER_STATUS.PAY_SUCCESS, // 已支付
                distributeStatus: DISTRIBUTE_STATUS.NO, // 待配送
                distributeDate: moment(package.date).toDate(), // 配送日期
                orderAmount: package.detail.price, // 子订单金额 套餐price
                product: package.detail, // 子订单商品 套餐快照
                userInfo, // 用户信息
                storeInfo, // 门店信息
                seq // 取餐码
              },
            })
            // 往父订单追加子订单信息
            await transaction.collection('wx-order').doc(outTradeNo).update({
              data: {
                orders: _.push([orderNo])
              }
            })
            if (i === length - 1) {
              await transaction.commit()
              return {
                success: true,
                data: {}
              }
            }
          }
        }
      } else {
        return {
          success: false,
          error: {
            message: '微信订单号错误'
          }
        }
      }
    } else {
      return {
        success: false,
        error: {
          message: '请输入微信订单号'
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
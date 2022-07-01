const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})
const _ = db.command
// 获取父订单详情
exports.main = async (event, context) => {
  const {
    orderNo
  } = event
  if (orderNo) {
    try {
      let orderDetail = await db.collection('wx-order').doc(orderNo).get()
      orderDetail = orderDetail.data
      if (orderDetail) {
        const {
          createTime,
          payTime,
          orderStatus,
          orderAmount,
          discountAmount,
          payAmount,
          orderType,
          storeInfo,
          userInfo,
          discount
        } = orderDetail
        // 查询并返回对应子订单信息
        let orderRes = await db.collection('order').where({
          outTradeNo: orderNo
        }).get()
        orderRes = orderRes.data
        if (orderRes.length) {
          orderRes = orderRes.map(item => {
            const {
              code,
              distributeDate,
              distributeStatus,
              orderAmount,
              payAmount,
              discountAmount,
              product
            } = item
            return {
              code, // 取餐码
              distributeDate, // 配送日期
              distributeStatus, // 配送状态
              orderAmount, // 订单金额
              payAmount, // 支付金额
              discountAmount, // 优惠金额
              product: {
                price: product.price, // 现价
                oldPrice: product.oldPrice, // 原价
                name: product.name, // 套餐名称
                desc: product.desc, // 套餐描述
                image: product.image, // 套餐图片
                products: product.products.map(p => {
                  return {
                    name: p.detail.name, // 商品名称
                    count: p.count, // 商品数量
                  }
                })
              }
            }
          })
          return {
            success: true,
            data: {
              detail: {
                orderNo, // 订单号
                orderType, // 订单类型
                createTime, // 订单创建时间
                payTime, // 订单支付时间
                orders: orderRes, // 子订单信息
                orderStatus, // 订单状态
                discountAmount, // 优惠金额
                orderAmount, // 订单金额
                payAmount, // 支付金额
                discount, // 优惠金额
                storeInfo, // 店铺信息
                phone: `${userInfo.phone.substr(0,3)}****${userInfo.phone.substr(-4)}` // 收货人手机号
              }
            }
          }
        } else {
          return {
            success: false,
            error: {
              message: '未查到其子订单信息' + orderNo
            }
          }
        }
      } else {
        return {
          success: false,
          error: {
            message: '未查到该订单'
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
        message: '订单号有误'
      }
    }
  }
}
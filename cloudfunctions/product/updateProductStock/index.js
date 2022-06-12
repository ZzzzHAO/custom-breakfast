const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
const _ = db.command
// 下单后更新库存
exports.main = async (event, context) => {
  let {
    outTradeNo,
  } = event
  try {
    if (outTradeNo) {
      let orderRes = await db.collection('order').where({
        outTradeNo
      }).get()
      orderRes = orderRes.data
      if (orderRes.length) {
        // 获取商品 列表
        let products = orderRes.map(item => item.product.products)
        products = products.reduce((acc, cur) => {
          return acc.concat(cur)
        }, [])
        // 遍历更新库存
        const transaction = await db.startTransaction()
        const tasks = []
        for (let i = 0; i < products.length; i++) {
          const product = products[i]
          const promise = transaction.collection('product').doc(product.id).update({
            data: {
              stock: _.inc(-product.count)
            }
          })
          tasks.push(promise)
        }
        await Promise.all(tasks)
        await transaction.commit()
        return {
          success: true,
          data: {}
        }
      }
    } else {
      return {
        success: false,
        error: {
          message: '缺少outTradeNo参数'
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
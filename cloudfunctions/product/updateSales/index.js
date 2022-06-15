const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})
const _ = db.command

const runPromiseByQueue = async function (tasks) {
  const ret = []
  for (const task of tasks) {
    ret.push(await task())
  }
  return { success: ret.every(item => item.errMsg && item.errMsg.includes(':ok')) }
}

// 下单后更新库存以及销量
exports.main = async (event, context) => {
  let {
    outTradeNo,
  } = event
  try {
    if (outTradeNo) {
      let orderRes = await db.collection('wx-order').doc(outTradeNo).get()
      orderRes = orderRes.data // 父订单详情
      if (orderRes) {
        const packages = orderRes.product // 订单商品
        const length = packages.length
        if (length) {
          const transaction = await db.startTransaction()
          const createPackagePromise = function (package) {
            return transaction.collection('package').doc(package.id).update({
              data: {
                sales: _.inc(1) // package 销量增1
              }
            })
          }
          const createProductPromise = function (product) {
            return transaction.collection('product').doc(product.id).update({
              data: {
                sales: _.inc(product.count) // product 销量增count
              }
            })
          }
          const tasks = [] // package 销量更新任务队列
          for (let i = 0; i < length; i++) {
            // package 销量更新
            const package = packages[i] // package: .id .date .detail
            tasks.push(createPackagePromise.bind(this, package))
            const products = package.detail.products.reduce((acc, cur) => {
              return acc.concat(cur)
            }, [])
            products.forEach(item => {
              const product = item // product .id .count .detail
              tasks.push(createProductPromise.bind(this, product))
            })
          }
          const res = await runPromiseByQueue(tasks) // 先等package更新
          if (res.success) {
            await transaction.commit()
            return {
              success: true,
              data: {}
            }
          } else {
            await transaction.rollback()
          }
        }
      } else {
        return {
          success: false,
          error: {
            message: '未找到订单信息'
          }
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
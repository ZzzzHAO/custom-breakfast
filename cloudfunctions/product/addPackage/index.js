const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database({
  throwOnNotFound: false,
})
const _ = db.command
// 录入套餐
exports.main = async (event, context) => {
  let {
    packages
  } = event
  const length = packages.length
  if (length) {
    try {
      const {
        OPENID
      } = cloud.getWXContext()
      let storeRes = await db.collection('store').where({
        creator: OPENID,
      }).get()
      storeRes = storeRes.data && storeRes.data[0]
      if (storeRes) {
        const storeId = storeRes._id
        // 开起事务
        const transaction = await db.startTransaction()
        // 遍历套餐数组
        for (let index = 0; index < length; index++) {
          const package = packages[index]
          const products = package.products // 套餐商品列表
          const tasks = [] // 查询商品信息任务队列
          products.forEach(item => {
            const promise = db.collection('product').where({
              _id: item.id
            }).get()
            tasks.push(promise)
          })
          let res = await Promise.all(tasks)
          res = res.map(item => item.data[0]) // 商品信息列表
          // 校验套餐中的商品是否都取到了
          if (res.every(item => item)) {
            // let amount = 0 // 套餐成本价
            // let stock = Infinity // 取商品列表里库存最小的 作为套餐库存
            // 遍历套餐商品 计算套餐成本价
            // res.forEach((item, index) => {
            //   amount += item.amount * products[index].count
            // })
            // stock = Math.min.apply(this, res.map(item => item.stock))
            await transaction.collection('package').add({
              data: {
                // stock,
                // amount,
                image: package.image,
                name: package.name,
                desc: package.desc,
                price: +package.price,
                products: package.products,
                onSale: false,
                createTime: db.serverDate(),
                store: storeId,
                creator: OPENID
              }
            })
            if (index === packages.length - 1) {
              await transaction.commit()
              return {
                success: true,
                data: {}
              }
            }
          } else {
            await transaction.rollback()
          }
        }
      } else {
        return {
          success: false,
          error: {
            message: '未找到您的门店信息'
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        error
      }
    }
  }
};
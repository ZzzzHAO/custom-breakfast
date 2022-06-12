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
      // 只有门店拥有者才能上传套餐
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
            const promise = db.collection('product').doc(item.id).get()
            tasks.push(promise)
          })
          let res = await Promise.all(tasks)
          res = res.map(item => item.data) // 商品信息列表
          // 校验套餐中的商品是否都取到了
          if (res.every(item => item)) {
            // let stock = Infinity // 取商品列表里库存最小的 作为套餐库存
            // stock = Math.min.apply(this, res.map(item => item.stock))
            await transaction.collection('package').add({
              data: {
                // stock,
                // amount,
                image: package.image, // 套餐图片
                name: package.name, // 套餐名称
                desc: package.desc, // 套餐描述
                price: +package.price, // 套餐价格
                oldPrice: +package.oldPrice, // 套餐原价
                products: package.products, // 套餐商品组合
                onSale: false, // 是否上架
                createTime: db.serverDate(), // 录入时间
                store: storeId, // 门店id
                creator: OPENID // 上架者
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
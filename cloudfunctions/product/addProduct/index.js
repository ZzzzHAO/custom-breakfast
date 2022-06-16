const cloud = require('wx-server-sdk');

const PRODUCT_TAG = {
  CARBS: 1, // 碳水
  PROTEIN: 2, // 蛋白质
  VITAMINS: 3, // 维生素
  MEAT: 4, // 肉类
  DRINK: 5, // 饮料
  MILK: 6, // 乳制品
  FRUIT: 7, // 水果
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
    products
  } = event
  const length = products.length
  if (length) {
    try {
      const {
        OPENID
      } = cloud.getWXContext()
      // 只有门店拥有者才能上传商品
      let storeRes = await db.collection('store').where({
        _openid: OPENID,
      }).get()
      storeRes = storeRes.data && storeRes.data[0]
      if (storeRes) {
        const storeId = storeRes._id
        // 使用事务 原子性插入：保证全部插入成功
        const transaction = await db.startTransaction()
        for (let index = 0; index < length; index++) {
          const item = products[index]
          const product = {
            amount: +item.amount, // 成本价格
            image: item.image, // 图片
            name: item.name, // 商品民称
            price: +item.price, // 商品售价
            category: +item.category, // 商品品类
            onSale: false, // 默认不上架
            createTime: db.serverDate(), // 创建时间
            storeId, // 门店id
            _openid: OPENID // 创建者
          }
          await transaction.collection('product').add({ data: product })
        }
        await transaction.commit() // add成功 提交事务
        return {
          success: true,
          data: {
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
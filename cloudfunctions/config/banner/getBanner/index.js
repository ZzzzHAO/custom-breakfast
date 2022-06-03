const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()
const MAX_LIMIT = 20
// 获取banner云函数入口函数
exports.main = async (event, context) => {
    try {
        const countResult = await db.collection('banner').count()
        const total = countResult.total
        // 计算需分几次取
        const batchTimes = Math.ceil(total / MAX_LIMIT)
        // 承载所有读操作的 promise 的数组
        const tasks = []
        for (let i = 0; i < batchTimes; i++) {
            const promise = db.collection('banner').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
            tasks.push(promise)
        }
        // 等待所有
        let banner = []
        await Promise.all(tasks).then(res => {
            banner = res.reduce((acc, cur) => {
                return acc.data.concat(cur.data)
            }, {
                data: []
            })
        })
        return {
            success: true,
            data: {
                banner
            }
        }
    } catch (e) {
        return {
            success: false,
            error: e
        }
    }
}
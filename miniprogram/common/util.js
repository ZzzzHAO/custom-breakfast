/**
 * @function px2rpx
 * @param {number} px像素值
 * @return {number} rpx像素值
 */
export function px2rpx(px) {
  const screenWidth = getApp().globalData.systemInfo.screenWidth
  const rate = +screenWidth / 750
  return +px / rate
}
/**
 * @function rpx2px
 * @param {number} rpx像素值
 * @return {number} px像素值
 */
export function rpx2px(rpx) {
  const screenWidth = getApp().globalData.systemInfo.screenWidth
  const rate = +screenWidth / 750
  return +rpx * rate
}
/*
 * 循环调用方法，直到n次结束
 */
export const loop = (fn) => {
  let m = 0;
  return n => {
    // 轮询失败，callback超出次数回调
    const fail = (callback) => {
      if (m < n) {
        m += 1
        console.info('loop continue', m)
        fn(done, fail, m)
      } else {
        callback()
      }
    }
    // 轮询成功，callback成功回调
    const done = (callback) => {
      console.info('loop success')
      callback()
    }
    fn(done, fail, m);
  }
}
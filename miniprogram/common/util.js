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

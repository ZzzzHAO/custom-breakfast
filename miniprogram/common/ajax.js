/**
 * ajax.js
 * 处理请求
 */
const handleUrl = function (url = '') {
  const ret = {
    name: '',
    path: ''
  }
  if (url) {
    const arr = url.split('/')
    ret.name = arr[0]
    ret.path = arr.slice(1).join('/')
  }
  return ret
}
const ajax = {
  request(url, params = {}, config = {}) {
    return new Promise((resolve, reject) => {
      const {
        name,
        path
      } = handleUrl(url)
      if (!config.hideLoading) {
        wx.showLoading({
          title: '加载中',
        })
      }
      wx.cloud.callFunction({
        name,
        data: {
          _path: path,
          ...params
        },
        success(res) {
          if (res.result.success) {
            resolve(res.result.data)
          } else {
            const msg = res.result.error && res.result.error.message
            if (msg) {
              wx.showToast({
                icon: 'none',
                title: msg,
              })
            }
          }
        },
        fail(error) {
          reject(error)
        },
        complete() {
          wx.hideLoading()
        }
      })
    })
  },
  upload() {

  },
  downLoad() {

  }
}
export default ajax
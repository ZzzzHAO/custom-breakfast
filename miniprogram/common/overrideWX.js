// 修复安卓机型下 无loading状态(showToast会将原有loading隐藏)时hideLoading()报错的问题
const originToast = wx.showToast;
const originShowLoading = wx.showLoading;
const originHideLoading = wx.hideLoading;
const originSwitchTab = wx.switchTab;
let loadingStatus = "hide";
let showLoadingCounter = 0;
wx = {
  ...wx,
  showLoading(opt) {
    showLoadingCounter++;
    loadingStatus = "show";
    originShowLoading(opt);
  },
  hideLoading(opt) {
    showLoadingCounter > 0 && showLoadingCounter--;
    if (loadingStatus === "show" && showLoadingCounter === 0) {
      originHideLoading(opt);
      loadingStatus = "hide";
    }
  },
  showToast(opt) {
    showLoadingCounter = 0;
    loadingStatus = "hide";
    originToast(opt);
  },
};
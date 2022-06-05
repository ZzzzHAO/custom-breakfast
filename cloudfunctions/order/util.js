/**
 * @function
 * @name uuid
 * @des 生成唯一标识UUID
 * @return {string}
 * @author zhanghao257
 */
function uuid() {
  let d = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
  return uuid.replace(/-/g, '');
}
module.exports = {
  uuid
}
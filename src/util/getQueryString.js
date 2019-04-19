/* eslint-disable */
// FIXME
/**
 * @module util/getQueryString
 * @description 获取URL参数
 */
export default function getQueryString(name) {
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i');
  const r = decodeURI(window.location.search).substr(1).match(reg);
  if (r != null) return unescape(r[2]); return null;
}

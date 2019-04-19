// 处理单个reducer切片工具函数，消除switch case样板
export default (initialState, handlers) => (state = initialState, action) => {
  if (Object.prototype.hasOwnProperty.call(handlers, action.type)) {
    return handlers[action.type](state, action)
  }
  return state
}

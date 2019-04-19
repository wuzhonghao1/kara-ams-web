/**
 * http请求redux中间件
 *
 * 发起fetch请求
 *
 * 参数设置请参考 https://github.com/github/fetch#post-json
 *
 * 概念说明 https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch
 *
 * 首次 dispatch：更新应用的 state 来通知API 请求发起了。
 *
 * 对于这种 action，reducer 可能会切换一下 state 中的标记。以此来告诉 UI 来显示进度条。即已经发生请求
 *
 * 第二次 dispatch：更新应用的state 来传递API 请求获取的数据
 *
 * 返回一个等待处理的 promise。这并不是 redux middleware 所必须的，但这对于我们而言很方便。
 */
export const httpApi = Symbol('call ajax api')

// eslint-disable-next-line no-unused-vars
const middleware = (requestJson, catchError) => store => next => (action) => {
  const httpSymbol = action[httpApi]
  if (typeof httpSymbol === 'undefined') {
    return next(action)
  }
  const { options, types, url } = httpSymbol
  if (typeof url !== 'string') {
    throw new Error('请指定请求路径！')
  }
  if (!Array.isArray(types) || !types.every(x => typeof x === 'string')) {
    throw new Error('请指定的action types数组，且每个元素为string类型')
  }

  const actionWith = obj => ({
      ...action,
      [httpApi]: undefined,
      requestInformation: httpSymbol,
      ...obj,
    })

  const [
    successType,
    requestType = 'HTTP_REQUEST',
    failureType = 'HTTP_FAILURE',
    errorType = 'HTTP_ERROR',
  ] = types
  next(actionWith({ type: requestType }))
  return requestJson(url, options)
      .then((response) => {
        if (response.resultCode === '000000') {
          return next(actionWith({
            type: successType,
            response,
          }))
        }
        return next(actionWith({
          response,
          type: failureType,
        }))
      })
      .catch((error) => {
        next(actionWith({
          error,
          type: errorType,
        }))
        if (typeof catchError === 'function') {
          catchError(error)
        }
      })
}

export default middleware

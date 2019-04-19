import invokeApi from './index'

function requestJson(prefixG) {
  return invokeApi({
    prefixG,
    version: 'v1.0.0',
  }, {
    getToken() {
      return {
        token: sessionStorage.getItem('token'),
        refreshToken: localStorage.getItem('refreshToken'),
      }
    },
    setToken(tokenInfo) {
      sessionStorage.setItem('token', `${tokenInfo.token_type} ${tokenInfo.access_token}`)
      localStorage.setItem('refreshToken', tokenInfo.refresh_token)
      sessionStorage.setItem('activeTime', Date.now())
      sessionStorage.setItem('expires_in', tokenInfo.expires_in)
    },
    removeToken() {
      sessionStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      sessionStorage.removeItem('activeTime')
      sessionStorage.removeItem('expires_in')
    },
    authRefused() {
      window.location.reload()
    },
  })
}

export default requestJson

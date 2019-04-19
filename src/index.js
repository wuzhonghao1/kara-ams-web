import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import createHistory from 'history/createBrowserHistory'
import { ConnectedRouter, routerMiddleware } from 'react-router-redux'
import thunk from 'redux-thunk'
import reduxRequestMiddleware from './http/reduxRequestMiddleware'
import requestJson from './http/requestJson'
import reducers from './reducers/index'
import Root from './containers/index'
import registerServiceWorker from './registerServiceWorker'
import './assets/css/ams-components.less'
import './assets/css/ams-own-icon.less'
import './assets/css/ams-hack.less'

export const httpRequestJson = requestJson(process.env.REACT_APP_GATEWAY)

function loader() {
  const history = createHistory()
  const middleware = [thunk, routerMiddleware(history), reduxRequestMiddleware(httpRequestJson)]
  // see: http://zalmoxisus.github.io/redux-devtools-extension/
  // eslint-disable-next-line no-underscore-dangle
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    // eslint-disable-next-line no-underscore-dangle
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose

  const enhancer = composeEnhancers(applyMiddleware(...middleware))

  const store = createStore(reducers, enhancer)

  render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Root />
      </ConnectedRouter>
    </Provider>,
    document.getElementById('root'),
  )
  registerServiceWorker();
}

function bootstrap() {
  // window.sessionStorage.setItem('token', `bearer C4wd35nvnpaUtIptT0jU0aJsDVapKE8y`)
  if (window.location.hash && window.location.hash.indexOf('access_token=') > -1) {
    window.sessionStorage.setItem('token', `bearer ${window.location.hash.split('access_token=')[1].split('&')[0]}`)
    window.history.pushState(null, '', window.localStorage.getItem('oldUrl'))
    loader()
  } else if (window.sessionStorage.getItem('token')) {
    loader()
  } else {
    window.localStorage.setItem('oldUrl', window.location.href)
    if (!window.location.origin) {
      window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
    }
    // token不存在 去访问第三方授权网站 （注意：redirect_uri 需要和 后端设置的完全一样）
    window.location.href = `${process.env.REACT_APP_OAUTH2_SERVER}?client_id=${process.env.REACT_APP_CLIENT_ID}&response_type=token&scope=all&redirect_uri=${window.location.origin}${process.env.REACT_APP_ROOT_PATH}/`
  }
}

export default bootstrap()


import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import user from './user'
import menu from './menu'
import applicationSearch from './applicationSearch'
import ownerConfirm from './assetsCheck/ownerConfirm'
import ccOwnerConfirm from './assetsCheck/ccOwnerConfirm'
import taskSetting from './assetsCheck/taskSetting'
import taskDetailQuery from './assetsCheck/taskDetailQuery'
import taskQuery from './assetsCheck/taskQuery'
import home from './home/index'
import financeAudit from './financeAudit/financeAudit'
import assetInquiry from './assetInquiry/assetInquiry'
import assetTransfer from './assetTransfer/assetTransfer'
import system from './system/system'
import dictionary from './dictionary'
import businessApproval from './businessApproval/businessApproval'

export default combineReducers({
  home,
  user,
  menu,
  applicationSearch,
  ownerConfirm,
  ccOwnerConfirm,
  taskSetting,
  taskDetailQuery,
  taskQuery,
  system,
  financeAudit,
  assetTransfer,
  dictionary,
  businessApproval,
  assetInquiry,
  routing: routerReducer, // 整合路由
})

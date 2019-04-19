import { combineReducers } from 'redux'

import user from './user'
import role from './role'
import remit from './remittanceAccount'

export default combineReducers({
  role,
  user,
  remit,
})

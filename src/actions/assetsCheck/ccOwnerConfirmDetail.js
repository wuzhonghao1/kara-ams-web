import { httpApi } from '../../http/reduxRequestMiddleware'
/**
 * 获取CCowner确认列表
 */
export const getCCConfirmList = (body) => ({
  [httpApi]: {
    url: '/ams/inventory/ccComfirmList',
    options: {
      method: 'POST',
      body: body
    },
    types: ['GET_CC_CONFIRM_LIST_SUCCESS', 'GET_CC_CONFIRM_LIST_REQUEST', 'GET_CC_CONFIRM_LIST_FAILURE', 'NETWORK_FAILURE'],
  },
})
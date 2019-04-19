import {httpApi} from '../../http/reduxRequestMiddleware'
/**
 * 获取资产owner确认列表
 */
export const getOwnerList = (body) => ({
  [httpApi]: {
    url: '/ams/inventory/taskListByAssetOwner',
    options: {
      method: 'POST',
      body: body
    },
    types: ['GET_ASSETS_CONFIRM_SUCCESS', 'GET_ASSETS_CONFIRM_LIST_REQUEST', 'GET_ASSETS_CONFIRM_FAILURE', 'NETWORK_FAILURE'],
  },
})

export const getOwnerDetail = (id, status, no, size) => ({
  [httpApi]: {
    url: '/ams/inventory/assetComfirmList',
    options: {
      method: 'POST',
      body: {
        pageNo: no,
        pageSize: size,
        ownerConfirm: status || '',
        inventoryTaskId: id,
      }
    },
    types: ['GET_OWNER_DETAIL_SUCCESS'],
  },
})

/*
 *资产确认
 */
export const ownerDelConfirm = (body, type) => ({
  [httpApi]: {
    url: `/ams/inventory/confirm`,
    options: {
      method: 'POST',
      body: {
        confirmMsg: body,
        type: type,
      }
    },
    types: ['OWNER_DETAIL_CONFIRM_SUCCESS'],
  },
})

/*
 *资产跳转
 **/
export const assetOpt = (list, id) => ({
  type: 'SET_ASSET_OPTION_SUCCESS',
  assetList: list,
  assetKey: id,
})

export const ownerStatus = id => ({
  type: 'GET_OWNER_STATUS',
  status: id
})

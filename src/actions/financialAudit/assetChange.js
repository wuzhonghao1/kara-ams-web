import { httpApi } from '../../http/reduxRequestMiddleware'

export const getAssetChangeSearch = (body) => ({
  [httpApi]: {
    url: '/ams/financial/assetChange/search',
    options: {
      method: 'POST',
      body,
    },
      types: ['GET_ASSET_CHANGE_SEARCH_SUCCESS'],
  },
})

export const getAssetChangeConfirm = (body) => ({
  [httpApi]: {
    url: '/ams/financial/assetChange/affirm',
    options: {
      method: 'POST',
      body,
    },
      types: ['GET_ASSET_CHANGE_CONFIRM_SUCCESS'],
  },
})

export const assetExcel = (body) => ({
  // 资产变更导出
  [httpApi]: {
    url: '/ams/financial/assetChange/export',
    options: {
      method: 'POST',
      body,
    },
    types: ['EXPORT_ASSET_EXCEL_SUCCESS'],
  },
})

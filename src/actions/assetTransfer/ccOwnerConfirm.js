import { httpApi } from '../../http/reduxRequestMiddleware'

export const getCCOwnerSearch = (body) => ({
  [httpApi]: {
    url: '/ams/assetChange/search',
    options: {
      method: 'POST',
      body,
    },
      types: ['GET_CCOWNER_SEARCH_SUCCESS'],
  },
})

export const getCCOwnerExport = (body) => ({
  [httpApi]: {
    url: '/ams/assetChange/export',
    options: {
      method: 'POST',
      body,
    },
      types: ['GET_CCOWNER_EXPORT_SUCCESS'],
  },
})

export const getCCOwnerConfirm = (body) => ({
  [httpApi]: {
    url: '/ams/assetChange/affirm',
    options: {
      method: 'POST',
      body,
    },
      types: ['GET_CCOWNER_CONFIRM_SUCCESS'],
  },
})

export const clearTable = () => ({ type: 'GET_TABLE_CLEARED_SUCCESS' });

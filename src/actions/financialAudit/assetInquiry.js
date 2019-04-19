import { httpApi } from '../../http/reduxRequestMiddleware'

export const getAssetInquiry = (body) => ({
  [httpApi]: {
    url: '/ams/voucher/finance/list',
    options: {
      method: 'POST',
      body,
    },
      types: ['GET_ASSET_INQUIRY_SUCCESS'],
  },
})

export const getAssetConfirm = (body) => ({
  [httpApi]: {
    url: '/ams/voucher/financeConfirm',
    options: {
      method: 'POST',
      body,
    },
      types: ['GET_ASSET_CONFIRM_SUCCESS'],
  },
})

export const voucherExcel = (body) => ({
  // 会计审核导出(转移报废)
  [httpApi]: {
    url: '/ams/voucher/finance/export',
    options: {
      method: 'POST',
      body,
    },
    types: ['EXPORT_VOUCHER_EXCEL_SUCCESS'],
  },
})

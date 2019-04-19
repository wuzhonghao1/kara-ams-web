import { httpApi } from '../../http/reduxRequestMiddleware'

export const getMyApplicationInquiry = (body) => ({
  [httpApi]: {
    url: '/ams/voucher/myVouchers',
    options: {
      method: 'POST',
      body,
    },
      types: ['GET_MY_APPLICATION_INQUIRY_SUCCESS'],
  },
})

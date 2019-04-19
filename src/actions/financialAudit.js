import { httpApi } from '../http/reduxRequestMiddleware'

export const getProductStatisticsList = body => ({
  [httpApi]: {
    url: '/osp/order/product/saleAmount/list',
    options: {
      method: 'POST',
      body,
    },
    types: ['GET_PRODUCT_STATISTICS_LIST_SUCCESS'],
  },
})

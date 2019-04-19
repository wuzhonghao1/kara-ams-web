import { httpApi } from '../../http/reduxRequestMiddleware'

export const getMyAssets = (body) => ({
  [httpApi]: {
    url: '/ams/asset/myAssets',
    options: {
      method: 'POST',
      body,
    },
      types: ['GET_MY_ASSETS_SUCCESS'],
  },
})

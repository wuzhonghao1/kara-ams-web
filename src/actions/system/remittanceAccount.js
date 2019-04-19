import { httpApi } from '../../http/reduxRequestMiddleware';
/**
 * 汇款账号添加
 * @param params
 * @returns {{params: *}}
 */
export const remitAccountAdd = (params) => {
  return {
    [httpApi]: {
      url: '/ams/remittance/add',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['REMIT_ACCOUNT_ADD_SUCCESS'],
    },
  }
};
/**
 * 汇款账号查询
 * @param params
 * @returns {{params: *}}
 */
export const getRemitAccount = (params) => {
  return {
    [httpApi]: {
      url: '/ams/remittance/list',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['GET_REMIT_ACCOUNT_SUCCESS', 'LOADING_REQUEST'],
    },
    params
  }
};
/**
 * 汇款账号删除
 * @param remittanceAccountId
 * @returns {{}}
 */
export const remitAccountDel = (remittanceAccountId) => {
  return {
    [httpApi]: {
      url: `/ams/remittance/delete/${remittanceAccountId}`,
      options: {
        method: 'POST',
        body: {
          remittanceAccountId: remittanceAccountId,
        },
      },
      types: ['REMIT_ACCOUNT_DEL_SUCCESS'],
    },
  }
};

export const remitAccountUpdate = (params) => {
  return {
    [httpApi]: {
      url: '/ams/remittance/update',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['REMIT_ACCOUNT_UPDATE_SUCCESS'],
    },
  }
};
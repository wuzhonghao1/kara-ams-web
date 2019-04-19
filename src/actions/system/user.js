import { httpApi } from '../../http/reduxRequestMiddleware';
/**
 * 添加角色
 * @param params
 * @returns {{params: *}}
 */
export const addUserRole = (params) => {
  return {
    [httpApi]: {
      url: '/ams/userRole/add',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['ADD_USER_ROLE_SUCCESS'],
    },
  }
};

// 删除角色
export const deleteUserRole = (configId) => {
  return {
    [httpApi]: {
      url: `/ams/userRole/delete/${configId}`,
      options: {
        method: 'POST',
      },
      types: ['DELETE_USER_ROLE_SUCCESS'],
    },
  }
};

// 修改角色 /ams/userRole/update
export const updateUserRole = (params) => {
  return {
    [httpApi]: {
      url: '/ams/userRole/update',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['UPDATE_USER_ROLE_SUCCESS'],
    },
  }
};

/**
 * 获取角色
 * @param params
 * @returns {{params: *}}
 */
export const getUserRole = (params) => {
  return {
    [httpApi]: {
      url: '/ams/userRole/list',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['GET_USER_ROLE_SUCCESS'],
    },
  }
};
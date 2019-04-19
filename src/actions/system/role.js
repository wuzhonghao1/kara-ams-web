import { httpApi } from '../../http/reduxRequestMiddleware';

// 增加自定义角色
export const addCustomRole = (params) => {
  return {
    [httpApi]: {
      url: '/ams/role/add',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['ADD_CUSTOM_ROLE_SUCCESS'],
    },
  }
};


// 删除自定义角色
export const deleteCustomRole = (roleId) => {
  return {
    [httpApi]: {
      url: `/ams/role/delete/${roleId}`,
      options: {
        method: 'POST',
      },
      types: ['DELETE_CUSTOM_ROLE_SUCCESS'],
    },
  }
};

// 修改自定义角色
export const updateCustomRole = (params) => {
  return {
    [httpApi]: {
      url: '/ams/role/update',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['UPDATE_CUSTOM_ROLE_SUCCESS'],
    },
  }
};

// 获取自定义角色
export const getCustomRole = () => {
  return {
    [httpApi]: {
      url: '/ams/role/list',
      types: ['GET_CUSTOM_ROLE_SUCCESS'],
    },
  }
};

// 获取角色访问权限
export const getRoleView = (userRole) => {
  return {
    [httpApi]: {
      url: `/ams/roleBusiness/list/${userRole}`,
      types: ['GET_ROLE_VIEW_SUCCESS'],
    },
  }
};

// 设置角色的访问权限
export const setRoleView = (params) => {
  return {
    [httpApi]: {
      url: '/ams/roleBusiness/add',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['SET_ROLE_VIEW_SUCCESS'],
    },
  }
};

// 获取角色菜单权限
export const getRoleMenu = (userRole) => {
  return {
    [httpApi]: {
      url: `/ams/roleMenu/list/${userRole}`,
      types: ['GET_ROLE_VIEW_SUCCESS'],
    },
  }
};

// 设置角色的菜单权限
export const setRoleMenu = (params) => {
  return {
    [httpApi]: {
      url: '/ams/roleMenu/add',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['SET_ROLE_MENU_SUCCESS'],
    },
  }
};

// 重新拉去列表
export const refresh = () => ({
  type: 'REFRESH_LISTS'
})
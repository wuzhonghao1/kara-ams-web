import {httpApi} from '../../http/reduxRequestMiddleware'
/**
 * 任务名称查询
 */
export const getList = (body) => ({
  [httpApi]: {
    url: '/ams/inventory/listByTaskName',
    options: {
      method: 'POST',
      body: {
        taskName: body,
        pageNo: 1,
        pageSize: 99999
      }
    },
    types: ['GET_TASK_SETTING_LIST_SUCCESS', 'GET_TASK_SETTING_LIST_REQUEST', 'GET_TASK_SETTING_LIST_FAILURE', 'NETWORK_FAILURE'],
  },
})

export const getDetail = id => ({
  type: 'GET_TASK_SETTING_DETIAL_SUCCESS'
})

export const getTaskSettingQueryList = (body) => ({
    [httpApi]: {
        url: '/ams/inventory/list',
        options: {
            method: 'POST',
            body
        },
        types: ['GET_TASK_SETTING_QUERY_LIST_SUCCESS', 'GET_TASK_SETTING_QUERY_LIST_REQUEST', 'GET_TASK_SETTING_QUERY_LIST_FAILURE', 'NETWORK_FAILURE'],
    },
})

export const getTaskSettingDetail = (body) => ({
    [httpApi]: {
        url: '/ams/inventory/list',
        options: {
            method: 'POST',
            body
        },
        types: ['GET_TASK_SETTING_DETAIL_SUCCESS', 'GET_TASK_SETTING_DETAIL_REQUEST', 'GET_TASK_SETTING_DETAIL_FAILURE', 'NETWORK_FAILURE'],
    },
})


export const addTask = (body) => ({
    [httpApi]: {
        url: '/ams/inventory/add',
        options: {
            method: 'POST',
            body
        },
        types: ['ADD_TASK_SUCCESS', 'ADD_TASK_REQUEST', 'ADD_TASK_FAILURE', 'NETWORK_FAILURE'],
    },
})

export const closeTask = (taskId,categoryId) => ({
    [httpApi]: {
        url: `/ams/inventory/start/${taskId}/${categoryId}`,
        options: {
            method: 'POST'
        },
        types: ['CLOSE_TASK_SUCCESS', 'CLOSE_TASK_REQUEST', 'CLOSE_TASK_FAILURE', 'NETWORK_FAILURE'],
    },
})

export const editTask = (body) => ({
    [httpApi]: {
        url: '/ams/inventory/update',
        options: {
            method: 'POST',
            body
        },
        types: ['UPDATE_TASK_SUCCESS', 'UPDATE_TASK_REQUEST', 'UPDATE_TASK_FAILURE', 'NETWORK_FAILURE'],
    },
})

export const cancelTask = (taskId, categoryId) => ({
    [httpApi]: {
        url: `/ams/inventory/delete/${taskId}/${categoryId}`,
        options: {
            method: 'POST'
        },
        types: ['DELETE_TASK_SUCCESS', 'DELETE_TASK_REQUEST', 'DELETE_TASK_FAILURE', 'NETWORK_FAILURE'],
    },
})
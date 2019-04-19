
import { httpApi } from '../../http/reduxRequestMiddleware'
/**
 * 获取列表
 */
export const getTaskList = (body) => ({
    [httpApi]: {
        url: '/ams/inventory/taskCount',
        options: {
            method: 'POST',
            body: body
        },
        types: ['GET_TASK_QUERY_LIST_SUCCESS', 'GET_TASK_QUERY_LIST_REQUEST', 'GET_TASK_QUERY_LIST_FAILURE', 'NETWORK_FAILURE'],
    },
})

export const getTaskNameList = (body) => ({
    [httpApi]: {
        url: '/ams/inventory/listByTaskName',
        options: {
            method: 'POST',
            body: body
        },
        types: ['GET_TASK_NAME_LIST_SUCCESS'],
    },
})

export const getDetailList = (body) => ({
    [httpApi]: {
        url: '/ams/inventory/snapshotDetail',
        options: {
            method: 'POST',
            body: body
        },
        types: ['GET_TASK_QUERY_DETAIL_LIST_SUCCESS', 'GET_TASK_QUERY_DETAIL_LIST_REQUEST', 'GET_TASK_QUERY_DETAIL_LIST_FAILURE', 'NETWORK_FAILURE'],
    },
})

export const exportTaskDeail = (body) => ({
    [httpApi]: {
        url: '/ams/inventory/exportTaskCount',
        options: {
            method: 'POST',
            body: body
        },
        types: ['EXPORT_TASK_DETAIL_SUCCESS', 'EXPORT_TASK_DETAIL_REQUEST', 'EXPORT_TASK_DETAIL_FAILURE', 'NETWORK_FAILURE'],
    },
})

export const exportSnapshotDetail = (body) => ({
    [httpApi]: {
        url: '/ams/inventory/exportSnapshotDetail',
        options: {
            method: 'POST',
            body: body
        },
        types: ['EXPORT_SNASHOT_DETAIL_SUCCESS', 'EXPORT_SNASHOT_DETAIL_REQUEST', 'EXPORT_SNASHOT_DETAIL_FAILURE', 'NETWORK_FAILURE'],
    },
})
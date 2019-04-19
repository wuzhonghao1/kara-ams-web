import { httpApi } from '../../http/reduxRequestMiddleware'
/**
 * 获取CCowner确认列表
 */
export const getTaskList = (body) => ({
    [httpApi]: {
        url: '/ams/inventory/taskListByCCOwner',
        options: {
            method: 'POST',
            body: body
        },
        types: ['GET_CCCONFIRM_LIST_SUCCESS', 'GET_CCCONFIRM_LIST_REQUEST', 'GET_CCCONFIRM_LIST_FAILURE', 'NETWORK_FAILURE'],
    },
})

export const getDetail = id =>({
    type: 'GET_CCCONFIRM_DETIAL_SUCCESS'
})
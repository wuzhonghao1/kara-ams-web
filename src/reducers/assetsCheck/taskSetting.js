import caseReducer from '../caseReducer'

const taskSetting = {
    pageInfo: {},
    detail: {},
    taskSettingList: {pageInfo:{pageNo:1,pageSize:10,count:0}},
    addResult: {},
    taskSettingDetail: []
}


function getList(state, action) {
    return {
        ...state,
        pageInfo: action.response.pageInfo,
    }
}
function getDetail(state, action) {
    return {
        ...state,
        taskSettingDetail: action.response.results,
    }
}

function getTaskSettingQueryList(state, action) {
    return {
        ...state,
        taskSettingList: action.response.results,
    }
}

function addTask(state, action) {
    return {
        ...state,
        addResult: action.response
    }
}

export default caseReducer(taskSetting, {
    GET_TASK_SETTING_LIST_SUCCESS: getList,
    GET_TASK_SETTING_DETAIL_SUCCESS: getDetail,
    GET_TASK_SETTING_QUERY_LIST_SUCCESS: getTaskSettingQueryList,
    ADD_TASK_SUCCESS: addTask,
})

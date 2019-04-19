import caseReducer from '../caseReducer'

const taskDetail = {
    detail: {pageNo:1,pageSize:10,count:0}
}


function getDetail(state, action) {
    return {
        ...state,
        detail: action.response.pageInfo,
    }
}

export default caseReducer(taskDetail, {
    GET_TASK_QUERY_DETAIL_LIST_SUCCESS: getDetail
})

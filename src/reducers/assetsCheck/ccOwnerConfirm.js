import caseReducer from '../caseReducer'

const ownerConfirm = {
    pageInfo: {},
    detail: {}
}


function getList(state, action) {
    return {
        ...state,
        list: action.response.pageInfo,
    }
}
function getDetail(state) {
    return state
}

export default caseReducer(ownerConfirm, {
    GET_CCCONFIRM_LIST_SUCCESS: getList,
    GET_CCCONFIRM_DETAIL_SUCCESS: getDetail
})

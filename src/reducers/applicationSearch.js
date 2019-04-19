import caseReducer from './caseReducer'

const applicationSearch = {
  pageInfo: {
    result: [],
    pageNo: 1,
    pageSize: 10
  }
};

function queryList(state, action) {
    return {
        ...state,
        bgList: action.response.pageInfo,
    }
}

function queryAdminList(state, action) {
    return {
        ...state,
        pageInfo: action.response.pageInfo,
    }
}

function queryVoucherList(state, action) {
    return {
        ...state,
        pageInfo: action.response.pageInfo,
    }
}

function cancelApplication(state) {
    return {
        ...state
    }
}

function exportExcelSuccess(state) {
  // 导出申请单查询结果
  return {
    ...state
  }
}

export default caseReducer(applicationSearch, {
    GET_BUSINESS_GROUPS_SUCCESS: queryList,
    GET_ADMIN_APPLICATION_LIST_SUCCESS: queryAdminList,
    GET_APPLICATION_LIST_SUCCESS: queryVoucherList,
    CANCEL_APPLICATION_SUCCESS: cancelApplication,
    EXPORT_EXCEL_SUCCESS: exportExcelSuccess,
})
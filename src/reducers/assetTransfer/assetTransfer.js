import caseReducer from '../caseReducer'

const assetTransfer = {
  assetChangeListPageInfo: {},
}

function getCCOwnerSearch(state, action) {
  return {
    ...state,
    assetChangeListPageInfo: {
      ...state.assetChangeListPageInfo,
      count: action.response.pageInfo.count,
      pageCount: action.response.pageInfo.pageCount,
      pageNo: action.response.pageInfo.pageNo,
      pageSize: action.response.pageInfo.pageSize,
      result: action.response.pageInfo.result.map(item => {
        if (item.changeStatus === "10") {
          return { ...item, result: "yes", remark: '' };
        }
        return item;
      })
    } 
  }
}

function getCCOwnerExport(state, action) {
	return state
}

function getCCOwnerConfirm(state, action) {
  return state
}

function clearTable(state, action) {
  return {
    ...state,
    assetChangeListPageInfo: {}
  }
}

export default caseReducer(assetTransfer, {
  GET_CCOWNER_SEARCH_SUCCESS: getCCOwnerSearch,
  GET_CCOWNER_EXPORT_SUCCESS: getCCOwnerExport,
  GET_CCOWNER_CONFIRM_SUCCESS: getCCOwnerConfirm,
  GET_TABLE_CLEARED_SUCCESS: clearTable,
});

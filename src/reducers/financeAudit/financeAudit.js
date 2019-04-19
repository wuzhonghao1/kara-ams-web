import caseReducer from '../caseReducer'

const financeAudit = {
  inquiryListPageInfo: {},
  assetChangePageInfo: {}
}

function getAssetChangeSearch(state, action) {
  return {
    ...state,
    assetChangePageInfo: action.response.pageInfo,
  }
}

function getAssetChangeConfirm(state, action) {
	return state
}

function getAssetInquiry(state, action) {
  return {
    ...state,
    inquiryListPageInfo: action.response.pageInfo,
  }
}

function getAssetConfirm(state, action) {
  return state
}

export default caseReducer(financeAudit, {
  GET_ASSET_CHANGE_SEARCH_SUCCESS: getAssetChangeSearch,
	GET_ASSET_CHANGE_CONFIRM_SUCCESS: getAssetChangeConfirm,
  GET_ASSET_INQUIRY_SUCCESS: getAssetInquiry,
	GET_ASSET_CONFIRM_SUCCESS: getAssetConfirm,
})

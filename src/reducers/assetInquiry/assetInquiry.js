import caseReducer from '../caseReducer'

const assetInquiry = {
  managerListPageInfo: {},
	managerList: [],
	myAssetsList: [],
  subBordList: [],
  buList: [],
	myAssetsListPageInfo: {},
	sbuBordListPageInfo: {}, // 上级经理直接下属资产
	buListPageInfo: {}, // BU内资产
	ccOwnerManageListPageInfo: {},
	modifyLogs: [],
	serialNumber: '',
}

function getManagerSearch(state, action) {
	const { pageInfo } = action.response
  return {
	...state,
		managerListPageInfo: pageInfo,
		managerList: pageInfo.result,
	}
}

function getMyAssetSearch(state, action) {
	const { pageInfo } = action.response
	return {
		...state,
		myAssetsListPageInfo: pageInfo,
		myAssetsList: pageInfo.result,
	}
}

function getSbuBordLists(state, action) {
	// 查询下级资产
  const { pageInfo } = action.response
  return {
    ...state,
    sbuBordListPageInfo: pageInfo,
    subBordList: pageInfo.result,
  }
}

function getSbuBordFailure(state) {
	// 非下级查询报错
  return {
    ...state,
    sbuBordListPageInfo: {},
    subBordList: [],
  }
}

function getBuLists(state, action) {
  // 查询BU内资产
  const { pageInfo } = action.response
  return {
    ...state,
    buListPageInfo: pageInfo,
    buList: pageInfo.result,
  }
}

function getBuFailure(state) {
  // 非本BU查询报错
  return {
    ...state,
    buListPageInfo: {},
    buList: [],
  }
}

function getCcOwnerManageSearch(state, action) {
	const { pageInfo } = action.response
	return {
		...state,
		ccOwnerManageListPageInfo: pageInfo,
	}
}

function getModifyLogs(state, action) {
	const { results } = action.response
	return {
		...state,
		modifyLogs: results,
		serialNumber: action.serialNumber,
	}
}

function clearCCAssetsTable(state, action) {
	return { ...state, ccOwnerManageListPageInfo: {} };
}

function clearManagerAssetsTable(state, action) {
	return {
		...state,
		managerListPageInfo: {},
    sbuBordListPageInfo: {}, // 上级经理直接下属资产
    buListPageInfo: {}, // BU内资产
	}
}

export default caseReducer(assetInquiry, {
  GET_MANAGER_SEARCH_SUCCESS: getManagerSearch,
  GET_MY_ASSETS_SEARCH_SUCCESS: getMyAssetSearch,
  GET_SUBORDINATES_LIST_SUCCESS: getSbuBordLists,
  GET_BUASSET_LIST_SUCCESS: getBuLists,
  GET_SUB_FAILURE: getSbuBordFailure,
  GET_BU_FAILURE: getBuFailure,
  GET_CCOWNER_MANAGE_SEARCH_SUCCESS: getCcOwnerManageSearch,
  GET_MODIFY_LOGS_SUCCESS: getModifyLogs,
  GET_CCASSETS_TABLE_CLEARED_SUCCESS: clearCCAssetsTable,
  GET_MANAGER_ASSETS_TABLE_CLEARED_SUCCESS: clearManagerAssetsTable,
});

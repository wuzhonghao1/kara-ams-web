import caseReducer from './caseReducer'

const initState = {
  bgList: [],
  regionList: [],
  sbuList: [],
  companyList: [],
  deptList: [],
  userRole: [],
  voucherType: [],
  applyStatus: [],
  assetsType: [],
  adminAssetsType: [],
  assetKey:[],
  changeOption: [],
  assetCategory: [],
  changeStatus: []
};

function getBusinessGroups(state, action) {
  return {
    ...state,
    bgList: action.response.businessGroupInfos,
  }
}

function getRegionInfo(state, action) {
  return {
    ...state,
    regionList: action.response.regionInfoList,
  }
}

function getSbuInfo(state, action) {
  return {
    ...state,
    sbuList: action.response.sbuInfoList,
  }
}

function getCompanyInfo(state, action) {
  return {
    ...state,
    companyList: action.response.companyInfoList,
  }
}

function getCostCenter(state, action) {
  return {
    ...state,
    deptList: action.response.orgCostCenterCurInfoList,
  }
}



function getAssetCategoryParam(state, action) {
  return {
    ...state,
    assetCategory: action.response.results,
  }
}

function getVoucherTypeParam(state, action) {
  return {
    ...state,
    voucherType: action.response.results,
  }
}

function getApplyStatus(state, action) {
    return {
        ...state,
        applyStatus: action.response.results,
    }
}

function getAssetsType(state, action) {
    return {
        ...state,
        assetsType: action.response.results,
    }
}

function getAdminAssetsType(state, action) {
  return {
    ...state,
    adminAssetsType: action.response.results,
  }
}

function getAssetKey(state, action) {
  return {
    ...state,
    assetKey: action.response.results
  }
}

function getChangeStatus(state, action) {
  return {
    ...state,
    changeStatus: action.response.results
  }
}

function getChangeOption(state, action) {
  return {
    ...state,
    changeOption: action.response.results
  }
}

export default caseReducer(initState, {
  GET_BUSINESS_GROUPS_SUCCESS: getBusinessGroups,
  GET_REGION_INFO_SUCCESS: getRegionInfo,
  GET_SBU_INFO_SUCCESS: getSbuInfo,
  GET_COMPANY_INFO_SUCCESS: getCompanyInfo,
  GET_COST_CENTER_SUCCESS: getCostCenter,

  GET_ASSET_CATEGORY_PARAM_SUCCESS:getAssetCategoryParam,
  GET_VOUCHER_TYPE_PARAM_SUCCESS: getVoucherTypeParam,
  GET_VOUCHER_STATUS_SUCCESS: getApplyStatus,
  GET_IT_ASSETS_TYPE_SUCCESS: getAssetsType,
  GET_ADMIN_ASSET_TYPE_SUCCESS: getAdminAssetsType,
  GET_ASSET_KEY_SUCCESS: getAssetKey,
  GET_CHANGE_STATUS_SUCCESS: getChangeStatus,
  GET_CHANGE_OPTION_SUCCESS: getChangeOption,
})

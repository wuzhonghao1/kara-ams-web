import caseReducer from '../caseReducer'

const ownerConfirm = {
  ownerList: {}, // 查询结果
  detail: {},
  taskStatus: '', // 任务状态
  assets: [], // 资产列表
  assetKey: '', //资产大类
  taskCount: 0,
}

function getList(state, action) {
  return {
    ...state,
    ownerList: action.response.results,
    taskCount: action.response.taskCount,
  }
}
function getStatus(state, action) {
  return {
    ...state,
    taskStatus: action.status,
  }
}

function setAssets(state, action) {
  // 设置资产
  return {
    ...state,
    assets: action.assetList,
    assetKey: action.assetKey,
  }
}

export default caseReducer(ownerConfirm, {
  GET_ASSETS_CONFIRM_SUCCESS: getList,
  GET_OWNER_STATUS: getStatus,
  SET_ASSET_OPTION_SUCCESS: setAssets,
})

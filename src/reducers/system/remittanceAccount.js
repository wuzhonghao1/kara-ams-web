import caseReducer from '../caseReducer'

/* 定义初始状态, 每个组件只需要关心自己的状态 */
const initState = {
  addSuccess: false,
  updateSuccess: false,
  delSuccess: false,
  remitPage: {
    count: '',
    pageSize: '',
    result: [],
  },
  isLoading: false,
  initParam: {
    companyId: '',
    regionId: '',
    companyFullName: '',
    pageNo: 1,
    pageSize: 10,
  }
};

function remitAccountAdd(state, action) {
  return {
    ...state,
    addSuccess: true,
  }
}

function getRemitAccount(state, action) {
  return {
    ...state,
    remitPage: action.response.pageInfo,
    initParam: action.params,
    addSuccess: false,
    updateSuccess: false,
    delSuccess: false,
    isLoading: false,
  }
}

function remitAccountDel(state) {
  return {
    ...state,
    delSuccess: true,
  }
}

function remitAccountUpdate(state) {
  return {
    ...state,
    updateSuccess: true,
  }
}

function loadingRequest(state) {
  return {
    ...state,
    isLoading: true,
  }
}

export default caseReducer(initState, {
  LOADING_REQUEST: loadingRequest,
  REMIT_ACCOUNT_ADD_SUCCESS: remitAccountAdd,
  GET_REMIT_ACCOUNT_SUCCESS: getRemitAccount,
  REMIT_ACCOUNT_DEL_SUCCESS: remitAccountDel,
  REMIT_ACCOUNT_UPDATE_SUCCESS: remitAccountUpdate,
})

import caseReducer from '../caseReducer'

const home = {
  myTodos: {},
  myTodosList: [],
  myAssets: {},
  myAssetsList: [],
  myApplicationInquiry: {},
  myApplicationInquiryList: [],
}

function getMyTodos(state, action) {
  return {
    ...state,
    myTodos: action.response.pageInfo,
    myTodosList: action.response.pageInfo.result,
  }
}

function getMyAssets(state, action) {
  return {
    ...state,
    myAssets: action.response.pageInfo,
    myAssetsList: action.response.pageInfo.result,
  }
}

function getMyApplicationInquiry(state, action) {
  return {
    ...state,
    myApplicationInquiry: action.response.pageInfo,
    mpyApplicationInquiryList: action.response.pageInfo.result,
  }
}

export default caseReducer(home, {
  GET_MY_ASSETS_SUCCESS: getMyAssets,
  GET_MY_APPLICATION_INQUIRY_SUCCESS: getMyApplicationInquiry,
  GET_MY_TODOS_SUCCESS: getMyTodos,
})

import caseReducer from '../caseReducer'

/* 定义初始状态, 每个组件只需要关心自己的状态 */
const initState = {
  customRole: [],
  flag: null,
};

function getCustomRole(state, action) {
  return {
    ...state,
    customRole: action.response.results,
  }
}

function refreshList(state) {
  return {
    ...state,
    flag: new Date().getTime(),
  }
}

export default caseReducer(initState, {
  // GET_CUSTOM_ROLE_SUCCESS: getCustomRole,
  REFRESH_LISTS: refreshList,
})

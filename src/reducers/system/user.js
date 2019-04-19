import caseReducer from '../caseReducer'

/* 定义初始状态, 每个组件只需要关心自己的状态 */
const initState = {
  userRoleInfo: {},
};

function getUserRole(state, action) {
  return {
    ...state,
    userRoleInfo: action.response.pageInfo,
  }
}

export default caseReducer(initState, {
  GET_USER_ROLE_SUCCESS: getUserRole,
})

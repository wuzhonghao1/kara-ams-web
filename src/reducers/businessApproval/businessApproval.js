import caseReducer from '../caseReducer'

const businessApproval = {
  searchInfo: {
    result: [],
    pageNo: 1,
    pageSize: 10
  },
  agentInfo: {
    result: [],
    pageNo: 1,
    pageSize: 10
  }
}

function getManagerTask(state, action) {
  return {
    ...state,
    searchInfo: action.response.pageInfo,
  }
}

function getApproveTask(state, action) {
  return {
    ...state,
    searchInfo: action.response.pageInfo,
  }
}

function getAgentList(state, action) {
  return {
    ...state,
    agentInfo: action.response.pageInfo,
  }
}

function getMyAgentList(state, action) {
  return {
    ...state,
    agentInfo: action.response.pageInfo,
  }
}

export default caseReducer(businessApproval, {
  GET_MANAGER_TASK_SUCCESS: getManagerTask, // 管理员
  GET_APPROVE_TASK_SUCCESS: getApproveTask, // 非管理员
  GET_ADMIN_AGENTS_SUCCESS: getAgentList, // 审批代理人列表
  GET_MY_AGENTS_SUCCESS: getMyAgentList, // 我的审批代理人列表
})
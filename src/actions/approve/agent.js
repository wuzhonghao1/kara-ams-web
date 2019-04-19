import { httpApi } from '../../http/reduxRequestMiddleware';
/**
 * 删除审批代理记录
 */
export const approvalAgentDel = (params) => {
  return {
    [httpApi]: {
      url: `/ams/agent/delete/${params}`,
      options: {
        method: 'POST',
      },
      types: ['APPROVAL_AGENT_DELETE_SUCCESS'],
    },
  }
};
/**
 * 审批代理人添加
 * @param params
 * @returns {{params: *}}
 */
export const approvalAgentAdd = (params) => {
  return {
    [httpApi]: {
      url: '/ams/agent/add',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['APPROVAL_AGENT_ADD_SUCCESS'],
    },
  }
};
/**
 * 审批代理人修改
 * @param params
 * @returns {{}}
 */
export const approvalAgentUpdate = (params) => {
  return {
    [httpApi]: {
      url: '/ams/agent/update',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['APPROVAL_AGENT_UPDATE_SUCCESS'],
    },
  }
};
/**
 * 获取我的代理审批人
 * @param params
 * @returns {{}}
 */
export const getMyAgents = (params) => {
  return {
    [httpApi]: {
      url: '/ams/agent/myAgents',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['GET_MY_AGENTS_SUCCESS'],
    },
  }
};
/**
 * 系统管理员获取审批代理人列表
 * @param params
 * @returns {{}}
 */
export const getAdminAgents = (params) => {
  return {
    [httpApi]: {
      url: '/ams/agent/list',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['GET_ADMIN_AGENTS_SUCCESS'],
    },
  }
};

/**
 * 非系统管理员审批查询
 */
export const approveTask = (params) => {
  return {
    [httpApi]: {
      url: '/ams/approve/myTasks',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['GET_APPROVE_TASK_SUCCESS'],
    },
  }
};

/**
 * 批量审批
 * approveIds	String审批记录(任务)id
 * approveStatus	approveStatus审批结果(yes/no)
 * approveRemark 可选	String 审批意见(结果是no时必须传)
 */
export const approveBatch = (params) => {
  return {
    [httpApi]: {
      url: '/ams/approve/batchSubmit',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['APPROVE_TASK_BATCH_SUCCESS'],
    },
  }
};

/**
 * 单个审批
 * approveId	String审批记录(任务)id
 * approveStatus	approveStatus审批结果(yes/no)
 * approveRemark 可选	String审批意见(结果是no时必须传)
 */
export const approveSub = (params) => {
  return {
    [httpApi]: {
      url: '/ams/approve/submit',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['APPROVE_TASK_SUB_SUCCESS'],
    },
  }
};

/**
 * 任务转发
 * approveIds	String[]审批记录(任务)id列表
 * deliverPersonId	approveStatus任务转发给谁(personId)
 * deliverReason	String转发原因
 */
export const taskDelivery = (params) => {
  return {
    [httpApi]: {
      url: '/ams/approve/taskDelivery',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['TASK_DELIVERY_SUCCESS'],
    },
  }
};

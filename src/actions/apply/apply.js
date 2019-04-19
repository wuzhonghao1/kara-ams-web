import { httpApi } from '../../http/reduxRequestMiddleware';

// 获取我的资产
export const getAsset = (params) => {
  return {
    [httpApi]: {
      url: '/ams/asset/queryAssets',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['GET_ASSET_SUCCESS'],
    },
  }
};

// 资产申请单 save
export const assetSave = (params) => {
  return {
    [httpApi]: {
      url: '/ams/voucher/save',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['ASSET_SAVE_SUCCESS'],
    },
  }
};

// 资产申请单 submit
export const assetSubmit = (params) => {
  return {
    [httpApi]: {
      url: '/ams/voucher/submit',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['ASSET_SUBMIT_SUCCESS'],
    },
  }
};

// 获取申请单详情
export const getApplyInfo = (id) => {
  return {
    [httpApi]: {
      url: `/ams/voucher/voucher/${id}`,
      types: ['GET_APPLY_INFO_SUCCESS'],
    },
  }
};

// 编辑申请单 新增 资产数据
export const addAsset = (voucherId,params) => {
  return {
    [httpApi]: {
      url: `/ams/voucher/asset/add/${voucherId}`,
      options: {
        method: 'POST',
        body: {assetInfos: params},
      },
      types: ['ADD_ASSET_SUCCESS'],
    },
  }
};

// 编辑申请单 删除 资产数据
export const deleteAsset = (voucherId,itemId) => {
  return {
    [httpApi]: {
      url: `/ams/voucher/asset/remove/${voucherId}`,
      options: {
        method: 'POST',
        body: {
          itemIds: itemId
        }
      },
      types: ['DELETE_ASSET_SUCCESS'],
    },
  }
};

// 修改资产剩余价值
export const updateAsset = (params) => {
  return {
    [httpApi]: {
      url: '/ams/voucher/asset/update',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['UPDATE_ASSET_SUCCESS'],
    },
  }
};

// 单个审批
export const approveSingle = (params) => {
  return {
    [httpApi]: {
      url: '/ams/approve/submit',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['APPROVE_SINGLE_SUCCESS'],
    },
  }
};

// 批量审批
export const approveBatch = (params) => {
  return {
    [httpApi]: {
      url: '/ams/approve/batchSubmit',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['APPROVE_BATCH_SUCCESS'],
    },
  }
};

// 任务转发
export const taskForward = (params) => {
  return {
    [httpApi]: {
      url: '/ams/approve/taskDelivery',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['TASK_FORWARD_SUCCESS'],
    },
  }
};


/*
 * 修改新责任人
 * voucherId	String 申请单id
 * newPersonId	String 新责任人personId
 * newCCId	String 新责任人CCID
 * newCompanyId	String 新责任人公司id
 * newRegionId	String 新责任人地区id
 * newSbuId  String	新责任人sbuId
 */
export const changeNew = (params) => {
  return {
    [httpApi]: {
      url: '/ams/voucher/change/new',
      options: {
        method: 'POST',
        body: params,
      },
      types: ['CHANGE_NEW_OWNER_SUCCESS'],
    },
  }
};

/**
 * 任务流程
 */
export const getWorkFlow = (id) => {
  return {
    [httpApi]: {
      url: `/ams/voucher/workflow/${id}`,
      options: {
        method: 'GET',
      },
      types: ['GET_WORK_FLOW_SUCCESS'],
    },
  }
};
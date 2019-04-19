import { httpApi } from '../../http/reduxRequestMiddleware';
/**
 * 获取IT资产大类
 * @returns {{}}
 */
export const getMyAssetSearch = (body) => {
  return {
    [httpApi]: {
      options: {
        method: 'POST',
        body,
      },
      url: '/ams/asset/myAssets',
      types: ['GET_MY_ASSETS_SEARCH_SUCCESS'],
    },
  }
};

/**
 * 获取产管理员/系统管理员查询范围内资产
 * @returns {{}}
 */
export const getManagerSearch = (body) => {
  return {
    [httpApi]: {
      options: {
        method: 'POST',
        body,
      },
      url: '/ams/manager/asset/list',
      types: ['GET_MANAGER_SEARCH_SUCCESS'],
    },
  }
};


/**
 * 资产管理_CCOwner查询
 * @returns {{}}
 */
export const getCcOwnerManageSearch = (body) => {
  return {
    [httpApi]: {
      options: {
        method: 'POST',
        body,
      },
      url: '/ams/asset/CCAssets',
      types: ['GET_CCOWNER_MANAGE_SEARCH_SUCCESS'],
    },
  }
};


/**
 * 资产管理_日志查询
 * @returns {{}}
 */
export const getModifyLogs = (assetId, serialNumber) => {
  return {
    [httpApi]: {
      url: `/ams/asset/changeHistory/${assetId}`,
      types: ['GET_MODIFY_LOGS_SUCCESS'],
    },
    serialNumber,
  }
};

/**
 * 资产管理_更新资产描述
 * @returns {{}}
 */
export const updateAssetDesc = (body) => {
  return {
    [httpApi]: {
      options: {
        method: 'POST',
        body,
      },
      url: `/ams/manager/assetDesc/update`,
      types: ['UPDATE_ASSET_DESC_SUCCESS'],
    },
  }
};

/**
 * 资产管理_上级经理获取资产列表
 * @returns {{}}
 */
export const getSubList = (body) => {
  return {
    [httpApi]: {
      options: {
        method: 'POST',
        body,
      },
      url: `/ams/manager/asset/subordinateslist`,
      types: ['GET_SUBORDINATES_LIST_SUCCESS', 'GET_SUB_FAILURE'],
    },
  }
};

/**
 * 资产管理_SBU领导获取资产列表
 * @returns {{}}
 */
export const getBuAssetList = (body) => {
  return {
    [httpApi]: {
      options: {
        method: 'POST',
        body,
      },
      url: `/ams/manager/asset/getBUAssetList`,
      types: ['GET_BUASSET_LIST_SUCCESS', 'GET_BU_FAILURE'],
    },
  }
};

/**
 * 资产管理_上级导报表
 * @returns {{}}
 */
export const subordinateExcel = (body) => {
  return {
    [httpApi]: {
      options: {
        method: 'POST',
        body,
      },
      url: `/ams/leader/assetExcel`,
      types: ['GET_LIADER_EXCEL_SUCCESS'],
    },
  }
};

/**
 * 资产管理_SBU导报表
 * @returns {{}}
 */
export const sbuExcel = (body) => {
  return {
    [httpApi]: {
      options: {
        method: 'POST',
        body,
      },
      url: `/ams/sbu/assetExcel`,
      types: ['GET_SBU_EXCEL_SUCCESS'],
    },
  }
};

/**
 * 资产管理_管理员资产导出
 * @returns {{}}
 */
export const exportManagerAsset = (body) => {
  return {
    [httpApi]: {
      options: {
        method: 'POST',
        body,
      },
      url: '/ams/manager/assetExcel',
      types: ['EXPORT_MANAGER_ASSET'],
    },
  }
};

/**
 * 资产管理_我的资产导出
 * @returns {{}}
 */
export const exportMyAsset = (body) => {
  return {
    [httpApi]: {
      options: {
        method: 'POST',
        body,
      },
      url: '/ams/asset/myAssetExcel',
      types: ['EXPORT_MY_ASSET'],
    },
  }
};

/**
 * 资产管理_CCOwner资产导出
 * @returns {{}}
 */
export const exportCCOwnerAsset = (body) => {
  return {
    [httpApi]: {
      options: {
        method: 'POST',
        body,
      },
      url: '/ams/asset/CCAssetExcel',
      types: ['EXPORT_CCOWNER_ASSET'],
    },
  }
};

/**
 * 资产管理_CCOwner资产清空
 * @returns {{}}
 */
export const clearCCAssetsTable = () => ({ type: "GET_CCASSETS_TABLE_CLEARED_SUCCESS" });

/**
 * 资产管理_manager资产清空
 * @returns {{}}
 */

export const clearManagerAssetsTable = () => ({ type: "GET_MANAGER_ASSETS_TABLE_CLEARED_SUCCESS" });


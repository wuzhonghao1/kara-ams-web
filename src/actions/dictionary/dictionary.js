/**
 * 数据字典统一接口
 */
import { httpApi } from '../../http/reduxRequestMiddleware';
/**
 * 获取BG信息
 * @param params
 * @returns {{params: *}}
 */
export const getBusinessGroups = () => {
  return {
    [httpApi]: {
      url: '/outer/orgInfo/getBusinessGroupList',
      types: ['GET_BUSINESS_GROUPS_SUCCESS'],
    },
  }
};
/**
 * 获取地区信息
 * @returns {{}}
 */
export const getRegionInfo = () => {
  return {
    [httpApi]: {
      url: `/outer/orgInfo/getRegionInfoList`,
      types: ['GET_REGION_INFO_SUCCESS'],
    },
  }
};
/**
 * 获取SBU信息
 * @returns {{}}
 */
export const getSbuInfo = (bgCode) => {
  return {
    [httpApi]: {
      url: `/outer/orgInfo/getSbuInfoList?bgCode=${bgCode}`,
      types: ['GET_SBU_INFO_SUCCESS'],
    },
  }
};
/**
 * 获取公司信息
 * @returns {{}}
 */
export const getCompanyInfo = (bgCode) => {
  return {
    [httpApi]: {
      url: `/outer/orgInfo/getCompanyInfoList?bgCode=${bgCode}`,
      types: ['GET_COMPANY_INFO_SUCCESS'],
    },
  }
};
/**
 * 获取部门信息
 * @returns {{}}
 */
export const getOrgCostCenterInfo = (bgId, costcenterId) => {
  return {
    [httpApi]: {
      url: `/outer/orgInfo/queryOrgCostCenterCurInfoByCCId/${bgId}?costcenterId=${costcenterId}`,
      types: ['GET_COST_CENTER_SUCCESS'],
    },
  }
};

/**
 * 资产大类
 * @returns {{}}
 */
export const getAssetCategoryParam = () => {
  return {
    [httpApi]: {
      url: '/ams/system/getParamList/ASSET/ASSET_CATEGORY',
      types: ['GET_ASSET_CATEGORY_PARAM_SUCCESS'],
    },
  }
};

/**
 * 申请单类型
 * @returns {{}}
 */
export const getVoucherTypeParam = () => {
  return {
    [httpApi]: {
      url: '/ams/system/getParamList/VOUCHER/VOUCHER_TYPE',
      types: ['GET_VOUCHER_TYPE_PARAM_SUCCESS'],
    },
  }
};
 /* 获取申请单状态
 * @returns {{}}
 */
export const getApplyStatus = () => {
    return {
        [httpApi]: {
            url: '/ams/system/getParamList/VOUCHER/VOUCHER_STATUS',
            options: {
                method: 'GET'
            },
            types: ['GET_VOUCHER_STATUS_SUCCESS'],
        },
    }
};

/**
 * 获取IT资产大类
 * @returns {{}}
 */
export const getAssetsType = () => {
  return {
      [httpApi]: {
          url: '/ams/system/getParamList/ASSET/IT_ASSET_TYPE',
          types: ['GET_IT_ASSETS_TYPE_SUCCESS'],
      },
  }
};

/**
 * 获取行政资产大类
 * @returns {{}}
 */
export const getAdminAssetsType = () => {
  return {
      [httpApi]: {
          url: '/ams/system/getParamList/ASSET/ADMIN_ASSET_TYPE',
          types: ['GET_ADMIN_ASSET_TYPE_SUCCESS'],
      },
  }
};


/**
 * 获取资产关键字
 * @returns {{}}
 */
export const getAssetKey = () => {
  return {
      [httpApi]: {
          url: '/ams/system/getParamList/ASSET/ASSET_KEY',
          types: ['GET_ASSET_KEY_SUCCESS'],
      },
  }
};

/**
 * 获取变更项
 * @returns {{}}
 */
export const getChangeOption = () => {
  return {
      [httpApi]: {
          url: '/ams/system/getParamList/CHANGE_OPTION/CHANGE_OPTION',
          types: ['GET_CHANGE_OPTION_SUCCESS'],
      },
  }
};

/**
 * 获取角色访问权限
 * @returns {{}}
 */
export const getAllRoleView = () => {
  return {
    [httpApi]: {
      url: '/ams/system/getParamList/USER/ROLE_BUSINESS',
      types: ['GET_ALL_ROLE_VIEW_SUCCESS'],
    },
  }
};

/**
 * 获取确认结果changeStatus
 * @returns {{}}
 */
export const getChangeStatus = () => {
  return {
    [httpApi]: {
      url: '/ams/system/getParamList/ASSET_CHANGE/CHANGE_STATUS',
      types: ['GET_CHANGE_STATUS_SUCCESS'],
    },
  }
};


/**
 * 催交
 * @returns {{}}
 */
export const reminder = (params) => {
  return {
    [httpApi]: {
      url: `/ams/approve/reminder/${params}`,
      options: {
        method: 'POST',
        body: {
          voucherId: params
        }
      },
      types: ['REMINDER_SUCCESS'],
    },
  }
}

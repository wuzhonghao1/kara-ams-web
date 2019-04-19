import { httpApi } from '../http/reduxRequestMiddleware'

/**
 * 获取申请单列表
 * @returns {{}}
 */
export const DoSearch = (body) => {
    return {
        [httpApi]: {
            url: '/ams/voucher/myVouchers',
            options: {
                method: 'POST',
                body: body
            },
            types: ['GET_APPLICATION_LIST_SUCCESS'],
        },
    }
}

/**
 * 获取管理员申请单列表
 * @returns {{}}
 */
export const DoAdminSearch = (body) => {
    return {
        [httpApi]: {
            url: '/ams/manager/voucher/list',
            options: {
                method: 'POST',
                body: body
            },
            types: ['GET_ADMIN_APPLICATION_LIST_SUCCESS'],
        },
    }
}

/**
 * 撤销申请单
 * @returns {{}}
 */
export const cancelApplication = (voucherId, reason) => {
    return {
        [httpApi]: {
            url: `/ams/voucher/cancel`,
            options: {
                method: 'POST',
                body: {
                  voucherId: voucherId,
                  remark: reason
                }
            },
            types: ['CANCEL_APPLICATION_SUCCESS'],
        },
    }
}

/**
 * 催办申请单
 * @returns {{}}
 */
export const urgeApplication = (voucherId) => {
    return {
        [httpApi]: {
            url: `/ams/manager/urge/${voucherId}`,
            options: {
                method: 'POST',
                body: {
                  approveId: voucherId
                }
            },
            types: ['URGE_APPLICATION_SUCCESS'],
        },
    }
}

/**
 * 修改审批人 single
 * @returns {{}}
 */
export const changeApprover = (params) => {
  return {
    [httpApi]: {
      url: `/ams/approve/changeApprover`,
      options: {
        method: 'POST',
        body: params
      },
      types: ['CHANGE_APPROVER_SUCCESS'],
    },
  }
}

/**
 * 修改审批人 批量
 * @returns {{}}
 */
export const batchChangeApprover = (params) => {
  return {
    [httpApi]: {
      url: `/ams/approve/batchChange`,
      options: {
        method: 'POST',
        body: params
      },
      types: ['BATCH_CHANGE_APPROVER_SUCCESS'],
    },
  }
}

/**
 * 导出EXCEL
 * @returns {{}}
 */
export const exportExcel = (params) => {
  return {
    [httpApi]: {
      url: `/ams/voucher/myVouchersExcel`,
      acceptType: 'blob',
      options: {
        method: 'POST',
        body: params
      },
      types: ['EXPORT_EXCEL_SUCCESS'],
    },
  }
}

/**
 * 导出管理员EXCEL
 * @returns {{}}
 */
export const exportMangerExcel = (params) => {
  return {
    [httpApi]: {
      url: `/ams/manager/vouchersExcel`,
      acceptType: 'blob',
      options: {
        method: 'POST',
        body: params
      },
      types: ['EXPORT_EXCEL_SUCCESS'],
    },
  }
}
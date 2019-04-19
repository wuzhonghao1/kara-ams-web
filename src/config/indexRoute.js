import Home from '../containers/home/index'
import Test from '../components/test/test'
import NoMatch from '../components/noMatch/noMatch'
import BusinessApprovalSearch from '../containers/businessApproval/Search'
import BusinessApprovalAgent from '../containers/businessApproval/agent'
import ApplicationSearch from '../containers/applicationSearch/Search'
import FinancialAudit from '../containers/financialAudit/Platform'
import ApplyTransfer from '../containers/apply/transfer'
import ApplyCompensate from '../containers/apply/compensate'
import ApplyInvalidate from '../containers/apply/invalidate'
import transferDetail from '../containers/apply/transferDetail'
import compensateDetail from '../containers/apply/compensateDetail'
import invalidateDetail from '../containers/apply/invalidateDetail'
import InvalidateInfo from '../components/apply/invalidateInfo/invalidateInfo'
import OwnerConfirm from '../containers/assetsCheck/ownerConfirm'
import OwnerConfirmDetail from '../containers/assetsCheck/ownerConfirmDetail'
import CCOwnerConfirmCheck from '../containers/assetsCheck/ccOwnerConfirm'
import CCOwnerConfirmDetail from '../containers/assetsCheck/ccOwnerConfirmDetail'
import CCOwnerConfirm from '../containers/assetsTransfer/ccOwnerConfirm'
import TaskSetting from '../containers/assetsCheck/taskSetting'
import TaskQuery from '../containers/assetsCheck/taskQuery'
import TaskDetailQuery from '../containers/assetsCheck/taskDetailQuery'
import RemittanceAccount from '../containers/system/remittanceAccount'
import SystemUser from '../containers/system/user'
import SystemRole from '../containers/system/role'
import MyAsset from '../containers/assetInquiry/myAsset'
import CcManage from '../containers/assetInquiry/ccManage'
import Manager from '../containers/assetInquiry/manager'
import ManagerSbu from '../containers/assetInquiry/managerSbu'
import BuAsset from '../containers/assetInquiry/buAsset'

export default [
  {
    exact: true,
    path: '',
    title: '',
    component: Home,
  },
  {
    exact: true,
    path: 'apply/transfer',
    title: '资产转移申请',
    component: ApplyTransfer,
  },
  {
    path: 'apply/transfer/:id',
    title: '资产转移申请',
    component: ApplyTransfer,
  },
  {
    exact: true,
    path: 'apply/transferDetail/:id',
    title: '资产转移详情',
    component: transferDetail,
  },
  {
    exact: true,
    path: 'apply/compensate',
    title: '资产赔偿申请',
    component: ApplyCompensate,
  },
  {
    exact: true,
    path: 'apply/compensate/:id',
    title: '资产赔偿申请',
    component: ApplyCompensate,
  },
  {
    exact: true,
    path: 'apply/compensateDetail/:id',
    title: '资产转移详情',
    component: compensateDetail,
  },
  {
    exact: true,
    path: 'apply/invalidate',
    title: '资产报废申请',
    component: ApplyInvalidate,
  },
  {
    path: 'apply/invalidate/:id',
    title: '资产报废申请',
    component: ApplyInvalidate,
  },
  {
    exact: true,
    path: 'apply/invalidateDetail/:id',
    title: '资产转移详情',
    component: invalidateDetail,
  },
  {
    exact: true,
    path: 'businessApproval/search',
    title: '业务审批查询',
    component: BusinessApprovalSearch,
  },
  {
    exact: true,
    path: 'businessApproval/agent',
    title: '审批代理人维护',
    component: BusinessApprovalAgent,
  },
  {
    exact: true,
    path: 'applicationSearch/search',
    title: '申请单查询',
    component: ApplicationSearch,
  },
  {
    exact: true,
    path: 'financialAudit/platform',
    title: '财务审核平台',
    component: FinancialAudit,
  },
  {
    exact: true,
    path: 'financialAudit/platform/transfer/:id',
    title: '资产转移财务审核平台审批',
    component: ApplyTransfer,
  },
  {
    exact: true,
    path: 'financialAudit/platform/compensate/:id',
    title: '资产赔偿财务审核平台审批',
    component: ApplyCompensate,
  },
  {
    exact: true,
    path: 'financialAudit/platform/invalidate/:id',
    title: '资产报废财务审核平台审批',
    component: ApplyInvalidate,
  },
  {
    exact: true,
    path: 'transfer/ccOwnerConfirm',
    title: 'CCowner确认',
    component: CCOwnerConfirm,
  },
  {
    exact: true,
    path: 'assetsCheck/ownerConfirm',
    title: '资产Owner确认',
    component: OwnerConfirm,
  },
  {
    exact: true,
    path: 'assetsCheck/ownerConfirmDetail/:id',
    title: '资产Owner确认详情',
    component: OwnerConfirmDetail,
  },
  {
    exact: true,
    path: 'assetsCheck/ccOwnerConfirm',
    title: 'CCOwner确认',
    component: CCOwnerConfirmCheck,
  },
  {
    exact: true,
    path: 'assetsCheck/ccOwnerConfirm/:id',
    title: 'CCOwner确认详情',
    component: CCOwnerConfirmDetail,
  },
  {
    exact: true,
    path: 'assetsCheck/taskQuery',
    title: '盘点任务查询',
    component: TaskQuery,
  },
  {
    exact: true,
    path: 'assetsCheck/taskSetting',
    title: '盘点任务设置',
    component: TaskSetting,

  },{
    path: 'assetsCheck/taskDetailQuery/:taskId/:taskName/:taskType',
    title: '盘点任务明细查询',
    component: TaskDetailQuery,
  },
  {
    exact: true,
    path: 'assetInquiry/myAsset',
    title: '菜单权限',
    component: MyAsset,
  },
  {
    exact: true,
    path: 'assetInquiry/ccManage',
    title: '菜单权限',
    component: CcManage,
  },
  {
    exact: true,
    path: 'assetInquiry/manager',
    title: '菜单权限',
    component: Manager,
  },
  {
    exact: true,
    path: 'assetInquiry/managerSbu',
    title: '上级经理查询',
    component: ManagerSbu,
  },
  {
    exact: true,
    path: 'assetInquiry/buAsset',
    title: 'BU资产查询',
    component: BuAsset,
  },
  {
    exact: true,
    path: 'system/remittanceAccount',
    title: '汇款账号维护',
    component: RemittanceAccount,
  },
  {
    exact: true,
    path: 'system/role',
    title: '角色管理',
    component: SystemRole,
  },
  {
    exact: true,
    path: 'system/user',
    title: '用户管理',
    component: SystemUser,
  },
  {
    component: NoMatch, // 没有匹配放到最后
  },
]

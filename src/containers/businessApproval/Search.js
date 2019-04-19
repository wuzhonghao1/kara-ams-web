import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import BusinessApprovalSearch from '../../components/businessApproval/Search'
import { getVoucherTypeParam, getApplyStatus, getAssetCategoryParam,
  getAssetKey, getOrgCostCenterInfo, reminder } from '../../actions/dictionary/dictionary'
import {
  approveTask,
  approveBatch,
  approveSub,
  taskDelivery,
} from '../../actions/approve/agent'

const mapDispatchToProps = dispatch=>({
  ...bindActionCreators({
    getApplyStatus,
    getAssetCategoryParam,
    getVoucherTypeParam,
    getAssetKey,
    getOrgCostCenterInfo,
    approveTask, // 非管理员查询
    approveBatch, // 批量审批
    approveSub, // 单个审批
    taskDelivery, // 批量转发
    reminder, // 催交
  }, dispatch),
  dispatch: dispatch
})

const mapStateToProps = state=>({
  ...state.businessApproval,
  dictionary: state.dictionary,
  user: state.user,
})

export default connect(mapStateToProps, mapDispatchToProps)(BusinessApprovalSearch)

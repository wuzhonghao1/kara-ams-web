import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ApproveProxy from '../../components/businessApproval/agent/agent'
import { getAdminAgents, getMyAgents, approvalAgentAdd, approvalAgentDel, approvalAgentUpdate } from '../../actions/approve/agent'
import { getVoucherTypeParam, getApplyStatus, getAssetCategoryParam, getAssetKey } from '../../actions/dictionary/dictionary'

const mapDispatchToProps = dispatch=>({
  ...bindActionCreators({
    getApplyStatus,
    getAssetCategoryParam,
    getVoucherTypeParam,
    getAssetKey,
    getAdminAgents, // 系统管理员获取审批代理人列表
    getMyAgents, // 获取我的代理审批人
    approvalAgentAdd, // 添加代理审批人
    approvalAgentDel, // 删除审批记录
    approvalAgentUpdate, // 审批人修改
  }, dispatch),
  dispatch: dispatch
})

const mapStateToProps = state=>({
  dictionary: state.dictionary,
  agentInfo: state.businessApproval.agentInfo,
  user: state.user,
})

export default connect(mapStateToProps, mapDispatchToProps)(ApproveProxy)
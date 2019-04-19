import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ApplicationSearchSearch from '../../components/applicationSearch/Search'
import * as actions from '../../actions/applicationSearch'
import {getVoucherTypeParam, getApplyStatus, getAssetCategoryParam,
  getAssetKey, getOrgCostCenterInfo} from '../../actions/dictionary/dictionary'

const mapStateToProps = state=>({
    ...state.applicationSearch,
    dictionary:state.dictionary,
    user: state.user
})

const mapDispatchToProps = dispatch=>({
  ...bindActionCreators({
      ...actions,
      getVoucherTypeParam: getVoucherTypeParam,
      getApplyStatus: getApplyStatus,
      getAssetCategoryParam: getAssetCategoryParam,
      getAssetKey: getAssetKey,
      getOrgCostCenterInfo: getOrgCostCenterInfo,
      // changeApprover: changeApprover,
      // batchChangeApprover: batchChangeApprover,
    }, dispatch),
    dispatch: dispatch
})

export default connect(mapStateToProps, mapDispatchToProps)(ApplicationSearchSearch)

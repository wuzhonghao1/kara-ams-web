import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import RemittanceAccount from '../../components/system/remittance/remittanceAccount'
import { remitAccountAdd, getRemitAccount, remitAccountUpdate, remitAccountDel } from '../../actions/system/remittanceAccount';

const mapStateToProps = state=>({
  remit: state.system.remit,
  companyList: state.dictionary.companyList,
  regionList: state.dictionary.regionList,
});

const mapDispatchToProps = dispatch=>({
    ...bindActionCreators({remitAccountAdd, getRemitAccount, remitAccountUpdate, remitAccountDel}, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(RemittanceAccount)

import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { menuCollapsed } from '../actions/menu'
import Main from '../components/main/main'
import { getBusinessGroups, getCompanyInfo, getOrgCostCenterInfo, getRegionInfo, getSbuInfo, getAssetCategoryParam, getVoucherTypeParam, getAssetKey, getChangeOption, getChangeStatus} from '../actions/dictionary/dictionary'


const mapStateToProps = state => ({
  collapsed: state.menu.collapsed,
  user: state.user,
});

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    menuCollapsed,
    getBusinessGroups,
    getCompanyInfo,
    getOrgCostCenterInfo,
    getRegionInfo,
    getSbuInfo,
    getAssetCategoryParam,
    getVoucherTypeParam,
    getAssetKey,
    getChangeOption,
    getChangeStatus,
  }, dispatch)
);


//  eslint-disable-next-line react/prefer-stateless-function
class Container extends React.Component {
  componentDidMount() {
    sessionStorage.setItem('menu', undefined)
    const { user } = this.props
    const { companyId, bgId } = user
    const bgCode = companyId.substring(0,1)
    this.props.getBusinessGroups()
    this.props.getCompanyInfo(bgCode)
    this.props.getSbuInfo(bgCode)
    this.props.getRegionInfo()
    // this.props.getOrgCostCenterInfo(bgId)
    this.props.getAssetCategoryParam()
    this.props.getVoucherTypeParam()
    this.props.getAssetKey()
    this.props.getChangeStatus()
    this.props.getChangeOption()
  }
  render() {
    return (
      <Main {...this.props} />
    );
  }

}


export default connect(mapStateToProps, mapDispatchToProps)(Container)

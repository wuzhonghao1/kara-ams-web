import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React from 'react'
import CCOwnerConfirm from '../../components/assetsTransfer/ccOwnerConfirm'
import { getCCOwnerSearch, getCCOwnerExport, getCCOwnerConfirm, clearTable } from '../../actions/assetTransfer/ccOwnerConfirm'
import { getOrgCostCenterInfo } from '../../actions/dictionary/dictionary'

const mapStateToProps = state=>({
  user: state.user,
  dictionary: state.dictionary,
  assetChangeListPageInfo: state.assetTransfer.assetChangeListPageInfo,
})

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators({
      getCCOwnerSearch,
      getCCOwnerExport,
      getCCOwnerConfirm,
      getOrgCostCenterInfo,
      clearTable
  }, dispatch),
  dispatch
}
);

class Container extends React.Component {

    render() {
        return <CCOwnerConfirm {...this.props} />
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Container)

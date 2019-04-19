import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import React from 'react'
import OwnerConfirmDetail from '../../components/assetsCheck/ownerConfirm/ownerConfirmDetail'
import {getOwnerDetail, ownerDelConfirm, assetOpt} from '../../actions/assetsCheck/ownerConfirm'

const mapStateToProps = state => ({
  ownerConfirm: this.state,
  taskStatus: state.ownerConfirm.taskStatus,
})

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    getOwnerDetail,
    ownerDelConfirm,
    assetOpt
  }, dispatch)
);

class Container extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return <OwnerConfirmDetail {...this.props} />
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Container)

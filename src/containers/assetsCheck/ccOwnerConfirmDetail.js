import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React from 'react'
import CCOwnerConfirmDetail from '../../components/assetsCheck/ccOwnerConfirm/ccOwnerConfirmDetail'
import { getDetail } from '../../actions/assetsCheck/ccOwnerConfirm'
import { getCCConfirmList } from '../../actions/assetsCheck/ccOwnerConfirmDetail'
import { ownerDelConfirm } from '../../actions/assetsCheck/ownerConfirm'

const mapStateToProps = state=>({
  ownerConfirm: this.state,
  dictionary:state.dictionary,
})

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators({
      getDetail,
      getCCConfirmList,
      ownerDelConfirm,
    }, dispatch),
    dispatch: dispatch
  }
);

class Container extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {
        return <CCOwnerConfirmDetail {...this.props} />
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Container)

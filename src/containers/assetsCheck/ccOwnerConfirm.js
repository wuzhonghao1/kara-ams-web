import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React from 'react'
import CCOwnerConfirm from '../../components/assetsCheck/ccOwnerConfirm/ccOwnerConfirm'
import { getList } from '../../actions/assetsCheck/taskSetting'
import { getTaskList } from '../../actions/assetsCheck/ccOwnerConfirm'

const mapStateToProps = state=>({
    ownerConfirm: this.state
})

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        getList,
      getTaskList,
    }, dispatch)
);

class Container extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {
        return <CCOwnerConfirm {...this.props} />
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Container)

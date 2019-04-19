import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React from 'react'
import TaskDetailQuery from '../../components/assetsCheck/taskQuery/taskDetailQuery'
import { getDetailList,getTaskNameList,exportSnapshotDetail } from '../../actions/assetsCheck/taskQuery'
import { getOrgCostCenterInfo,getAssetsType, getAdminAssetsType } from '../../actions/dictionary/dictionary'

const mapStateToProps = state=>({
    dictionary:state.dictionary,
    taskDetail: state.taskDetailQuery.detail
})

const mapDispatchToProps = dispatch => ({
        ...bindActionCreators({
            getDetailList,
            getTaskNameList,
            getOrgCostCenterInfo,
            exportSnapshotDetail,
            getAssetsType,
            getAdminAssetsType
        }, dispatch),
        dispatch
    }
);

class Container extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {
        return <TaskDetailQuery {...this.props} />
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Container)

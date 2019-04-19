import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React from 'react'
import TaskSetting from '../../components/assetsCheck/taskSetting/taskSetting'
import { getTaskSettingQueryList, closeTask, addTask, editTask, getTaskSettingDetail,cancelTask } from '../../actions/assetsCheck/taskSetting'
import { getTaskNameList } from '../../actions/assetsCheck/taskQuery'
import { getOrgCostCenterInfo } from '../../actions/dictionary/dictionary'

const mapStateToProps = state=>({
    taskSetting: state.taskSetting.taskSettingList,
    taskDetail: state.taskSetting.taskSettingDetail,
    dictionary:state.dictionary,
    user: state.user
})

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        getTaskSettingQueryList,
        getTaskNameList,
        getOrgCostCenterInfo,
        addTask,
        closeTask,
        getTaskSettingDetail,
        editTask,
        cancelTask
    }, dispatch)
);

class Container extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {
        return <TaskSetting {...this.props} />
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Container)

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React from 'react'
import TaskQuery from '../../components/assetsCheck/taskQuery/taskQuery'
import { getTaskList, getTaskNameList, exportTaskDeail } from '../../actions/assetsCheck/taskQuery'

const mapStateToProps = state=>({
    taskQuery: state.taskQuery,
    dictionary:state.dictionary,
})

const mapDispatchToProps = dispatch => ({
    ...bindActionCreators({
        getTaskList,
        getTaskNameList,
        exportTaskDeail,
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
        return <TaskQuery {...this.props} />
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Container)

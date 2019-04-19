import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import React from 'react'
import OwnerConfirm from '../../components/assetsCheck/ownerConfirm/ownerConfirm'
import {getOwnerList, getOwnerDetail, ownerStatus} from '../../actions/assetsCheck/ownerConfirm'
import {getList} from '../../actions/assetsCheck/taskSetting'

const mapStateToProps = state => ({
  searchRes: state.ownerConfirm.ownerList,
  taskCount: state.ownerConfirm.taskCount,
})

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    getOwnerList,
    getOwnerDetail,
    ownerStatus,
    getList, // 名称查询
  }, dispatch)
);

class Container extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      task: null,
    }
  }

  componentWillMount() {
    this.props.getOwnerList({
      pageNo: "1",
      pageSize: "10",
      taskStatus: "10",
      taskName: '',
      year: ''
    }).then(res => {
      if(res && res.response && res.response.taskCount) {
        this.setState({ task: res.response.taskCount })
      }
    })
  }

  render() {
    return <OwnerConfirm {...this.props} task={this.state.task}/>
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Container)

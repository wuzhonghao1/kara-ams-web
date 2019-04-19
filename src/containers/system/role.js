import React from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import { Alert } from 'antd';
import Role from '../../components/system/role/role'
import { getCustomRole, addCustomRole, deleteCustomRole, updateCustomRole, getRoleView, setRoleView, setRoleMenu, getRoleMenu, refresh } from '../../actions/system/role'
import { getAllRoleView } from '../../actions/dictionary/dictionary'

const mapStateToProps = state => ({
  flag: state.system.role.flag
});

const actions = {
  getCustomRole,
  addCustomRole,
  deleteCustomRole,
  updateCustomRole,
  getRoleView,
  setRoleView,
  getAllRoleView,
  setRoleMenu,
  getRoleMenu,
  refresh,
}

const mapDispatchToProps = dispatch=>({
  ...bindActionCreators(actions, dispatch),
  dispatch: dispatch
})

class Container extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  render(){
    return <Role {...this.props} />
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Container)
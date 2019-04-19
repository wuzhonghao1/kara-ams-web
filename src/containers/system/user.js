import React from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import { Alert,message } from 'antd';
import User from '../../components/system/user/user'
import {  } from '../../actions/dictionary/dictionary'
import { addUserRole, deleteUserRole, updateUserRole, getUserRole } from '../../actions/system/user'
import { getCustomRole } from '../../actions/system/role'

const mapStateToProps = state => ({
  companyList: state.dictionary.companyList,
  regionList: state.dictionary.regionList,
  assetCategory: state.dictionary.assetCategory,
  userRoleInfo: state.system.user.userRoleInfo
});

const actions = {
  addUserRole,
  getUserRole,
  deleteUserRole,
  updateUserRole,
  getCustomRole,
}

const mapDispatchToProps = dispatch=>({
  ...bindActionCreators(actions, dispatch),
  dispatch: dispatch
})

class Container extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      customRole:[],
    }
  }

  componentWillMount(){
    // 获取用户角色列表
    this.props.getUserRole({pageNo:1,pageSize:10});

    // 获取自定义角色
    this.props.getCustomRole().then(res=>{
      if(res && res.response && res.response.resultCode === '000000') {
        if(res.response.results && res.response.results.length > 0) {
          // 保存角色到state
          this.setState({customRole:res.response.results})
        }else if(res.response.results && res.response.results.length === 0){
          message.warning('暂时没有角色')
        }else{
          message.error('获取角色失败')
        }
      }
    });

  }

  render(){
    const { customRole } = this.state
    const {companyList=[], regionList=[], assetCategory=[] } = this.props

    if(companyList.length === 0 || regionList.length === 0 || assetCategory.length === 0 || customRole.length === 0) {
      return null
      //return <Alert message="没有获取到用户角色信息" type="error" showIcon />
    }

    const userProps = {...this.props,customRole}

    return <User {...userProps} />
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Container)
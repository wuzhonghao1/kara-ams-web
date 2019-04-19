import React from 'react'
import { Card, Row, Col, Form, Radio, Input, Modal, Icon, Select, Table, Button } from 'antd'
import menuData from '../../../config/menu'
import message from '../../common/Notice/notification'
import './menu.less'

class Root extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeRoleView:[],
      allRoleView:[],
    }
  }

  componentWillMount() {

    // 获取当前角色访问权限列表
    this.getRoleView()

    // 获取角色的访问权限列表
    this.props.getAllRoleView().then(res=>{
      if(res && res.response && res.response.resultCode === '000000') {
        if(res.response.results && res.response.results.length === 0) {
          message.warning('角色访问列表为空')
        }else{
          this.setState({allRoleView:res.response.results})
        }
      }else if(res && res.response && res.response.resultMessage){
        message.warning(res.response.resultMessage)
      }else{
        message.error('获取角色访问权限错误')
      }
    })
  }

  getRoleView = () => {
    const { activeUserRole } = this.props

    // 获取当前角色访问权限列表
    this.props.getRoleView(activeUserRole).then(res=>{
      if(res && res.response && res.response.resultCode === '000000') {
        this.setState({activeRoleView:res.response.results})
      }else if(res && res.response && res.response.resultMessage){
        message.warning(res.response.resultMessage)
      }else{
        message.error('获取当前角色访问权限错误')
      }
    })
  }

  getTableColums = () => {
    return [
      {
        title: '数据范围',
        dataIndex: 'paramValueDesc',
        key: 'key',
        width: 400
      },
      {
        title: '设置',
        key: 'operation',
        render: (text, record) => {
          const { isView } = record
          return <Button type={isView ? 'danger' :'primary'} size="default" onClick={()=>{this.setRoleView(record.paramValue)}}>{isView ? '禁用' :'启用'}</Button>
        }
      },
    ]
  }

  // 设置角色权限
  setRoleView = (paramValue) => {
    if(this.roleSet === 'start') {
      message.warning('操作过于频繁')
      return
    }
    const { setRoleView, activeUserRole:userRole, activeUserRole } = this.props
    const businessKeys = []
    for(let v of this.roleViewData) {
      if(v.paramValue === paramValue && v.isView === false) {
        businessKeys.push(v.paramValue)
      }else if(v.paramValue !== paramValue && v.isView === true){
        businessKeys.push(v.paramValue)
      }
    }
    const params = {userRole,businessKeys}
    this.roleSet = 'start'
    setRoleView(params).then(res=>{
      if(res && res.response && res.response.resultCode === '000000') {
        // 重新拉取当前角色权限
        this.props.getRoleView(activeUserRole).then(r=>{
          if(r && r.response && r.response.resultCode === '000000'){
            message.success('设置权限成功')
            this.roleSet = 'success'
            this.setState({activeRoleView:r.response.results})
          }else{
            message.error('设置权限错误')
            this.roleSet = 'error'
          }
        })
      }else{
        message.error('设置权限错误')
        this.roleSet = 'error'
      }
    })
  }


  render() {
    const { activeRoleView, allRoleView } = this.state
    const data = allRoleView.map((v,i)=>{
      let isView = false
      if(activeRoleView.length > 0 && activeRoleView[0].keys && activeRoleView[0].keys.length > 0) {
        for(let a of activeRoleView[0].keys) {
          if(v.paramValue === a) {
            isView = true
            break
          }
        }
      }
      return {...v, key:i+1, isView}
    })
    this.roleViewData = data

    return <div className="m-system-menu">
      <Table
        pagination={false}
        columns={this.getTableColums()}
        dataSource={data}
      />
    </div>
  }
}

export default Form.create()(Root)
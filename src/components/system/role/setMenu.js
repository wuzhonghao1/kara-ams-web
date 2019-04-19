import React from 'react'
import { Card, Row, Col, Form, Radio, Input, Modal, Icon, Select, Table, Button } from 'antd'
import menuData from '../../../config/menu'
import message from '../../common/Notice/notification'
import './menu.less'

class Root extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  componentWillMount() {
    this.getRoleMenu()
  }

  // 获取当前角色菜单权限列表
  getRoleMenu = () => {
    const { activeUserRole } = this.props

    // 获取当前角色菜单权限列表
    this.props.getRoleMenu(activeUserRole).then(res=>{
      if(res && res.response && res.response.resultCode === '000000') {
        this.setState({activeRoleMenu:res.response.results})
      }else if(res && res.response && res.response.resultMessage){
        message.warning(res.response.resultMessage)
      }else{
        message.error('获取当前角色菜单权限错误')
      }
    })
  }

  // 获取菜单数据
  getMenuData = () => {
    const { activeRoleMenu } = this.state
    const data = []
    for(let v of menuData) {
      if(v.path) {
        let is = false
        if(activeRoleMenu && activeRoleMenu.length > 0 && activeRoleMenu[0].keys && activeRoleMenu[0].keys.length > 0) {
          for(let a of activeRoleMenu[0].keys) {
            if(v.path.replace(/\//g,'') === a) {
              is = true
              break
            }
          }
        }

        const subMenu = []
        if(v.subMenu) {
          for(let sv of v.subMenu) {
            if(sv.link && !sv.hidden) {
              let sis = false
              if(is && activeRoleMenu && activeRoleMenu.length > 0 && activeRoleMenu[0].keys && activeRoleMenu[0].keys.length > 0) {
                for(let sa of activeRoleMenu[0].keys) {
                  if(sv.link.replace(/\//g,'') === sa) {
                    sis = true
                    break
                  }
                }
              }
              subMenu.push({...sv, is, sis})
            }
          }
        }

        data.push({...v, subMenu, key:v.path, is})
      }
    }

    this.roleMenuData = data

    return data
  }

  getTableColums = () => {
    return [
      {
        title: '菜单',
        dataIndex: 'name',
        key: 'key',
        width: 400
      },
      {
        title: '设置',
        key: 'operation',
        render: (text, record) => {
          const { is } = record
          return <Button type={is ? 'danger' :'primary'} size="default" onClick={()=>{this.setRoleMenu(record.path.replace(/\//g,''))}}>{is ? '禁用主菜单' :'启用主菜单'}</Button>
        }
      },
    ]
  }

  expandedRowRender = (record) => {
    const { subMenu } = record
    const li = subMenu.map((v, i)=>{
      const { is, sis, link } = v
      console.log('sv',v)
      return v.hidden ? null :<li key={i}>
          <span className="name">{v.name}</span>
          {is ? <Button type={sis ? 'danger' :'primary'} size="default" onClick={()=>{this.setRoleMenu(link.replace(/\//g,''))}}>{sis ? '禁用子菜单' :'启用子菜单'}</Button> : null}
        </li>
    })

    return <ul className="sub-menu">{li}</ul>
  }

  // 设置角色权限
  setRoleMenu= (path) => {
    if(this.roleSet === 'start') {
      message.warning('操作过于频繁')
      return
    }
    const { setRoleMenu, activeUserRole:userRole } = this.props
    const menuKeys = []
    for(let v of this.roleMenuData) {
      // 子菜单
      if(v.subMenu && v.subMenu.length > 0) {
        for(let sv of v.subMenu){
          if(
            sv.link.replace(/\//g,'') === path && sv.sis === false // 点击的是子菜单本身（未启用的子菜单）
          ) {
            menuKeys.push(sv.link.replace(/\//g,''))
          }else if(
            sv.link.replace(/\//g,'') !== path && sv.sis === true && sv.is === true && v.path.replace(/\//g,'') !== path // （主菜单已经启用）点击的不是主菜单也不是当前子菜单（这样当禁用主菜单时下面的子菜单会全部禁用）
          ){
            menuKeys.push(sv.link.replace(/\//g,''))
          }
        }
      }
      // 主菜单
      if(v.path.replace(/\//g,'') === path && v.is === false) {
        menuKeys.push(v.path.replace(/\//g,''))
      }else if(v.path.replace(/\//g,'') !== path && v.is === true){
        menuKeys.push(v.path.replace(/\//g,''))
      }else if(v.path.replace(/\//g,'') === path && v.is === true){
        // 主菜单禁用 过滤相关子菜单

      }
    }
    const params = {userRole,menuKeys}
    this.roleSet = 'start'
    setRoleMenu(params).then(res=>{
      if(res && res.response && res.response.resultCode === '000000') {
        // 重新拉取当前角色权限
        this.props.getRoleMenu(userRole).then(r=>{
          if(r && r.response && r.response.resultCode === '000000'){
            message.success('设置权限成功')
            this.roleSet = 'success'
            this.setState({activeRoleMenu:r.response.results})
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
    return <div className="m-system-menu">
      <Table
        pagination={false}
        columns={this.getTableColums()}
        dataSource={this.getMenuData()}
        defaultExpandAllRows={true}
        expandedRowRender={this.expandedRowRender}
      />
    </div>
  }
}

export default Form.create()(Root)
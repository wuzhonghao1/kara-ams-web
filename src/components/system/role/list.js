import React from 'react'
import { Card, Row, Col, Form, Radio, Input, AutoComplete, Icon, Select, Table, Button, Modal } from 'antd'
import StaffFinder from '../../common/staffFinder/staffFinder'
import SetMenu from './setMenu'
import SetView from './setView'
import message from '../../common/Notice/notification'
import './role.less'
const FormItem = Form.Item
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const Option = Select.Option
const { TextArea } = Input;


class Root extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      roleList: [],
      menuModal: false,
      viewModal: false,
      deleteVisible: false,
    }
  }

  componentWillMount(){
    // 获取自定义角色
    this.getCustomRole()
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.flag !== nextProps.flag) {
      this.getCustomRole()
    }
  }

  menuModalShow = (userRole) => {
    this.setState({menuModal: true, activeUserRole:userRole})
  }

  menuModalHidden = () => {
    this.setState({menuModal: false, activeUserRole:null})
  }

  viewModalShow = (userRole) => {
    this.setState({viewModal: true, activeUserRole:userRole})
  }

  viewModalHidden = () => {
    this.setState({viewModal: false, activeUserRole:null})
  }

  showDeleteModal = (roleId) => {
    this.setState({
      deleteVisible: true,
      roleId,
    });
  }

  hideDeleteModal = () => {
    this.setState({
      deleteVisible: false,
      roleId: undefined,
    });
  }

  getTableData = (userRole) => {

    return userRole.map((v,i)=>{
      return {...v,key:i+1}
    })

  }

  // 获取角色
  getCustomRole = (type) => {
    this.props.getCustomRole().then(res=>{
      if(res && res.response && res.response.resultCode === '000000') {
        if(res.response && res.response.results && res.response.results.length > 0) {
          const roleList = this.getTableData(res.response.results)
          // 保存角色到state
          this.setState({roleList})
          this.cacheData = roleList.map(item => ({ ...item })); // 缓存数据用于编辑取消
        }else if(res.response.results && res.response.results.length === 0){
          message.warning('暂时没有角色')
        }else{
          if(type && type === 'delete') {
            message.error('重新获取角色失败')
          }else{
            message.error('获取角色失败')
          }
        }
      }
    });
  }

  // 编辑角色
  editorItem = (key) => {
    const newData = [...this.state.roleList];
    const target = newData.filter(item => key === item.key)[0];
    if (target) {
      target.edt = true;
      this.setState({ roleList: newData });
    }
  }

  // 编辑角色中
  changeItem(value, key, column) {
    const newData = [...this.state.roleList];
    const target = newData.filter(item => key === item.key)[0];
    if (target) {
      target[column] = value;
      this.setState({ roleList: newData });
    }
  }

  // 保存修改角色
  saveItem = (key) => {

    const newData = [...this.state.roleList];
    const target = newData.filter(item => key === item.key)[0];
    if (target) {

      const { roleId, roleDesc,userRole } = target
      const params = { roleId, roleDesc,userRole }

      this.props.updateCustomRole(params).then(res=>{
        if(res && res.response && res.response.resultCode === '000000') {

          delete target.edt;
          this.setState({ roleList: newData });
          this.cacheData = newData.map(item => ({ ...item }));

        }else if(res && res.response && res.response.resultMessage){
          message.error(res.response.resultMessage)
        }else{
          Object.assign(target, this.cacheData.filter(item => key === item.key)[0]);
          delete target.editable;
          this.setState({ roleList: newData });
          message.error('保存错误')
        }
      })

    }
  }

  // 取消保存
  cancelItem(key) {
    const newData = [...this.state.roleList];
    const target = newData.filter(item => key === item.key)[0];
    if (target) {
      Object.assign(target, this.cacheData.filter(item => key === item.key)[0]);
      delete target.edt;
      this.setState({ roleList: newData });
    }
  }

  // 删除角色
  deleteRole = () => {
    const { roleId } = this.state
    this.props.deleteCustomRole(roleId).then((res)=>{
      if(res && res.response && res.response.resultCode === '000000') {
        this.hideDeleteModal();
        message.success('删除成功')
        // 获取自定义角色
        this.getCustomRole('delete')
      } else if (res && res.response && res.response.resultCode !== '000000') {
        message.error(res.response.resultMessage)
      } else{
        message.error('删除失败');
      }
    })
  }

  getTableColumns = () => {
    return [
      {
        title: '序号',
        dataIndex: 'key',
      },
      {
        title: '角色',
        dataIndex: 'roleDesc',
        render: (text, record) => {
          const { edt } = record
          return edt ? <Input value={text} onChange={e => this.changeItem(e.target.value, record.key, 'roleDesc')} /> : text
        },
      },
      {
        title: '标示',
        dataIndex: 'userRole',
        // render: (text, record) => {
        //   const { edt } = record
        //   return edt ? <Input value={text} onChange={e => this.changeItem(e.target.value, record.key, 'userRole')} /> : text
        // },
      },
      {
        title: '操作',
        render: (text, record) => {
          const { editable, edt, userRole } = record
            return <span className="action">
                  <a onClick={()=>{this.menuModalShow(userRole)}}>菜单权限</a><span className="ant-divider" />
                  <a onClick={()=>{this.viewModalShow(userRole)}}>数据权限</a>
                  {
                    edt ?
                      <span className="edting">
                        <a onClick={() => this.saveItem(record.key)}>保存</a><span className="ant-divider" />
                        <a onClick={() => this.cancelItem(record.key)}>取消</a>
                      </span>
                      : <span>
                        {editable === 'yes' ? <span className="ant-divider" /> : null}
                        {editable === 'yes' ? <a onClick={()=>{this.editorItem(record.key)}}>编辑</a> : null}
                        {editable === 'yes' ? <span className="ant-divider" /> : null}
                        {editable === 'yes' ? <a onClick={()=>{this.showDeleteModal(record.roleId)}}>删除</a> : null}
                      </span>
                  }
                </span>
        },
      }
    ]
  }



  render() {
    const { roleList, activeUserRole='' } = this.state
    const { getRoleView, getAllRoleView, setRoleView, setRoleMenu, getRoleMenu } = this.props

    const menuProps = { setRoleMenu, getRoleMenu, activeUserRole }

    const viewProps = { getRoleView, activeUserRole, getAllRoleView, setRoleView }



    return <div>
      <Card className="m-card border-bottom" title="角色列表" bordered={false} noHovering>
        <Table style={{marginTop: '10px'}} columns={this.getTableColumns()} dataSource={roleList} pagination={false} />
      </Card>
      {this.state.menuModal ? <Modal
        visible={this.state.menuModal}
        title="菜单权限设置"
        width="1000px"
        footer={null}
        onOk={this.menuModalHidden}
        onCancel={this.menuModalHidden}>
        <SetMenu {...menuProps} />
      </Modal> : null}
      {this.state.viewModal ? <Modal
        visible={this.state.viewModal}
        title="数据权限设置"
        width="1000px"
        footer={null}
        onOk={this.viewModalHidden}
        onCancel={this.viewModalHidden}>
        <SetView {...viewProps} />
      </Modal> : null}
      <Modal
        title="删除角色"
        visible={this.state.deleteVisible}
        onOk={this.deleteRole}
        onCancel={this.hideDeleteModal}
      >
        <p>你确定要删除吗？</p>
      </Modal>
    </div>
  }

}

export default Root
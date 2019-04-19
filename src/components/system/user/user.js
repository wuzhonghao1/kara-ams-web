import React from 'react'
import { Card, Row, Col, Form, Radio, Input, AutoComplete, Icon, Select, Table, Button, Modal } from 'antd'
import Add from './add'
import StaffFinder from '../../common/staffFinder/staffFinder'
import message from '../../common/Notice/notification'
import './user.less'
const FormItem = Form.Item
const Option = Select.Option

class Root extends React.Component {
  state = {
    keywords: '',
    visible: false,
    deleteVisible: false,
    userVisible: false,
    count: null,
    pageSize: null,
    pageNo: null,
  }
  componentWillReceiveProps(next) {
    if(this.props.userRoleInfo !== next.userRoleInfo && Object.keys(next.userRoleInfo).length !== 0) {
      this.setState({ count: next.userRoleInfo.count, pageSize: next.userRoleInfo.pageSize, pageNo: next.userRoleInfo.pageNo })
    }
  }
  showModal = (roleInfo) => {
    this.setState({
      visible: true,
      roleInfo,
    });
  }
  hideModal = () => {
    this.setState({
      visible: false,
    });
  }

  showDeleteModal = (configId) => {
    this.setState({
      deleteVisible: true,
      configId,
    });
  }

  hideDeleteModal = () => {
    this.setState({
      deleteVisible: false,
      configId: undefined,
    });
  }

  modalUserOpen = () => {
    this.setState({
      userVisible: true
    });
  }

  modalUserClose = () => {
    this.setState({
      userVisible: false
    });
  }

  // 获取角色option
  getUserRoleOption = (customRole) => {
    let roleArr = []
    customRole.map(i => {
      if(i.show && i.show === 'yes') {
        roleArr.push({
          ...i,
        })
      }
    })
    return roleArr.map(v=><Option key={v.userRole} value={v.userRole}>{v.roleDesc}</Option>)
  }

  // 删除角色
  deleteUserRole = () => {
    const { configId } = this.state
    this.props.deleteUserRole(configId).then((res)=>{
      if(res && res.response && res.response.resultCode === '000000') {
        message.success('删除成功')
        this.onSubmit();
        this.hideDeleteModal();
      } else if (res && res.response && res.response.resultCode !== '000000') {
        message.error(res.response.resultMessage)
      } else {
        message.error('删除失败');
      }
    })
  }

  // 获取表头
  columns = () => {
    return [
      {
        title: '姓名',
        dataIndex: 'userName',
        width: 200
      },
      {
        title: '角色',
        dataIndex: 'roleName',
        width: 200,
      },
      {
        title: '公司',
        dataIndex: 'company',
        width: 280,
      },
      {
        title: '资产种类',
        dataIndex: 'assetCategoryName',
        width: 120
      },
      {
        title: '地区',
        dataIndex: 'region',
      },
      {
        title: '操作',
        key: 'action',
        width: 180,
        render: (text, record) => {
          return <span className="action">
            <a onClick={() => this.showModal(record)}>修改</a><span className="ant-divider" />
            <a onClick={() => this.showDeleteModal(record.configId)}>删除</a>
          </span>
        },
      }
    ]
  }

  // 获取表数据
  getTableData = (tableData) => {
    /*
     accountId:"U5A716KHO"
     assetCategory:null
     assetCategoryName:null
     companyId:null
     companyName:null
     configId:"91CC0C27DC5849689C5F054D3BB4B23A"
     regionId:null
     regionName:null
     roleName:"系统管理员"
     userName:"任金强"
     userRole:"SYSTEM_MANAGER"
     */
    return tableData.map((v,i)=>{
      let region = []
      let company = []
      if(v.regions) {
        if(this.props.regionList[0].flexValue !== 'allReg') {
          if(v.regions.length === this.props.regionList.length) {
            region.push('全部')
          } else {
            v.regions.map(item => {
              region.push(`${item.regionName} `)
            })
          }
        } else {
          if(Number(v.regions.length + 1) === this.props.regionList.length) {
            region.push('全部')
          } else {
            v.regions.map(item => {
              region.push(`${item.regionName} `)
            })
          }
        }
      }
      if(v.companies) {
        if(this.props.companyList[0].flexValue !== 'allCompany') {
          if(v.companies.length === this.props.companyList.length) {
            company.push('全部')
          } else {
            v.companies.map(item => {
              company.push(`${item.companyName} `)
            })
          }
        } else {
          if(Number(v.companies.length + 1) === this.props.companyList.length) {
            company.push('全部')
          } else {
            v.companies.map(item => {
              company.push(`${item.companyName} `)
            })
          }
        }
      }
      return {...v, key:i, region, company}
    })
  }

  // 选择用户的回调
  selectStaff = (staff)=> {
    const { accountId, accountName, bgId } = staff[0]
    this.props.form.setFieldsValue({accountId, accountName, bgId})
    this.modalUserClose()
  }

  onSubmit = (e) => {
    if(e) { e.preventDefault(); }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const params = {pageNo:1,pageSize:this.state.pageSize}
        const { userRole, accountId, assetCategory, companyId } = values
        if(userRole) {
          params.userRole = userRole
        }
        if(accountId) {
          params.accountId = accountId
        }
        if(assetCategory) {
          params.assetCategory = assetCategory
        }
        if(companyId) {
          params.companyId = companyId
        }

        this.props.getUserRole(params).then((res)=>{
          if(res.response.resultCode === '000000') {
            if(res.response.pageInfo.result.length === 0) {
              message.warning('没有获取到信息');
            } else {
              this.setState({
                count: res.response.pageInfo.count,
                pageNo: res.response.pageInfo.pageNo,
                pageSize: res.response.pageInfo.pageSize,
              })
            }
          }else{
            message.error('查询失败');
          }
        })
      }
    });
  }

  changePage = (current, size) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const params = {pageNo:current,pageSize:size}
        const { userRole, accountId, assetCategory, companyId } = values
        if(userRole) {
          params.userRole = userRole
        }
        if(accountId) {
          params.accountId = accountId
        }
        if(assetCategory) {
          params.assetCategory = assetCategory
        }
        if(companyId) {
          params.companyId = companyId
        }

        this.props.getUserRole(params).then((res)=>{
          if(res.response.resultCode === '000000') {
            if(res.response.pageInfo.result.length === 0) {
              message.warning('没有获取到信息');
            } else {
              this.setState({
                count: res.response.pageInfo.count,
                pageNo: res.response.pageInfo.pageNo,
                pageSize: res.response.pageInfo.pageSize,
              })
            }
          }else{
            message.error('查询失败');
          }
        })
      }
    });
  }

  render() {
    const { roleInfo } = this.state
    const { dispatch, customRole=[], addUserRole, updateUserRole, companyList, regionList, bgList, assetCategory, userRoleInfo={}, getUserRole, sbuList=[], ccList=[] } = this.props
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 14 },
    };
    const { result:tableData=[] } = userRoleInfo

    const addProps = {
      roleInfo, // 新增:null  编辑:{}
      dispatch,
      onCancel:this.hideModal,
      customRole,
      addUserRole,
      updateUserRole,
      companyList,
      regionList,
      assetCategory,
      getUserRole,
      bgList,
      onSubmit: this.onSubmit
    }

    return <div>
      <Form className="m-system-user" onSubmit={this.onSubmit}>
        <Card className="m-card border-bottom" title="查询条件" bordered={false} noHovering>
          <Row>
            <Col span={8}>
              <FormItem {...formItemLayout} label="用户角色：">
                {getFieldDecorator('userRole')(
                  <Select
                    showSearch
                    optionFilterProp="children"
                  >
                    {this.getUserRoleOption(customRole)}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem style={{display: 'none'}} {...formItemLayout} label="员工姓名：">
                {getFieldDecorator('accountId')(
                  <Input style={{display: 'none'}} disabled />
                )}
              </FormItem>
              <FormItem style={{display: 'none'}} {...formItemLayout} label="员工姓名：">
                {getFieldDecorator('bgId')(
                  <Input style={{display: 'none'}} disabled />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="员工姓名：">
                <div className="u-select-user-input" onClick={this.modalUserOpen}>
                  {getFieldDecorator('accountName')(
                    <Input disabled suffix={<Icon type="search"/>} />
                  )}
                </div>
              </FormItem>
            </Col>
          </Row>
            <Row>
            <Col span={8}>
              <FormItem label="资产种类" {...formItemLayout}>
                {
                  getFieldDecorator('assetCategory', {initialValue: ''})(
                    <Select>
                      <Option value="">--请选择--</Option>
                      {assetCategory.map((i,k) => {
                        return <Option key={k} value={i.paramValue}>{i.paramValueDesc}</Option>
                      })}
                    </Select>
                  )
                }
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="所属公司" {...formItemLayout}>
                {
                  getFieldDecorator('companyId', {initialValue: ''})(
                    <Select>
                      <Option value="">--请选择--</Option>
                      {companyList.map((i,k) => {
                        return <Option key={k} value={i.flexValue}>{i.description}</Option>
                      })}
                    </Select>
                  )
                }
              </FormItem>
            </Col>
            </Row>
            <Col span={24}>
              <FormItem className="btn">
                <Button type="primary" size="default" htmlType="submit">查询</Button>
                <Button type="primary" size="default" onClick={() => {this.props.form.resetFields()}}>
                  清空
                </Button>
              </FormItem>
            </Col>
        </Card>
        {/*<Card*/}
          {/*className="m-card user-card"*/}
          {/*bordered={false}*/}
          {/*noHovering*/}
        {/*>*/}
          <div className="table-content">
          <h1>
            查询结果
            <Button
              style={{float: 'right', margin: '-5px 0 8px 0'}}
              type="primary"
              size="default"
              onClick={()=>{this.showModal(null)}}
            >
              新增
            </Button>
          </h1>
          {tableData.length > 0 ?
            <Table
              columns={this.columns()}
              dataSource={this.getTableData(tableData)}
              pagination={{
                showSizeChanger: true,
                onShowSizeChange: this.changePage,
                showTotal: t=>`共${t}条`,
                showQuickJumper: true,
                total: this.state.count,
                pageSize: this.state.pageSize,
                current: this.state.pageNo,
                onChange: this.changePage,
              }}
            /> : null
          }
          </div>
        {/*</Card>*/}
        {this.state.visible ? <Modal
          title={null}
          closable={false}
          footer={null}
          width={500}
          visible={this.state.visible}
          onCancel={this.hideModal}
        >
          <Add {...addProps} />
        </Modal> : null }
        <Modal
          title="删除角色"
          visible={this.state.deleteVisible}
          onOk={this.deleteUserRole}
          onCancel={this.hideDeleteModal}
        >
          <p>你确定要删除吗？</p>
        </Modal>
      </Form>
      <Modal
        visible={this.state.userVisible}
        title="员工查询"
        width="1000px"
        footer={null}
        onOk={this.modalUserClose}
        onCancel={this.modalUserClose}
      >
        <StaffFinder
          dispatch={dispatch}
          multiple={false}
          keywords={this.state.keywords}
          selectStaff={this.selectStaff}
          companyData={companyList}
          regionData={regionList}
          buData={sbuList}
          ccData={ccList}
          valid='yes'
          useAmsPai
        />
      </Modal>
    </div>
  }

}

export default Form.create()(Root)
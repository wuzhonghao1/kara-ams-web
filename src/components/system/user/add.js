import React from 'react'
import { Card, Row, Col, Form, Radio, Input, AutoComplete, Icon, Select, Table, Button , Modal} from 'antd'
import StaffFinder from '../../common/staffFinder/staffFinder'
import message from '../../common/Notice/notification'
import './user.less'
const FormItem = Form.Item
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const Option = Select.Option
const { TextArea } = Input;

class Root extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      keywords: '',
      userRole: '',
      showArea: false,
      showCompany: false,
      showType: false,
      regionId: [],
      companyId: [],
      regionName: [],
      companyName: [],
    }
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.userRole !== nextProps.userRole) {
      const user = nextProps.userRole;
      this.selectUser(user)
    }
  }

  componentDidMount(){
    /*
     accountId:"U9Y7A8487"
     assetCategory:"20"
     assetCategoryName:"行政资产"
     bgId:"30802"
     companyId:"101"
     companyName:"亚信中国"
     configId:"6AC6B4E0D9B348A494932930CCEFAFAF"
     key:0
     regionId:"35"
     regionName:"重庆"
     roleName:"资产管理员"
     userName:"闵"
     userRole:"ASSET_MANAGER"
     */
    const { roleInfo, regionList, companyList } = this.props
    if(roleInfo !== null) {
      const { userRole, regions=[], companies=[] } = roleInfo
      let ids = []
      let names = []
      let comIds = []
      let comNames = []
      if(regions && regions.length > 0) {
        if (regionList[0].flexValue !== 'allReg') {
          if (regionList.length === roleInfo.regions.length) {
            ids.push('allReg');
            names.push('全部')
          } else {
            regions.map(item => {
              ids.push(item.regionId);
              names.push(item.regionName)
            })
          }
        } else {
          if (Number(regionList.length) - 1 === roleInfo.regions.length) {
            ids.push('allReg');
            names.push('全部')
          } else {
            regions.map(item => {
              ids.push(item.regionId);
              names.push(item.regionName)
            })
          }
        }
        this.setState({ regionId: ids, regionName: names })
      }
      if(companies && companies.length > 0) {
        if (companyList[0].flexValue !== 'allCompany') {
          if (companyList.length === roleInfo.companies.length) {
            comIds.push('allCompany');
            comNames.push('全部')
          } else {
            companies.map(item => {
              comIds.push(item.companyId);
              comNames.push(item.companyName)
            })
          }
        } else {
          if (Number(companyList.length) - 1 === roleInfo.companies.length) {
            comIds.push('allCompany');
            comNames.push('全部')
          } else {
            companies.map(item => {
              comIds.push(item.companyId);
              comNames.push(item.companyName)
            })
          }
        }
        this.setState({ companyId: comIds, companyName: comNames })
      }
      this.selectUser(userRole)
    }
  }

  modalOpen = () => {
    this.setState({ visible: true });
  }

  modalClose = () => {
    this.setState({ visible: false });
  }

  // 选择用户的回调
  selectStaff = (staff)=> {
    const { accountId, accountName, bgId } = staff[0]
    this.props.form.setFieldsValue({accountId, accountName, bgId})
    this.modalClose()
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

  // 获取公司option
  getCompanyOption = (companyList) => {
    if (companyList[0].flexValue !== 'allCompany') {
      companyList.unshift({
        description: "全部", flexValue: "allCompany"
      })
    }
    return companyList.map(v=><Option key={v.flexValue} value={v.flexValue}>{v.description}</Option>)
  }

  // 获取地区option
  getRegionOption = (regionList) => {
    if (regionList[0].flexValue !== 'allReg') {
      regionList.unshift({
        description: "全部", flexValue: "allReg"
      })
    }
    return regionList.map(v=><Option key={v.flexValue} value={v.flexValue}>{v.description}</Option>)
  }

  // 获取资产大类
  getAssetCategoryOption = (assetCategory) => {
    return assetCategory.map(v=><Option key={v.paramValue} value={v.paramValue}>{v.paramValueDesc}</Option>)
  }

  // 提交表单
  onSubmit = (e) => {
    e.preventDefault();
    const {roleInfo} = this.props
    if(roleInfo === null) {
      this.submitAdd()
    }else{
      this.submitUpdate()
    }
  }

  // 增加
  submitAdd = () => {
    const params = {}
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { userRole, accountId, bgId, assetCategory, companyIds=[], regionIds=[] } = values
        let allRegArr = [];
        let allComArr = [];
        this.props.regionList.map(k => {
          if(k.flexValue !== 'allReg') {
            allRegArr.push(k.flexValue);
          }
        })
        this.props.companyList.map(k => {
          if(k.flexValue !== 'allCompany') {
            allComArr.push(k.flexValue)
          }
        })
        let isAll = false;
        let allCom = false;
        companyIds && companyIds.map(i => {
          if(i === 'allCompany') {
            allCom = true;
          }
        })
        regionIds && regionIds.map(item => {
          if(item === 'allReg') {
            isAll = true;
          }
        })
        if(userRole) {
          params.userRole = userRole
        }
        if(accountId) {
          params.accountId = accountId
        }
        let info = {}
        if(assetCategory) {
          info.assetCategory = assetCategory
        }
        if(companyIds && companyIds.length > 0) {
          if(isAll) {
            info.companyIds = allComArr
          } else {
            info.companyIds = companyIds
          }
        }
        if(regionIds && regionIds.length > 0) {
          if(isAll) {
            info.regionIds = allRegArr
          } else {
            info.regionIds = regionIds
          }
        }
        params.info = info
      }
    });
    this.props.addUserRole(params).then((res)=>{
      if(res && res.response && res.response.resultCode === '000000') {
        message.success('添加成功');
        this.props.onCancel();// 关闭modal
        this.props.getUserRole({pageNo:1,pageSize:10})
      }else{
        message.error(res.response.resultMessage);
      }
    })
  }
  selectUser = (item) => {
    // 选择角色
    if (item === 'CASHIER' || item === 'FINANCIAL_ACCOUNT') {
      // 核算会计 出纳
      this.setState({ userRole: item, showArea: true, showCompany: true, showType: false })
    } else if (item === 'CFO' || item === 'FINANCIAL_CONTROLLER' || item === 'SYSTEM_MANAGER') {
      // 财务总监 系统管理员
      this.setState({ userRole: item, showArea: false, showCompany: false, showType: false })
    } else if (item === 'ASSET_MANAGER') {
      // 资产管理员
      this.setState({ userRole: item, showArea: true, showCompany: true, showType: true })
    } else if (item === 'SUPER_ASSET_MANAGER') {
      // 超级资产 管理员
      this.setState({ userRole: item, showArea: false, showCompany: false, showType: true })
    } else if (item === 'BU_MANAGER') {
      // BU资产管理员
      this.setState({ userRole: item, showArea: false, showCompany: false, showType: false })
    } else if (item === 'BG_ASSET_APPROVER') {
      // 跨BG资产数据审批
      this.setState({ userRole: item, showArea: false, showCompany: false, showType: false })
    } else {
      // 普通用户 其他
      this.setState({ userRole: item, showArea: true, showCompany: true, showType: true })
    }
  }

  submitUpdate = () => {
    // 更新
    const {roleInfo} = this.props
    const { configId } = roleInfo
    const params = {configId}
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { userRole, accountId, bgId, assetCategory, companyIds=[], regionIds=[] } = values
        let allRegArr = [];
        let allComArr = [];
        this.props.regionList.map(k => {
          if(k.flexValue !== 'allReg') {
            allRegArr.push(k.flexValue);
          }
        })
        this.props.companyList.map(k => {
          if(k.flexValue !== 'allCompany') {
            allComArr.push(k.flexValue)
          }
        })
        let isAll = false;
        let allCom = false;
        companyIds && companyIds.map(i => {
          if(i === 'allCompany') {
            allCom = true;
          }
        })
        regionIds && regionIds.map(item => {
          if(item === 'allReg') {
            isAll = true;
          }
        })
        if(userRole) {
          params.userRole = userRole
        }
        if(accountId) {
          params.accountId = accountId
        }
        if(assetCategory) {
          params.assetCategory = assetCategory
        }
        if(companyIds && companyIds.length > 0) {
          if(allCom) {
            params.companyIds = allComArr
          } else {
            params.companyIds = companyIds
          }
        }
        if(regionIds && regionIds.length > 0) {
          if(isAll) {
            params.regionIds = allRegArr
          } else {
            params.regionIds = regionIds
          }
        }
        this.props.updateUserRole(params).then((res)=>{
          if(res.response.resultCode === '000000') {
            message.success('修改成功');
            this.props.onCancel();// 关闭modal
            this.props.onSubmit()
          }else{
            message.error(res.response.resultMessage);
          }
        })
      }
    });
  }

  render() {
    const { dispatch, roleInfo, onCancel, customRole=[], companyList=[], regionList=[], assetCategory=[], sbuList=[], ccList=[] } = this.props;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
    };
    return <div>
      <Form className="m-system-user" onSubmit={this.onSubmit}>
        <Card className="m-card" title={roleInfo ? '修改用户' : '新增用户'} bordered={false} noHovering>
          <Row>
            <Col span={20}>
              <FormItem style={{display: 'none'}} {...formItemLayout} label="员工姓名：">
                {getFieldDecorator('accountId', {
                  rules: [{ required: true, message: '请选择用户' }],
                  initialValue: roleInfo ? roleInfo.accountId : null
                })(
                  <Input style={{display: 'none'}} disabled />
                )}
              </FormItem>
              <FormItem style={{display: 'none'}} {...formItemLayout} label="员工姓名：">
                {getFieldDecorator('bgId')(
                  <Input style={{display: 'none'}} disabled />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="员工姓名：">
                <div className="u-select-user-input" onClick={this.modalOpen}>
                  {getFieldDecorator('accountName', {
                    rules: [{ required: true, message: '请选择用户' }],
                    initialValue: roleInfo ? roleInfo.userName : null
                  })(
                    <Input disabled suffix={<Icon type="search"/>} />
                  )}
                </div>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={20}>
              <FormItem {...formItemLayout} label="用户角色：">
                {getFieldDecorator('userRole', {
                  rules: [{ required: true, message: '请选择用户角色' }],
                  initialValue: roleInfo ? roleInfo.userRole : null
                })(
                  <Select
                    showSearch
                    optionFilterProp="children"
                    onSelect={this.selectUser}
                  >
                    {this.getUserRoleOption(customRole)}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          {
            this.state.showType ?
              <Row>
                <Col span={20}>
                  <FormItem {...formItemLayout} label="资产种类：">
                    {getFieldDecorator('assetCategory', {
                      initialValue: roleInfo ? roleInfo.assetCategory : null
                    })(
                      <Select
                        showSearch
                        allowClear
                        optionFilterProp="children"
                      >
                        {this.getAssetCategoryOption(assetCategory)}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row> : null
          }
          {
            this.state.showCompany ?
              <Row>
                <Col span={20}>
                  <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 18 }} label="所属公司：">
                    {getFieldDecorator('companyIds', {
                      initialValue: this.state.companyId.length !== 0 ? this.state.companyId : []
                    })(
                      <Select
                        showSearch
                        allowClear
                        optionFilterProp="children"
                        mode="multiple"
                      >
                        {this.getCompanyOption(companyList)}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row> : null
          }
          {
            this.state.showArea ?
              <Row>
                <Col span={20}>
                  <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 18 }} label="所属地区：">
                    {getFieldDecorator('regionIds', {
                      initialValue: this.state.regionId.length !== 0 ? this.state.regionId : []
                    })(
                      <Select
                        showSearch
                        allowClear
                        optionFilterProp="children"
                        mode="multiple"
                      >
                        {this.getRegionOption(regionList)}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row> : null
          }
          <Row>
            <FormItem className="btn">
              <Button type="primary" size="default" onClick={onCancel}>取消</Button>
              <Button type="primary" size="default" htmlType="submit">保存</Button>
            </FormItem>
          </Row>
        </Card>
      </Form>
      <Modal
        visible={this.state.visible}
        title="员工查询"
        width="1000px"
        footer={null}
        onOk={this.modalClose}
        onCancel={this.modalClose}>
        <StaffFinder dispatch={dispatch}
                     multiple={false}
                     keywords={this.state.keywords}
                     selectStaff={this.selectStaff}
                     companyData={companyList}
                     regionData={regionList}
                     buData={sbuList}
                     ccData={ccList}
                     valid="no"
                     useAmsPai
        />
      </Modal>
    </div>
  }

}

export default Form.create()(Root)
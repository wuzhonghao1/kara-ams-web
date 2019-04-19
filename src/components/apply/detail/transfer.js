import React from 'react'
import { Card, Row, Col, Form, Radio, Input, AutoComplete, Spin, Icon, Select, Table, Button, Checkbox, Modal } from 'antd'
import message from '../../common/Notice/notification'
import _ from 'lodash'
import './transfer.less'
import Approve from '../approve/approve'
import Asset from '../../../containers/apply/asset'
const FormItem = Form.Item
const RadioGroup = Radio.Group
const { TextArea } = Input;

class Root extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      voucherId: null, // 申请单ID
      keywords: '',
      isAgent: 'no',
      userVisible: false,
      assetVisible: false,
      subing: false, // 提交loading
      assetList:[],
      staffBgCode: sessionStorage.getItem('bgCode'), // 跨BG默认是否，搜索员工bgCode为1，跨BG选择是搜索员工bgCode为空
      superAsset: false, // 是否超级管理员
      approveId: '', //审批Id
      delAsset: false, //删除资产
    }
  }

  componentWillMount() {
    const {user} = this.props;
    user.roleInfos.map(item => {
      if (item.userRole === 'SUPER_ASSET_MANAGER') {
        this.setState({ superAsset: true });
      }
    })
  }

  componentDidMount(){
    const { isAgent } = this.state
    this.setFieldsByAgent(isAgent)
    this.saveAssetCategoryToState()
    if(this.props.assets.length !== 0) {
      let newArr = []
      this.props.assets.map((i, idx) => {
        newArr.push({
          ...i,
          key: idx + 1,
          costCenter: i.assignedCcName,
        })
      })
      this.setState({ assetList: newArr, assetCategoryCheck: this.props.assetKey })
    }
  }

  componentWillReceiveProps(newProps){
    if( Object.keys(this.props.applyInfo).length === 0 && Object.keys(newProps.applyInfo).length > 0 ){
      newProps.applyInfo.approveInfos && newProps.applyInfo.approveInfos.map(i => {
        if (i.approveStatus === '10') {
          this.setState({ approveId: i.approveId })
        }
      })
      this.infoViewInit(newProps)
    }
  }

  // 申请单详情预览界面 初始化
  infoViewInit = (newProps) => {
    const { applyInfo } = newProps
    const {
      voucherId,
      agent:isAgent,
      applyName:accountName,
      ownerId:applyPersonId,
      ownerCC:costCenterName,
      ownerStaffCode:applyStaffCode,
      ownerCCId:applyCCId,
      ownerCompany:companyName,
      ownerCompanyId:applyCompanyId,
      ownerRegion:regionName,
      ownerRegionId:applyRegionId,
      ownerSbu:sbuName,
      ownerSbuId:applySbuId,
      assetCategory,
      isStaffLeave,
      approveManagerId,
      approveManagerName,
      strideBg:isStrideBg,
      newName:newPersonName,
      newId:newPersonId,
      newStaffCode,
      newCC,
      newCCId,
      newCompany:newCompanyName,
      newCompanyId,
      newRegion:newRegionName,
      newRegionId,
      newSbu:newSbuName,
      newSbuId,
      newBgId,
      remark,
      assetInfos,
    } = applyInfo

    const assetList = assetInfos.map((v,i)=>{
      return {
        ...v,
        key:i+1,
        costCenter: v.assignedCcId
      }
    })

    const agentUser = {
      isStaffLeave,
      personId:applyPersonId,
      accountName,
    }

    this.setState({
      voucherId,
      isAgent,
      agentUser,
      assetList,
    })

    const initValue = {
      isAgent,
      accountName,
      applyStaffCode,
      applyPersonId,
      costCenterName,
      applyCCId,
      companyName,
      applyCompanyId,
      regionName,
      applyRegionId,
      sbuName,
      applySbuId,
      assetCategory,
      isStrideBg,
      newPersonName,
      newPersonId,
      newStaffCode,
      newCCId,
      newCC,
      newCostCenter: `(${newCCId}) ${newCC}`,
      newCompanyName,
      newCompanyId,
      newRegionName,
      newRegionId,
      newSbuName,
      newSbuId,
      newBgId,
      remark,
    }
    if(isStaffLeave === 'yes') {
      // 指定上级经理(isStaffLeave为yes时必须)
      initValue.approveManager = approveManagerId
      initValue.approveManagerName = approveManagerName
    }
    this.props.form.setFieldsValue(initValue)
  }

  modalUserOpen = (userType) => {
    this.setState({
      userVisible: true,
      userType,
    });
  }

  modalUserClose = () => {
    this.setState({
      userVisible: false
    });
  }

  modalAssetClose = () => {
    this.setState({
      assetVisible: false
    });
  }

  // 获取资产大类
  getAssetCategoryRadio = (assetCategory, disabled) => {
    return assetCategory.map(v=><Radio disabled={disabled} key={v.paramValue} value={v.paramValue}>{v.paramValueDesc}</Radio>)
  }

  // 选择用户的回调
  selectStaff = (staff)=> {
    if(staff && staff.length === 0) {
      message.error('请选择一个用户！')
      return
    }
    const { userType } = this.state
    if(userType === 'apply') {
      this.setFieldsByAgent('yes',staff[0])
      this.modalUserClose()
    }
    if(userType === 'manager') {
      this.setFieldsByManager(staff[0])
      this.modalUserClose()
    }
    if(userType === 'new') {
      this.setFieldsByNewPerson(staff[0])
      this.modalUserClose()
    }
  }

  // 切换代理人
  isAgentChange = (e) => {
    const isAgent = e.target.value
    this.setState({isAgent, assetList: []})
    this.setFieldsByAgent(isAgent)
  }

  // 切换搜索员工模式
  staffBgCodeChange = (e) => {
    const is = e.target.value
    const staffBgCode = is === 'yes' ? '' : 1
    this.setState({staffBgCode})
  }

  // 切换分类
  assetCategoryChange= (e) => {
    const assetCategoryCheck = e.target.value
    this.setState({assetCategoryCheck, assetList: []})
  }

  // 保存 assetCategory 第一个值到state 用来设置 assetCategory 默认值 和 资产查询的条件
  saveAssetCategoryToState = () => {
    const { assetCategory } = this.props
    const assetCategoryCheck = assetCategory[0].paramValue
    this.setState({assetCategoryCheck})
  }

  // 根据 agent 设置表单值
  setFieldsByAgent = (isAgent, checkUser) => {
    if(isAgent === 'yes' && checkUser === undefined){
      this.props.form.resetFields()
      this.setState({ agentUser: {} })
    }else{
      const user = isAgent === 'no' ? this.props.user : checkUser
      this.setState({agentUser:user})
      const {
        accountName,
        personId:applyPersonId,
        staffCode:applyStaffCode,
        costCenterName,
        costCenter:applyCCId,
        companyName,
        companyId:applyCompanyId,
        regionName,
        regionId:applyRegionId,
        sbuName,
        sbuId:applySbuId
      } = user
      const initValue = {
        isAgent,
        accountName,
        applyStaffCode,
        applyPersonId,
        costCenterName,
        costcenter: applyCCId,
        applyCCId,
        companyName,
        applyCompanyId,
        regionName,
        applyRegionId,
        sbuName,
        applySbuId,
      }
      this.props.form.setFieldsValue(initValue)
    }
  }

  // 根据 new person 设置表单值
  setFieldsByNewPerson = (newPerson) => {
    const {
      accountName:newPersonName,
      staffCode:newStaffCode,
      personId:newPersonId,
      bgId:newBgId,
      costCenterName:newCCName,
      costCenter:newCCId,
      companyName:newCompanyName,
      companyId:newCompanyId,
      regionName:newRegionName,
      regionId:newRegionId,
      sbuName:newSbuName,
      sbuId:newSbuId
    } = newPerson
    const initValue = {
      newPersonName,
      newStaffCode,
      newPersonId,
      newBgId,
      newCCName,
      newCCId,
      newCostCenter: `(${newCCId}) ${newCCName}`,
      newCompanyName,
      newCompanyId,
      newRegionName,
      newRegionId,
      newSbuName,
      newSbuId
    }
    this.props.form.setFieldsValue(initValue)
  }

  // 根据 new person 设置表单值 approveManager
  setFieldsByManager = (manager) => {
    const { personId:approveManager, accountName:approveManagerName } = manager
    const initValue = {
      approveManager,
      approveManagerName
    }
    this.props.form.setFieldsValue(initValue)
  }

  // 资产选择 回调函数
  assetCheckCB = (assetList) => {
    const { voucherId } = this.state
    if(voucherId) {
      // 如果有 voucherId 选择的资产保存到服务器上 删除也从服务器删除
      const params = {
        assetInfos:assetList,
      }
      this.props.addAsset(voucherId,params).then(res=>{
        if(res && res.response && res.response.resultCode === '000000') {
          // 保存成功 把 assetList 压入 state.assetList
          const results = res.response.assetInfos; // 获取的数据需要itemId
          const assetListAddItemId = assetList.map((v)=>{
            let itemId = ''
            for(let rv of results) {
              if(rv.assetId === v.assetId) {
                itemId = rv.itemId;
              }
            }
            return {...v, itemId}
          })
          const newList = this.resetAssetKey(this.state.assetList.concat(assetListAddItemId))
          this.setState({assetList:newList})
        }else{
          message.error('添加失败')
        }
      })
    }else{
      // 如果是新建申请单 资产 保存到 state 提交到时候一起提交到服务器
      let newArr = this.state.assetList;
      if (newArr.length !== 0) {
        newArr.map(item => {
          assetList.forEach((k, index) => {
            if(item.assetId === k.assetId) {
              assetList.splice(index, 1);
              message.warning(`${item.serialNumber}已存在，请不要重复添加`)
            }else{
              const newList = this.resetAssetKey(newArr.concat(assetList))
              this.setState({assetList:newList})
            }
          })
        })
      } else {
        const newList = this.resetAssetKey(newArr.concat(assetList))
        this.setState({assetList:newList})
      }
    }
  }

  // 从新设置资产的key
  resetAssetKey = (asset) => {
    return asset.map((v,i)=>({...v,key:i+1}))
  }

  getColumns = (disabled) => {
    const columns =  [
      {
        title: '序号',
        dataIndex: 'key',
      },
      {
        title: '资产编号',
        dataIndex: 'serialNumber',
      },
      {
        title: '资产描述',
        dataIndex: 'description',
      },
      {
        title: '所属公司',
        dataIndex: 'assignedCompanyName',
      },
      {
        title: '所属BU',
        dataIndex: 'assignedSbuName',
      },
      {
        title: '所属CC',
        dataIndex: 'costCenter',
      },
      {
        title: '所属地区',
        dataIndex: 'assignedRegionName',
      },
      {
        title: '启用时间',
        dataIndex: 'serviceDate',
        render: text => (`${text.substring(0,4)}-${text.substring(4,6)}-${text.substring(6)}`),
      }
    ]
    return columns
    // if(disabled) {
    //   return columns
    // }else{
    //   return columns.concat({
    //     title: '操作',
    //     key: 'operation',
    //     fixed: 'right',
    //     width: 100,
    //     render: (asset) => <a href="#" onClick={()=>{this.deleteAsset(asset)}}>删除</a>,
    //   })
    // }
  }

  changeNew = () => {
    this.props.form.validateFields((err, values) => {
      const {
        newPersonId,
        newCCId,
        newCompanyId,
        newRegionId,
        newSbuId,
      } = values
      const params = {
        voucherId: this.state.voucherId,
        newPersonId,
        newCCId,
        newCompanyId,
        newRegionId,
        newSbuId,
      }
      this.props.changeNew(params).then(result => {
        if (result.response.resultCode === '000000') {
          message.success('修改新责任人成功')
        } else {
          message.error(result.response.resultMessage)
        }
      })
    })
  }
  loadStart = () => {
    // 开始加载
    this.setState({ subing: true })
  }

  loadEnd = () => {
    // 加载结束
    this.setState({ subing: false })
  }

  render() {
    let inServiceStaff;
    if (this.state.userType) {
      if (this.state.userType === 'apply') {
        inServiceStaff = false
      } else if (this.state.userType === 'new') {
        inServiceStaff = true
      }
    }
    const { isAgent, agentUser={}, assetList, assetCategoryCheck, staffBgCode } = this.state
    const { match, isApprove, isComplete, dispatch, form, applyInfo, assetCategory, companyList=[], regionList=[], sbuList=[], ccList=[] } = this.props
    const { getFieldDecorator } = form;
    const formItemLayout = {labelCol: { span: 8 }, wrapperCol: { span: 14 }};
    const spanLayout = {labelCol: { span: 4 }, wrapperCol: { span: 18 }};
    const disabledAgent = isAgent === 'no' ? true : false // 选择代理人是否可用
    const agentUserIsLeave = agentUser.isStaffLeave && agentUser.isStaffLeave === 'yes' // 当前代理人是否离职
    const { status='00', editable='yes', approveInfos, workflowInfos, changeNew, returnNode, voucherStatus } = applyInfo
    const disabled = true
    const newOwner = changeNew === 'yes' && editable === 'no' && isApprove ? true : false // 修改新责任人
    const isNew = Object.keys(this.props.match.params).length === 0
    const modalStyle = {
      top: '50px'
    }
    return <div>
      <Spin spinning={this.state.subing}>
        <Form className="m-apply-transfer">
          <Card className="m-card border-bottom" title="申请人信息" bordered={false} noHovering>
            <Row>
              <Col span={16}>
                <FormItem {...spanLayout} label="申请类型：">
                  {getFieldDecorator('isAgent', {
                    rules: [{ required: true, message: '申请人必选' }]
                  })(
                    <RadioGroup
                      onChange={this.isAgentChange}
                    >
                      <Radio disabled={!isNew} value="no">本人申请</Radio>
                      <Radio disabled={!isNew} value="yes">代理申请</Radio>
                    </RadioGroup>
                  )}
                  {
                    isAgent==='yes' ?
                      <span className='createInfo'>
                        (代理人姓名:{applyInfo.createName}, 代理人工号:{applyInfo.createStaffCode})
                      </span>: null
                  }
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem style={{display: 'none'}} {...formItemLayout} label="员工姓名：">
                  {getFieldDecorator('applyPersonId')(
                    <Input style={{display: 'none'}} disabled />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="员工姓名：">
                  <div className={`u-select-user-input ${!isNew || disabledAgent ? 'disabled' : ''}`} onClick={this.state.isAgent === 'yes' && isNew ? ()=>{this.modalUserOpen('apply')} : ()=>(false)}>
                    {getFieldDecorator('accountName')(
                      <Input disabled suffix={!isNew || disabledAgent ? null : <Icon type="search"/>} />
                    )}
                  </div>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="员工编号：">
                  {getFieldDecorator('applyStaffCode')(
                    <Input disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="所属公司：">
                  {getFieldDecorator('companyName')(
                    <Input disabled />
                  )}
                </FormItem>
                <FormItem style={{display: 'none'}} {...formItemLayout} label="所属公司：">
                  {getFieldDecorator('applyCompanyId')(
                    <Input />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem {...formItemLayout} label="所属BU：">
                  {getFieldDecorator('sbuName')(
                    <Input disabled />
                  )}
                </FormItem>
                <FormItem style={{display: 'none'}} {...formItemLayout} label="所属BU：">
                  {getFieldDecorator('applySbuId')(
                    <Input />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="所属CC：">
                  {getFieldDecorator('costcenter')(
                    <Input disabled />
                  )}
                </FormItem>
                <FormItem style={{display: 'none'}} {...formItemLayout} label="所属CC：">
                  {getFieldDecorator('applyCCId')(
                    <Input />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="所属地区：">
                  {getFieldDecorator('regionName')(
                    <Input disabled />
                  )}
                </FormItem>
                <FormItem style={{display: 'none'}} {...formItemLayout} label="所属地区：">
                  {getFieldDecorator('applyRegionId')(
                    <Input />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Card>
          <Card className="m-card border-bottom" title="申请信息" bordered={false} noHovering>
            <Row>
              <Col span={8}>
                <FormItem {...formItemLayout}  label="资产种类：">
                  {getFieldDecorator('assetCategory',{
                    rules: [{ required: true, message: '资产种类必选' }],
                    initialValue: assetCategoryCheck,
                  })(
                    <RadioGroup
                      disabled
                      onChange={this.assetCategoryChange}
                    >
                      {this.getAssetCategoryRadio(assetCategory, !isNew && voucherStatus !== '00')}
                    </RadioGroup>
                  )}
                </FormItem>
              </Col>
            </Row>
            {
              agentUserIsLeave && assetCategoryCheck === '10' ?
                <Row>
                  <Col span={24}>
                    <FormItem style={{display: 'none'}} label="上级经理">
                      {getFieldDecorator('approveManager')(
                        <Input style={{display: 'none'}} disabled />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={16}>
                    <FormItem labelCol = {{ span: 4 }} wrapperCol={{ span: 14 }} label="上级经理：" extra="员工已离职，请选择申请员工的上级经理。">
                      <Row>
                        <Col span={12}>
                          <div className={`$u-select-user-input ${isNew ? '' : 'disabled'}`} onClick={()=>{isNew ? this.modalUserOpen('manager') : null}}>
                            {getFieldDecorator('approveManagerName',
                              {
                                rules: [{ required: true, message: '离职员工上级经理必选' }],
                                initialValue: applyInfo.approveManagerName ? applyInfo.approveManagerName : ''
                              })(
                                <Input disabled={!isNew} suffix={!isNew ? <Icon type="search"/> : ''} />
                            )}
                          </div>
                        </Col>
                      </Row>
                    </FormItem>
                  </Col>
                </Row> : null
            }
            <Table style={{marginBottom:'24px'}} pagination={false} columns={this.getColumns(disabled)} dataSource={assetList} />
            <Row style={!this.state.superAsset ? {display: 'none'} : {}}>
              <Col span={8}>
                <FormItem {...formItemLayout} label="是否跨BG转移：">
                  {getFieldDecorator('isStrideBg', {
                    rules: [{ required: true, message: '是否跨BG必选' }],
                    initialValue:'no',
                  })(
                    <RadioGroup
                      onChange={this.staffBgCodeChange}
                    >
                      <Radio disabled={disabled} value="yes">是</Radio>
                      <Radio disabled={disabled} value="no">否</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
              </Col>
            </Row>
            <FormItem>
              <label className="text-area-label">转移原因：</label>
              {getFieldDecorator('remark')(
                <TextArea disabled={disabled} className="text-area" rows={2} />
              )}
            </FormItem>
          </Card>
          <Card className="m-card" title="新责任人" bordered={false} noHovering>
            <Row>
              <Col span={8}>
                <FormItem {...formItemLayout} label="新责任人：">
                  <div className={`u-select-user-input ${newOwner || !disabled ? '' : 'disabled'}`} onClick={()=>{newOwner || !disabled ? this.modalUserOpen('new') : ()=>(false) }}>
                    {getFieldDecorator('newPersonName')(
                      <Input disabled suffix={newOwner || !disabled ? <Icon type="search"/> : null} />
                    )}
                  </div>
                </FormItem>
                <FormItem style={{display: 'none'}} {...formItemLayout} label="新责任人：">
                  {getFieldDecorator('newPersonId')(
                    <Input />
                  )}
                </FormItem>
                <FormItem style={{display: 'none'}} {...formItemLayout} label="新责任人：">
                  {getFieldDecorator('newBgId')(
                    <Input />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="员工编号：">
                  {getFieldDecorator('newStaffCode')(
                    <Input disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="所属公司：">
                  {getFieldDecorator('newCompanyName')(
                    <Input disabled />
                  )}
                </FormItem>
                <FormItem style={{display: 'none'}} {...formItemLayout} label="所属公司：">
                  {getFieldDecorator('newCompanyId')(
                    <Input />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem {...formItemLayout} label="所属BU：">
                  {getFieldDecorator('newSbuName')(
                    <Input disabled />
                  )}
                </FormItem>
                <FormItem style={{display: 'none'}} {...formItemLayout} label="所属BU：">
                  {getFieldDecorator('newSbuId')(
                    <Input />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="所属CC：">
                  {getFieldDecorator('newCostCenter')(
                    <Input disabled />
                  )}
                </FormItem>
                <FormItem style={{display: 'none'}} {...formItemLayout} label="所属CC：">
                  {getFieldDecorator('newCCId')(
                    <Input />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="所属地区：">
                  {getFieldDecorator('newRegionName')(
                    <Input disabled />
                  )}
                </FormItem>
                <FormItem style={{display: 'none'}} {...formItemLayout} label="所属地区：">
                  {getFieldDecorator('newRegionId')(
                    <Input />
                  )}
                </FormItem>
              </Col>
            </Row>
            {
              newOwner ? <Row style={{ textAlign: 'right' }} >
                <Col span={23}>
                  <Button type='primary' onClick={this.changeNew}>确认修改</Button>
                </Col>
              </Row> : null
            }
          </Card>
          {
            match.params.id !== undefined ?
              <Approve
                dispatch={dispatch}
                match={this.props.match}
                companyData={companyList}
                regionData={regionList}
                sbuList={sbuList}
                approveId={this.state.approveId}
                isBatch={applyInfo.isBatchApprove}
                history={this.props.history}
                approveInfos={approveInfos}
                workflowInfos={workflowInfos}
                isApprove={isApprove}
                returnNode={returnNode}
                isComplete={isComplete}
                loadStart={this.loadStart}
                loadEnd={this.loadEnd}
              /> : null
          }
        </Form>
      </Spin>
    </div>
  }

}

export default Form.create()(Root)
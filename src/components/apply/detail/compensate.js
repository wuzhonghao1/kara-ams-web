import React from 'react'
import { Card, Row, Col, Form, Radio, Input, Icon, Spin, Table, Button, Checkbox } from 'antd'
import message from '../../common/Notice/notification'
import './compensate.less'
import Approve from '../approve/approve'
import { saveAs } from '../../../util/FileSaver'
const FormItem = Form.Item
const RadioGroup = Radio.Group
const { TextArea } = Input;

class Root extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      remarkOption: 'default',
      keywords: '',
      isAgent: 'no',
      userVisible: false,
      assetVisible: false,
      inputNum: false, // 填写资产原值
      subing: false, // 提交loading
      assetList:[],
      approveId: '',
      assetObj: {}, // 资产 key itemId value 填写值
      staffBgCode: sessionStorage.getItem('bgCode'),
      worth: 0, // 资产原值总和
      showWorth: false, // 显示赔偿金额
      cacheData: [],
      delAsset: false
    }
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
      newProps.applyInfo.assetInfos.map(k => {
        let newWorth = null;
        let obj = this.state.assetObj
        let newObj = {};
        if (k.assetWorth) {
          newObj[k.itemId] = k.assetWorth
        } else {
          newObj[k.itemId] = ''
        }
        if (k.compensationWorth) {
          newWorth += Number(k.compensationWorth)
          this.setState({ showWorth: true })
        }
        this.setState({ assetObj: Object.assign(obj, newObj), worth: newWorth});
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
      strideBg:isStrideBg,
      newName:newPersonName,
      newId:newPersonId,
      newStaffCode,
      newCC:newCCName,
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

    let worth = null;
    const assetList = assetInfos.map((v,i)=>{
      if(v.compensationWorth) {
        worth += Number(v.compensationWorth)
      }
      this.setState({ worth: worth })
      return {
        ...v,
        key: i+1,
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
      remark,
      remarkOption: remark === '丢失赔偿' ? 'default' : 'other',
    }

    const cacheData = assetList.map(item => ({ ...item })); // 缓存数据用于编辑取消
    this.setState({ cacheData: cacheData })

    this.props.form.setFieldsValue(initValue)
    if(remark !== '丢失赔偿') {
      this.setState({remarkOption: 'other'})
    }
  }

  modalUserOpen = (userType) => {
    this.setState({
      userVisible: true,
      userType,
    });
  }

  modalAssetClose = () => {
    this.setState({
      assetVisible: false
    });
  }

  // 切换报废原因
  remarkChange = (e) => {
    const remarkOption = e.target.value
    this.setState({remarkOption})
  }

  // 获取资产大类
  getAssetCategoryRadio = (assetCategory, disabled) => {
    return assetCategory.map(v=><Radio disabled={disabled} key={v.paramValue} value={v.paramValue}>{v.paramValueDesc}</Radio>)
  }

  // 切换代理人
  isAgentChange = (e) => {
    const isAgent = e.target.value
    this.setState({isAgent, assetList: []})
    this.setFieldsByAgent(isAgent)
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
    }else{
      const user = isAgent === 'no' ? this.props.user : checkUser
      this.setState({agentUser:user})
      const {
        accountName,
        staffCode:applyStaffCode,
        personId:applyPersonId,
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
        costenter: applyCCId,
        applyCCId,
        companyName,
        applyCompanyId,
        regionName,
        applyRegionId,
        sbuName,
        applySbuId
      }
      this.props.form.setFieldsValue(initValue)
    }
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
                itemId = rv.itemId
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

  // 删除模态框
  deleteAsset = (asset) => {
    this.setState({ delAsset: true, asset })
  }

  closeAsset = () => {
    this.setState({ delAsset: false })
  }

  // 填写资产原值
  addCostValue = (value, asset, column) => {
    const newData = [...this.state.assetList];
    const target = newData.filter(item => asset.key === item.key)[0];
    if (target) {
      target[column] = Number(value);
      this.setState({ assetList: newData });
    }
  }

  getColumns = (disabled) => {
    const that= this;
    const {applyInfo} = this.props;
    let showAsset = false
    const {addCost, assetInfos} = applyInfo;
    if(Object.keys(applyInfo).length !== 0 && assetInfos.length !== 0 && assetInfos[0].assetWorth) {
      showAsset = true
    }
    const columns = [
      {
        title: '序号',
        dataIndex: 'key',
        className: 'tHeader',
      },
      {
        title: '资产编号',
        dataIndex: 'serialNumber',
        className: 'tHeader',
      },
      {
        title: '资产描述',
        dataIndex: 'description',
        className: 'tHeader',
      },
      {
        title: '所属公司',
        dataIndex: 'assignedCompanyName',
        className: 'tHeader',
      },
      {
        title: '所属BU',
        dataIndex: 'assignedSbuName',
        className: 'tHeader',
      },
      {
        title: '所属CC',
        dataIndex: 'costCenter',
        className: 'tHeader',
      },
      {
        title: '所属地区',
        dataIndex: 'assignedRegionName',
        className: 'tHeader',
      },
      {
        title: '启用时间',
        dataIndex: 'serviceDate',
        className: 'tHeader',
        render: text => (`${text.substring(0,4)}-${text.substring(4,6)}-${text.substring(6)}`),
      },
    ]
    if(showAsset) {
      columns.push({
        title: '资产原值',
        key: 'assetWorth',
        width: 50,
        fixed: 'right',
        className: 'tHeader',
        render: (asset) => (asset.assetWorth),
      },{
        title: '赔偿金额',
        key: 'compensationWorth',
        width: 50,
        fixed: 'right',
        className: 'tHeader',
        render: (asset) => (asset.compensationWorth),
      })
    }
    return columns
  }
  useMonth = (now, pass, year) => {
    return year * 12 + (now - pass);
  }
  // 下载附件
  downLoad = (param) => {
    this.props.downLoadFile(param).then(result => {
      if(result && result.response && !result.response.resultCode) {
        saveAs(result.response.blob, result.response.filename)
      } else if (result.response.resultCode === '666666'){
        message.warning(result.response.resultMessage);
      } else {
        message.error('下载失败!');
    }})
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
    const { isAgent, agentUser={}, assetList, remarkOption, assetCategoryCheck } = this.state
    const { dispatch, isApprove, isComplete, match, form, applyInfo, assetCategory,
      companyList=[], regionList=[], sbuList=[], ccList=[] } = this.props
    const { getFieldDecorator } = form;
    const formItemLayout = {labelCol: { span: 8 }, wrapperCol: { span: 14 }};
    const spanLayout = {labelCol: { span: 4 }, wrapperCol: { span: 18 }};
    const disabledAgent = isAgent === 'no' ? true : false // 选择代理人是否可用
    const agentUserIsLeave = agentUser.isStaffLeave && agentUser.isStaffLeave === 'yes' // 当前代理人是否离职
    const { status='00', editable='yes', approveInfos, workflowInfos, addCost, fileUrl, uploadProof, returnNode, voucherStatus } = applyInfo
    const disabled = true
    const isNew = Object.keys(this.props.match.params).length === 0
    return <div>
      <Spin spinning={this.state.subing}>
        <Form className="m-compensate">
          <Card className="m-card border-bottom" title="申请人信息" bordered={false} noHovering>
            <Row>
              <Col span={16}>
                <FormItem {...spanLayout} label="申请类型：">
                  {getFieldDecorator('isAgent', {
                    rules: [{ required: true, message: '申请人必选' }]
                  })(
                    <RadioGroup
                      disabled
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
                  {getFieldDecorator('accountId')(
                    <Input style={{display: 'none'}} disabled />
                  )}
                </FormItem>
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
                  {getFieldDecorator('costenter')(
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
                        <Input style={{display: 'none'}} />
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
                              <Input disabled={!isNew} suffix={<Icon type="search"/>} />
                            )}
                          </div>
                        </Col>
                      </Row>
                    </FormItem>
                  </Col>
                </Row> : null
            }
            <Table style={{marginBottom:'24px'}} pagination={false} columns={this.getColumns(disabled)} dataSource={assetList} />
            {
              this.state.showWorth ?
                <Row style={{textAlign: 'right'}}>
                  <Col span={24}>
                    <span style={{paddingRight: '20px'}}>赔偿金额总和：{Number(this.state.worth).toFixed(2)}</span>
                  </Col>
                </Row> : null
            }
            <Row>
              <Col span={8}>
                <FormItem {...formItemLayout} label="赔偿原因：">
                  {getFieldDecorator('remarkOption',{
                    rules: [{ required: true, message: '赔偿原因必选' }],
                    initialValue: "default",
                  })(
                    <RadioGroup
                      onChange={this.remarkChange}
                    >
                      <Radio disabled={disabled} value="default">丢失赔偿</Radio>
                      <Radio disabled={disabled} value="other">其它</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
              </Col>
            </Row>
            <FormItem style={remarkOption === 'default' ? {display:'none'} : {}}>
              <label className="text-area-label">赔偿说明：</label>
              {getFieldDecorator('remark',{
                rules: [{ required: true, message: '赔偿原因必选' }],
                initialValue: "丢失赔偿",
              })(
                <TextArea disabled={disabled} className="text-area" rows={2} />
              )}
            </FormItem>
            {
              fileUrl ?
                <Row>
                  <Col span={8}>
                    <FormItem {...formItemLayout} label="下载凭证：">
                      <Button
                        type="primary"
                        icon="download"
                        size='default'
                        onClick={() => {this.downLoad(fileUrl)}}
                      >
                        下载凭证
                      </Button>
                    </FormItem>
                  </Col>
                </Row> : null
            }
            <Row>
              <Col span={8}>
                <FormItem {...formItemLayout} label="保证协议：">
                  {getFieldDecorator('promise', {initialValue: true})(
                    <Checkbox defaultChecked={true} disabled={disabled}>本人保证上述情况属实</Checkbox>
                  )}
                </FormItem>
              </Col>
            </Row>
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
                isComplete={isComplete}
                assetObj={this.state.assetObj}
                addCost={addCost}
                returnNode={returnNode}
                loadStart={this.loadStart}
                loadEnd={this.loadEnd}
                fileUrl={null}
              /> : null
          }
          <div className="hint">
            <p>
              赔  偿  公   式：<br />
              1、资产使用月份小于48个月：资产原值-(资产原值*95%/(折旧年限*12))*已使用月份；<br />
              2、资产使用月份大于等于48个月：资产原值*5%
            </p>
          </div>
        </Form>
      </Spin>
    </div>
  }

}

export default Form.create()(Root)
import React from 'react'
import { Card, Row, Col, Spin, Form, Radio, Input, AutoComplete, Icon, Select, Table, Button, Modal } from 'antd'
import message from '../../common/Notice/notification'
import _ from 'lodash'
import './invalidate.less'
import StaffFinder from '../../common/staffFinder/staffFinder'
import Approve from '../approve/approve'
import InputFile from './inputFile'
import Asset from '../../../containers/apply/asset'
import { saveAs } from '../../../util/FileSaver'
const FormItem = Form.Item
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const Option = Select.Option
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
      subing: false,// loading
      assetList:[],
      assetObj: {}, // 资产 key itemId value 填写值
      assetInfo: {}, // 验机信息
      backFill: false, // 是否有验机信息
      staffBgCode: sessionStorage.getItem('bgCode'),
      worth: 0, // 剩余价值综合
      upLoadScrap: {}, // 上传报废
      uploadVoucher: {}, // 上传凭证
      upLoadType: '', // 上传类型
      cacheData: [],
      showWorth: false,
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
        let obj = this.state.assetInfo
        let newObj
        newObj = Object.assign({}, obj, {[k.itemId]: ''})
        this.setState({ assetInfo: newObj });
      })
      if(newProps.applyInfo.assetInfos[0].backfillContent) {
        this.setState({ backFill: true })
      }
      this.infoViewInit(newProps)
    }
  }

  // 申请单详情预览界面 初始化
  infoViewInit = (newProps) => {
    let worth = 0
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
      attachmentUrl,
      inKind,
    } = applyInfo
    if(attachmentUrl) {
      this.getUpLoadFile({attachmentUrl})
    }

    const assetList = assetInfos.map((v,i)=>{
      worth += Number(v.remainingWorth);
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
      worth: worth,
      showWorth: true,
    })

    const cacheData = assetList.map(item => ({ ...item })); // 缓存数据用于编辑取消
    this.setState({ cacheData: cacheData })

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
      inKind,
      remarkOption: remark === '设备老旧、配置低' ? 'default' : 'other',
    }
    this.props.form.setFieldsValue(initValue)
    this.setState({assetCategoryCheck: assetCategory})
    if(remark !== '设备老旧、配置低') {
      this.setState({remarkOption: 'other'})
    }
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

  // 切换报废原因
  remarkChange = (e) => {
    const remarkOption = e.target.value
    this.setState({remarkOption})
  }

  // 获取资产大类
  getAssetCategoryRadio = (assetCategory, disabled) => {
    return assetCategory.map(v=>
      <Radio disabled={disabled} key={v.paramValue} value={v.paramValue}>
        {v.paramValueDesc}
      </Radio>)
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

  // 切换分类
  assetCategoryChange= (e) => {
    const assetCategoryCheck = e.target.value
    this.setState({assetCategoryCheck, assetList: []})
  }

  // 保存 assetCategory 第一个值到state 用来设置 assetCategory 默认值 和 资产查询的条件
  saveAssetCategoryToState = () => {
    if(this.props.match.params && this.props.match.params.id !== '') {
      return
    }
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
        costenter: `(${applyCCId}) ${costCenterName}`,
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
                itemId = rv.itemId
              }
            }
            return {...v, itemId}
          })
          const newList = this.resetAssetKey(this.state.assetList.concat(assetListAddItemId))
          const cacheData = newList.map(item => ({ ...item })); // 缓存数据用于编辑取消
          this.setState({assetList:newList, cacheData:cacheData})
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

  // 删除资产
  deleteAssetItem = () => {
    const { voucherId, assetList, asset } = this.state

    if(voucherId) {
      // 先删除 服务器 成功后再从 state 删除
      const { itemId, assetId } = asset
      this.props.deleteAsset(voucherId,itemId).then(res=>{
        if(res && res.response && res.response.resultCode === '000000') {
          // 删除成功 state.assetList 里面的item删除
          const newList = this.resetAssetKey(_.filter(assetList,function(o) { return o.assetId !== assetId }))
          this.setState({assetList: newList})
          this.closeAsset()
        }else{
          message.error('删除失败')
        }
      })
    }else{
      // 直接从 state 删除
      const newList = this.resetAssetKey(_.filter(assetList,function(o) { return o.key !== asset.key }))
      this.setState({assetList: newList})
      this.closeAsset()
    }
  }

  // 编辑资产
  editorAssetItem = (key) => {
    const newData = [...this.state.assetList];
    const target = newData.filter(item => key === item.key)[0];
    if (target) {
      target.editable = true;
      this.setState({ assetList: newData });
    }
  }

  // 保存资产
  saveAssetItem = (record) => {
    // let worth = Number(this.state.worth)
    let worth = null
    const { voucherId } = this.props

    const newData = [...this.state.assetList];
    const target = newData.filter(item => record.key === item.key)[0];
    if (target) {

      if(voucherId) {
        // 服务器

        const { itemId, remainingWorth } = target

        this.props.updateAsset({itemId, remainingWorth}).then(res=>{
          if(res && res.response && res.response.resultCode === '000000') {
            delete target.editable;
            const cacheData = newData.map(item => ({ ...item }));
            newData.map(k => {
              if(k.remainingWorth) {
                worth += Number(k.remainingWorth)
              }
            })
            this.setState({ assetList: newData, cacheData: cacheData, worth: worth });
          }else if(!res || !res.response){
            message.error('系统问题，请联系系统管理员')
          }else{
            Object.assign(target, this.state.cacheData.filter(item => record.key === item.key)[0]);
            delete target.editable;
            this.setState({ assetList: newData });
            message.error('更新资产信息接口错误')
          }
        })
      }else{
        // 直接本地
        delete target.editable;
        const cacheData = newData.map(item => ({ ...item }));
        newData.map(k => {
          if(k.remainingWorth) {
            worth += Number(k.remainingWorth)
          }
        })
        this.setState({ assetList: newData, cacheData: cacheData, worth: worth });
      }
    }
  }

  // 取消保存
  cancelAssetItem(key) {
    const newData = [...this.state.assetList];
    const target = newData.filter(item => key === item.key)[0];
    if (target) {
      Object.assign(target, this.state.cacheData.filter(item => key === item.key)[0]);
      delete target.editable;
      this.setState({ assetList: newData });
    }
  }

  // 资产input on change
  changeAssetItem(value, key, column) {
    const newData = [...this.state.assetList];
    const target = newData.filter(item => key === item.key)[0];
    if (target) {
      target[column] = value;
      this.setState({ assetList: newData });
    }
  }

  addCostValue = (e, asset) => {
    // 验机信息
    let Obj = this.state.assetInfo;
    for (let k in Obj) {
      if (k = asset.itemId) {
        Obj = Object.assign(Obj, {[k]: e.target.value})
      }
    }
    this.setState({ assetInfo: Obj })
  }

  getColumns = (disabled) => {
    const {applyInfo} = this.props;
    const {addFillbackInfo} = applyInfo;
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
      },
    ]
    if(this.state.assetCategoryCheck === '20' || Number(this.state.worth) !== 0) {
      columns.push({
        title: '剩余价值',
        dataIndex: 'remainingWorth',
        fixed: 'right',
        width: 60,
        render: (text, record) => {
          const textToFixed = Number(text ==='' || text !== null && text >=0 ? text : 0).toFixed(2)
          const { editable } = record
          return editable ?
            <Input value={text} onChange={e => this.changeAssetItem(e.target.value, record.key, 'remainingWorth')} /> : textToFixed
        },
      })
    }
    if(this.state.backFill) {
      columns.push({
        title: '资产回填信息',
        fixed: 'right',
        width: 100,
        key: 'backfillContent',
        render: (asset) => <span>{asset.backfillContent}</span>,
      })
    }
    return columns
  }

  getUpLoadFile = (upLoadObj, type) => {
    /*
     *上传成功回调
     * uploadId 成功后返回的id
     * type 上传 file
     * */
    type = type || 'file'
    if (type === 'file') {
      this.setState({
        upLoadScrap: upLoadObj,
        upLoadType: type
      })
    } else {
      this.setState({
        uploadVoucher: upLoadObj,
      })
    }
  }
  downLoad = (param) => {
    // 下载附件
    // this.props.downLoadFile(param).then(result => {
    //   return
    //   if(result && result.response && !result.response.resultCode) {
    //     saveAs(result.response.blob, decodeURI(result.response.filename))
    //   } else if (result.response.resultCode === '666666'){
    //     message.warning(result.response.resultMessage);
    //   } else {
    //     message.error('下载失败!');
    // }})
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
    const { isAgent, agentUser={}, assetList, remarkOption, assetCategoryCheck, upLoadScrap, uploadVoucher } = this.state
    const { dispatch, isApprove, isComplete, match, form, applyInfo, assetCategory,
      companyList=[], regionList=[], sbuList=[], ccList=[] } = this.props
    const { getFieldDecorator } = form;
    const formItemLayout = {labelCol: { span: 8 }, wrapperCol: { span: 14 }};
    const spanLayout = {labelCol: { span: 4 }, wrapperCol: { span: 18 }};
    const disabledAgent = isAgent === 'no' ? true : false // 选择代理人是否可用
    const agentUserIsLeave = agentUser.isStaffLeave && agentUser.isStaffLeave === 'yes' // 当前代理人是否离职
    const { status='00', editable='yes', approveInfos, workflowInfos, addFillbackInfo, fileUrl, attachmentUrl, uploadProof, returnNode, voucherStatus } = applyInfo
    const disabled = true
    const isProof = Object.keys(uploadVoucher).length !== 0 ? true : false;
    const isNew = Object.keys(this.props.match.params).length === 0

    return <div>
      <Spin spinning={this.state.subing}>
        <Form className="m-invalidate">
          <Card className="m-card border-bottom" title="申请人信息" bordered={false} noHovering>
            <Row>
              <Col span={16}>
                <FormItem {...spanLayout} label="申请类型：">
                  {getFieldDecorator('isAgent', {
                    rules: [{ required: true, message: '申请人必选' }]
                  })(
                    <RadioGroup disabled onChange={this.isAgentChange}>
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
          <Card className="m-card" title="申请信息" bordered={false} noHovering>
            <Row>
              <Col span={8}>
                <FormItem {...formItemLayout}  label="资产种类：">
                  {getFieldDecorator('assetCategory',{
                    rules: [{ required: true, message: '资产种类必选' }],
                    initialValue: assetCategoryCheck,
                  })(
                    <RadioGroup
                      onChange={this.assetCategoryChange}
                    >
                      {this.getAssetCategoryRadio(assetCategory, !isNew && voucherStatus !== '00')}
                    </RadioGroup>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                {
                  assetCategoryCheck === '10' ?
                    <FormItem  {...formItemLayout} label="是否存在实物：">
                      {getFieldDecorator('inKind',{
                        rules: [{ required: true, message: '是否存在实物必选' }],
                        initialValue: 'yes',
                      })(
                        <RadioGroup>
                          <Radio disabled={disabled} value="yes">是</Radio>
                          <Radio disabled={disabled} value="no">否</Radio>
                        </RadioGroup>
                      )}
                    </FormItem> : null
                }
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
                          <div className={`$u-select-user-input ${isNew ? '' : 'disabled'}`} onClick={()=>{ isNew ? this.modalUserOpen('manager') : null}}>
                            {getFieldDecorator('approveManagerName',
                              {
                                rules: [{ required: true, message: '离职员工上级经理必选' }],
                                initialValue: applyInfo.approveManagerName ? applyInfo.approveManagerName : ''
                              })(<Input disabled={!isNew} suffix={<Icon type="search"/>} />
                            )}
                          </div>
                        </Col>
                      </Row>
                    </FormItem>
                  </Col>
                </Row> : null
            }
            <Table style={{marginBottom:'5px'}} pagination={false} columns={this.getColumns(disabled)} dataSource={assetList} />
            {
              assetCategoryCheck === '20' && this.state.showWorth ?
                <Row style={{textAlign: 'right'}}>
                  <Col span={24}>
                    <span style={{paddingRight: '20px'}}>剩余价值总和：{Number(this.state.worth).toFixed(2)}</span>
                  </Col>
                </Row> : null
            }
            <Row>
              <Col span={8}>
                <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="报废原因：">
                  {getFieldDecorator('remarkOption',{
                    rules: [{ required: true, message: '报废原因必选' }],
                    initialValue: "default",
                  })(
                    <RadioGroup
                      onChange={this.remarkChange}
                    >
                      <Radio disabled={disabled} value="default">设备老旧、配置低</Radio>
                      <Radio disabled={disabled} value="other">其它</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
              </Col>
            </Row>
            <FormItem style={remarkOption === 'default' ? {display:'none'} : {}}>
              <label className="text-area-label">报废原因：</label>
              {getFieldDecorator('remark',{
                rules: [{ required: true, message: '报废原因必选' }],
                initialValue: "设备老旧、配置低",
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
                        disabled={disabled}
                        onClick={() => {this.downLoad(fileUrl)}}
                      >
                        下载凭证
                      </Button>
                    </FormItem>
                  </Col>
                </Row> : null
            }
            {
              attachmentUrl ?
                <Row>
                  <Col span={8}>
                    <FormItem {...formItemLayout} label="下载附件：">
                      <Button
                        type="primary"
                        icon="download"
                        size='default'
                        onClick={() => {this.downLoad(attachmentUrl)}}
                      >
                        下载附件
                      </Button>
                    </FormItem>
                  </Col>
                </Row> : null
            }
          </Card>
        </Form>
        {
          match.params.id !== undefined ?
            <Approve
              dispatch={dispatch}
              match={this.props.match}
              companyData={companyList}
              regionData={regionList}
              sbuList={sbuList}
              assetInfo={this.state.assetInfo}
              approveId={this.state.approveId}
              isBatch={applyInfo.isBatchApprove}
              history={this.props.history}
              approveInfos={approveInfos}
              workflowInfos={workflowInfos}
              isApprove={isApprove}
              isComplete={isComplete}
              addFillbackInfo={addFillbackInfo}
              loadStart={this.loadStart}
              loadEnd={this.loadEnd}
              returnNode={returnNode}
              fileUrl={isProof ? uploadVoucher.id : null}
            /> : null
        }
      </Spin>
    </div>
  }

}

export default Form.create()(Root)
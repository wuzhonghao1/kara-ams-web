import React from 'react'
import { Card, Row, Col, Spin, Form, Radio, Input, AutoComplete,
  Icon, Select, Table, Button, Modal} from 'antd'
import message from '../../common/Notice/notification'
import _ from 'lodash'
import './invalidate.less'
import noticeModal from '../../common/Notice/notification'
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
      assetArr: [], // 审批单初始资产列表
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
      inKind: 'yes',
      delAsset: false,
      addFail: false, // 添加失败
      delFail: false, // 删除失败
      isAssetManger: false, // 资产管理员
    }
  }

  componentWillMount() {
    this.props.user.roleInfos.map(i => {
      if(i.userRole === 'ASSET_MANAGER') {
        this.setState({ isAssetManger: true })
      }
    })
  }

  componentDidMount(){
    const { isAgent } = this.state
    this.setFieldsByAgent(isAgent)
    this.saveAssetCategoryToState()
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
    const { applyInfo, user } = newProps
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
      this.getUpLoadFile({id: attachmentUrl})
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
      assetArr: assetList,
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
    this.setState({assetCategoryCheck: assetCategory, inKind: inKind})
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

  modalAssetOpen = () => {
    this.props.form.validateFields((err, values) => {
      if(!values.assetCategory) {
        message.warning('请选择资产种类')
        return
      } else {
        this.setState({
          assetVisible: true
        });
      }
    })
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
      this.setState({ assetList: [] })
      this.modalUserClose()
    }
    if(userType === 'manager') {
      this.setFieldsByManager(staff[0])
      this.setState({ assetList: [] })
      this.modalUserClose()
    }
    if(userType === 'new') {
      this.setFieldsByNewPerson(staff[0])
      this.setState({ assetList: [] })
      this.modalUserClose()
    }
  }

  // 切换代理人
  isAgentChange = (e) => {
    const isAgent = e.target.value
    this.setState({isAgent, assetList: []})
    this.setFieldsByAgent(isAgent)
  }

  // 是否存在实物
  isExit = (e) => {
    const inKind = e.target.value
    this.setState({inKind})
    if(inKind === 'no') {
      message.warning('请上传部门VP确认同意无实物报废的证明，否则不允许进行无实物报废')
    }
  }

  // 切换分类
  assetCategoryChange= (e) => {
    const assetCategoryCheck = e.target.value
    if(assetCategoryCheck === '10') {
      this.setState({ inKind: 'yes' })
    }
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
        costenter: applyCCId,
        applyCCId,
        companyName,
        applyCompanyId,
        regionName,
        applyRegionId,
        sbuName,
        applySbuId,
        assetCategory: '10'
      }
      this.setState({assetCategoryCheck: '10'})
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
    if(assetList.length > 10) {
      message.warning('最多选择10条资产');
      return
    }
    // 如果是新建申请单 资产 保存到 state 提交到时候一起提交到服务器
    let newArr = this.state.assetList;
    if (newArr.length !== 0) {
      newArr.map(item => {
        assetList.forEach((k, index) => {
          if(item.assetId === k.assetId) {
            assetList.splice(index, 1);
            message.warning(`${item.serialNumber}已存在，请不要重复添加`)
          }
        })
      })
      const newList = this.resetAssetKey(newArr.concat(assetList))
      if(newList.length > 10) {
        message.warning('最多选择10条资产');
        return
      }
      this.setState({assetList:newList})
    } else {
      const newList = this.resetAssetKey(newArr.concat(assetList))
      if(newList.length > 10) {
        message.warning('最多选择10条资产');
        return
      }
      this.setState({assetList:newList})
    }
  }

  // 从新设置资产的key
  resetAssetKey = (asset) => {
    return asset.map((v,i)=>({...v,key:i+1}))
  }

  // 删除模态框
  deleteAsset = (asset) => {
    const { assetList } = this.state
    if(assetList.length === 1 && this.props.match.params.id) {
      message.warning('请至少保留一条资产')
      return false
    }
    this.setState({ delAsset: true, asset })
  }

  closeAsset = () => {
    this.setState({ delAsset: false })
  }

  // 删除资产
  deleteAssetItem = () => {
    const { assetList, asset } = this.state
    // 直接从 state 删除
    let worth = 0
    const newList = this.resetAssetKey(_.filter(assetList,function(o) { return o.key !== asset.key }))
    newList.map(k => {
      if(k.remainingWorth) {
        worth += Number(k.remainingWorth)
      }
    })
    this.setState({assetList: newList, worth})
    this.closeAsset()
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
            this.setState({ assetList: newData, cacheData: cacheData, worth: worth, showWorth: true });
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
        console.log('本地', )
        // 直接本地
        delete target.editable;
        const cacheData = newData.map(item => ({ ...item }));
        newData.map(k => {
          console.log(k , typeof Number(k.remainingWorth));
          if(k.remainingWorth && Number(k.remainingWorth) ) {
            worth += Number(k.remainingWorth)
          } else {
            worth += 0
          }
        })
        this.setState({ assetList: newData, cacheData: cacheData, worth: worth, showWorth: true });
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
        width: 100,
        render: (text, record) => {
          const textToFixed = Number(text ==='' || text !== null && text >=0 ? text : 0).toFixed(2)
          const { editable } = record
          return editable ?
            <Input autoFocus value={text} onChange={e => this.changeAssetItem(e.target.value, record.key, 'remainingWorth')} /> : textToFixed
        },
      })
    }
    if(addFillbackInfo === 'yes') {
      columns.push({
        title: '请填写资产回填信息',
        key: 'addFillbackInfo',
        fixed: 'right',
        width: 100,
        render: (asset) => <Input onChange={(e) => {this.addCostValue(e, asset)}}/>,
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
    if(!disabled) {
      columns.push({
        title: '操作',
        key: 'operation',
        fixed: 'right',
        width: 100,
        render: (asset,record) => {
          const { editable } = record;
          return (
            <div className="table-action">
              {
                editable ?
                  <span>
                    <a onClick={() => this.saveAssetItem(record)}>保存</a>
                    <a onClick={() => this.cancelAssetItem(record.key)}>取消</a>
                  </span>
                  : <span>
                    {
                      this.state.assetCategoryCheck === '20' ?
                        <a href="#" onClick={()=>{this.editorAssetItem(record.key)}}>编辑</a> : null
                    }
                    <a href="#" onClick={()=>{this.deleteAsset(asset)}}>删除</a>
                  </span>
              }
            </div>
          )
        },
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
    this.props.downLoadFile(param).then(result => {
      if(result && result.response && !result.response.resultCode) {
        saveAs(result.response.blob, decodeURI(result.response.filename))
      } else if (result.response.resultCode === '666666'){
        message.warning(result.response.resultMessage);
      } else {
        message.error('下载失败!');
      }
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

  assetSub = (params) => {
    this.props.assetSubmit(params).then((res) => {
      if (res && res.response && res.response.resultCode === '000000') {
        message.success('提交成功');
        this.props.history.push(``)
      } else if (!res || !res.response) {
        message.error('系统问题，请联系系统管理员')
      } else {
        message.error(res.response.resultMessage)
      }
      this.setState({subing: false})
      setTimeout(() => {
        this.submitIng = false
      }, 5000)
    })
  }

  assetFn = (params) => {
    console.log(params);
    const {assetArr, assetList, voucherId} = this.state;
    /** assetArr 原资产列表
     *  assetList 修改后资产列表
     **/
    let del = [] // 删除
    let add = [] // 增加
    let initId = [] // 初始资产id列表，用于查找删除项
    let newId = [] // 操作后资产id列表，用于查找增加项
    assetArr.map(i => {
      initId.push(i.assetId)
    })
    assetList.map(i => {
      newId.push(i.assetId)
    })
    assetArr.map(init => {
      // 找到删除项
      if(newId.indexOf(init.assetId) === -1) {
        del.push(init.itemId)
      }
    })
    assetList.map(n => {
      if(initId.indexOf(n.assetId) === -1) {
        // 找到增加项
        add.push(n)
      }
    })
    let count = 0
    if(voucherId) {
      if (del.length !== 0) {
        // 有删除项
        this.props.deleteAsset(voucherId, del).then(res => {
          count += 1
          if(res && res.response && res.response.resultCode === '000000') {
            if (count === 2 || (add.length === 0 && count === 1)) {
              this.assetSub(params)
            }
          }else{
            this.setState({ delFail: true })
            message.error(res.response.resultMessage)
            return false
          }
        })
      }
      if (add.length !== 0) {
        // 有增加项
        this.props.addAsset(voucherId, add).then(res => {
          count += 1
          if (res && res.response && res.response.resultCode === '000000') {
            if (count === 2 || (del.length === 0 && count === 1)) {
              this.assetSub(params)
            }
          } else {
            message.error(res.response.resultMessage)
            this.setState({ addFail: true })
            return false
          }
        })
      }
      if (del.length === 0 && add.length === 0) {
        this.props.assetSubmit(params).then((res)=>{
          if(res && res.response && res.response.resultCode === '000000') {
            message.success('提交成功');
            this.props.history.push(``)
          }else if(!res || !res.response){
            message.error('系统问题，请联系系统管理员')
          }else{
            message.error(res.response.resultMessage)
          }
          this.setState({ subing: false })
          setTimeout(()=>{
            this.submitIng = false
          },5000)
        })
      }
    } else {
      if(!this.state.addFail && !this.state.delFail) {
        this.props.assetSubmit(params).then((res)=>{
          if(res && res.response && res.response.resultCode === '000000') {
            message.success('提交成功');
            this.props.history.push(``)
          }else if(!res || !res.response){
            message.error('系统问题，请联系系统管理员')
          }else{
            message.error(res.response.resultMessage)
          }
          this.setState({ subing: false })
          setTimeout(()=>{
            this.submitIng = false
          },5000)
        })
      } else {
        message.error('资产操作失败')
      }
    }

  }

  onSubmit = (type) => {
    if(this.submitIng) {
      message.warning('请不要重复保存')
      return
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // 报废路径
        const attachmentUrl = Object.keys(this.state.upLoadScrap).length === 0 ? null : this.state.upLoadScrap.id;
        const { agentUser={}, assetList=[], voucherId, assetCategoryCheck } = this.state
        const agentUserIsLeave = agentUser.isStaffLeave && agentUser.isStaffLeave === 'yes' // 当前代理人是否离职
        const assetInfos = assetList.map((v)=>{
          return {
            assetId: v.assetId,
            serialNumber: v.serialNumber,
            remainingWorth: Number(v.remainingWorth) >= 0 ? Number(v.remainingWorth).toFixed(2) : '0.00',
            assetCategory: v.assetCategory,
            assetType: v.assetType,
            assetKey: v.assetKey,
            description: v.description,
            lifeInMonths: v.lifeInMonths,
            depreciatedMonths: v.depreciatedMonths,
            originalCost: v.originalCost,
            cost: v.cost,
            netBookValue: v.netBookValue,
            assignedPersonId: v.assignedPersonId,
            assignedCompanyId: v.assignedCompanyId,
            assignedSbuId: v.assignedSbuId,
            assignedCcId: v.assignedCcId,
            assignedRegionId: v.assignedRegionId,
            //useDate: v.serviceDate.replace(new RegExp('-',"gm"),''),
            serviceDate: v.serviceDate,
            bookTypeCode: v.bookTypeCode,
            ledgerId: v.ledgerId,
          }
        })
        const {
          isAgent,
          assetCategory,
          isStrideBg,
          applyPersonId,
          applyStaffCode,
          applyCCId,
          applyCompanyId,
          applyRegionId,
          applySbuId,
          newPersonId,
          newCCId,
          newCompanyId,
          newRegionId,
          newSbuId,
          newBgId,
          approveManager,
          remarkOption,
          remark,
          inKind,
        } = values
        if(agentUserIsLeave && assetCategoryCheck === '10') {
          if(!approveManager) {
            // 员工离职需选择上级经理
            message.warning('请选择离职员工上级经理')
            return
          }
        }
        if (values.inKind === 'no' && !attachmentUrl) {
          // 无实物 需要上传附件
          message.warning('请上传报废附件')
          return
        }

        const params = {
          voucherType:'20',
          isAgent,
          assetCategory,
          isStaffLeave: agentUser.isStaffLeave,
          isStrideBg,
          applyPersonId,
          applyStaffCode,
          applyCCId,
          applyCompanyId,
          applyRegionId,
          applySbuId,
          newPersonId,
          newCCId,
          newCompanyId,
          newRegionId,
          newSbuId,
          newBgId,
          approveManager,
          remark: remarkOption === 'default' ? '设备老旧、配置低' : remark,
          inKind,
          attachmentUrl,
        }

        if(voucherId) {
          // update
          params.voucherId = voucherId
        }else{
          // create
          params.assetInfos = assetInfos
        }
        if(type === 'submit') {
          params.assetInfos = assetInfos
        }
        this.submitIng = true // 开始提交
        if(type === 'save') {
          this.setState({ subing: true })
          this.props.assetSave(params).then((res)=>{
            if(res && res.response && res.response.resultCode === '000000') {
              message.success('保存成功');
              this.props.history.push('')
            }else if(res && res.response && res.response.resultMessage){
              message.error(res.response.resultMessage)
            }else{
              message.error('数据保存接口错误');
            }
            this.setState({ subing: false })
            setTimeout(()=>{
              this.submitIng = false
            },5000)
          })
        }else{
          this.setState({ subing: true })
          this.assetFn(params)
        }
      }
    });
  }

  render() {
    const { isAgent, agentUser={}, assetList, remarkOption, assetCategoryCheck, upLoadScrap, uploadVoucher } = this.state
    const { dispatch, isApprove, isComplete, match, form, applyInfo, assetCategory,
      companyList=[], regionList=[], sbuList=[], ccList=[] } = this.props
    const { getFieldDecorator } = form;
    const formItemLayout = {labelCol: { span: 8 }, wrapperCol: { span: 14 }};
    const spanLayout = {labelCol: { span: 4 }, wrapperCol: { span: 18 }};
    const remarkLayout = {labelCol: { span: 2 }, wrapperCol: { span: 22 }};
    const disabledAgent = isAgent === 'no' ? true : false // 选择代理人是否可用
    const agentUserIsLeave = agentUser.isStaffLeave && agentUser.isStaffLeave === 'yes' // 当前代理人是否离职
    const { status='00', editable='yes', approveInfos, workflowInfos, addFillbackInfo, fileUrl, attachmentUrl, uploadProof, returnNode, voucherStatus } = applyInfo
    const disabled = editable === 'no' || isApprove ? true : false
    const isScrap = Object.keys(upLoadScrap).length !== 0 ? true : false;
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
                    <RadioGroup onChange={this.isAgentChange}>
                      <Radio disabled={!isNew} value="no">本人申请</Radio>
                      <Radio disabled={!isNew} value="yes">代理申请</Radio>
                    </RadioGroup>
                  )}
                  {
                    isApprove && isAgent==='yes' ?
                      <span className='createApproveInfo'>
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
                        <RadioGroup onChange={(e) => {this.isExit(e)}}>
                          <Radio disabled={disabled || !this.state.isAssetManger} value="yes">是</Radio>
                          <Radio disabled={disabled || !this.state.isAssetManger} value="no">否</Radio>
                        </RadioGroup>
                      )}
                    </FormItem> : null
                }
              </Col>
            </Row>
            {
              agentUserIsLeave ?
                <Row>
                  <Col span={24}>
                    <FormItem style={{display: 'none'}} label="上级经理">
                      {getFieldDecorator('approveManager')(
                        <Input style={{display: 'none'}} disabled />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={16}>
                    <FormItem labelCol = {{ span: 4 }} wrapperCol={{ span: 14 }} label="上级经理：" extra={<span style={{color: '#f04134'}}>员工已离职，请选择申请员工的上级经理。</span>}>
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
            <Row>
              <Col span={8}>
                <FormItem {...formItemLayout} label="要报废的资产：">
                  <Button disabled={disabled} type="primary" size="default" onClick={this.modalAssetOpen}>选择</Button>
                </FormItem>
              </Col>
            </Row>
            <Table style={{marginBottom:'5px'}} pagination={false} columns={this.getColumns(disabled)} dataSource={assetList} />
            {
              assetCategoryCheck === '20' && this.state.showWorth ?
                <Row style={{textAlign: 'right'}}>
                  <Col span={24}>
                    <span style={{paddingRight: '20px'}}>剩余价值总和：{typeof Number(this.state.worth).toFixed(2) === NaN ? 0 : Number(this.state.worth).toFixed(2)}</span>
                  </Col>
                </Row> : null
            }
            <Row>
              <Col span={8}>
                <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 16 }} label="报废原因：">
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
            {
              remarkOption !== 'default' ?
                <Row style={{paddingLeft: '18px'}}>
                  <Col span={24}>
                    <FormItem {...remarkLayout} label='报废说明：'>
                      {getFieldDecorator('remark',{
                        rules: [{ required: true, message: '报废原因必选' }],
                        initialValue: applyInfo.remark !== '设备老旧、配置低' ? applyInfo.remark : null,
                      })(
                        <TextArea placeholder='请输入报废原因' disabled={disabled} className="text-area" rows={2} />
                      )}
                    </FormItem>
                  </Col>
                </Row> : null
            }
            {
              (!attachmentUrl || editable) && this.state.inKind === 'no' && assetCategoryCheck === '10' ?
                <Row style={{paddingTop: '5px'}}>
                  <Col span={8}>
                    <FormItem {...formItemLayout} label="上传证明：">
                      <InputFile
                        dispatch={dispatch}
                        disabled={disabled}
                        getUpLoadFile={this.getUpLoadFile}
                      />
                      {isScrap ?
                        <div className='upLoadList'>
                          {/*<span>{upLoadScrap.name ? upLoadScrap.name : '附件'}</span>*/}
                          <span>证明</span>
                          {
                            !disabled ?
                              <Icon type="close" onClick={()=> {this.setState({upLoadScrap: {}})}}>
                                <b>删除</b>
                              </Icon> : null
                          }
                        </div> : null
                      }
                    </FormItem>
                  </Col>
                </Row> : null
            }
            {
              uploadProof === 'yes' ?
                <Row>
                  <Col span={8}>
                    <FormItem {...formItemLayout} label="上传凭证：">
                      <InputFile
                        dispatch={dispatch}
                        getUpLoadFile={this.getUpLoadFile}
                        type='proof'
                        text={'上传凭证'}
                      />
                      {isProof ?
                        <div className='upLoadList'>
                          <span>{uploadVoucher.name}</span>
                          {
                            !disabled ?
                              <Icon type="close" onClick={() => {
                                this.setState({uploadVoucher: {}})
                              }}>
                                <b>删除</b>
                              </Icon> : null
                          }
                        </div> : null
                      }
                    </FormItem>
                  </Col>
                </Row> : null
            }
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
            {
              match.params.id === undefined || (!isApprove && match.params.id !== undefined) ?
                <FormItem className="btn">
                  {status === '00' ? <Button type="primary" size="default" onClick={()=>{this.onSubmit('save')}}>保存</Button> : null}
                  {editable === 'yes' ? <Button type="primary" size="default" onClick={()=>{this.onSubmit('submit')}}>提交</Button> : null}
                </FormItem> : null
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
      {this.state.userVisible ? <Modal
          visible={this.state.userVisible}
          title="员工查询"
          width="1000px"
          footer={null}
          onOk={this.modalUserClose}
          onCancel={this.modalUserClose}>
          <StaffFinder dispatch={dispatch}
                       multiple={false}
                       bgCode={this.state.staffBgCode}
                       keywords={this.state.keywords}
                       selectStaff={this.selectStaff}
                       companyData={companyList}
                       regionData={regionList}
                       buData={sbuList}
                       ccData={ccList}
                       translate
          />
        </Modal> : null}
      {this.state.assetVisible ? <Modal
          visible={this.state.assetVisible}
          title="资产查询"
          width="1200px"
          footer={null}
          onCancel={this.modalAssetClose}
        >
          <Asset
            userInfo={agentUser}
            assetCategoryCheck={assetCategoryCheck}
            assetCheckCB={this.assetCheckCB}
            modalAssetClose={this.modalAssetClose}
          />
        </Modal> : null}
      {
        this.state.delAsset ?
          <Modal
            title="删除资产"
            visible={this.state.delAsset}
            onOk={this.deleteAssetItem}
            onCancel={this.closeAsset}
          >
            <p>你确定要删除吗？</p>
          </Modal> : null
      }
    </div>
  }

}

export default Form.create()(Root)
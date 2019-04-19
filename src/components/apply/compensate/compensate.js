import React from 'react'
import { Card, Row, Col, Form, Radio, Input, AutoComplete, Icon, Spin, Select, Table, Button, Checkbox, Modal } from 'antd'
import message from '../../common/Notice/notification'
import _ from 'lodash'
import './compensate.less'
import StaffFinder from '../../common/staffFinder/staffFinder'
import InputFile from '../invalidate/inputFile'
import Approve from '../approve/approve'
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
      inputNum: false, // 填写资产原值
      subing: false, // 提交loading
      assetList:[],
      assetArr: [], // 审批单初始资产列表
      approveId: '',
      assetObj: {}, // 资产 key itemId value 填写值
      staffBgCode: sessionStorage.getItem('bgCode'),
      worth: 0, // 资产原值总和
      uploadVoucher: {}, //上传凭证
      showWorth: false, // 显示赔偿金额
      cacheData: [],
      delAsset: false, //删除资产
      currentAsset: {}, // 当前资产
      addFail: false, // 添加失败
      delFail: false, // 删除失败
    }
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
      assetArr: assetList,
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

  modalUserClose = () => {
    this.setState({
      userVisible: false
    });
  }

  modalAssetOpen = () => {
    this.setState({
      assetVisible: true
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
  // 根据 new person 设置表单值 approveManager
  setFieldsByManager = (manager) => {
    const { personId:approveManager, accountName:approveManagerName } = manager
    const initValue = {
      approveManager,
      approveManagerName
    }
    this.props.form.setFieldsValue(initValue)
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

  // 删除资产Model
  deleteAssetItem = (asset) => {
    const { assetList } = this.state
    if(assetList.length === 1 && this.props.match.params.id) {
      message.warning('请至少保留一条资产')
      return false
    }
    this.setState({ delAsset: true, currentAsset: asset });
  }

  delAssetFunc = () => {
    const { assetList, currentAsset } = this.state
    // 直接从 state 删除
    const newList = this.resetAssetKey(_.filter(assetList,function(o) { return o.key !== currentAsset.key }))
    this.setState({assetList:newList})
    this.hideDelAsset()
  }

  // 取消删除
  hideDelAsset = () => {
    this.setState({ delAsset: false });
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
    if(addCost === 'yes' && this.props.isApprove) {
      columns.push({
          title: '请填写资产原值',
          key: 'addCost',
          className: 'tHeader',
          fixed: 'right',
          width: 50,
          render: (text, record) => {
            const textToFixed = (text.addCost ==='' || text.addCost !== null && text.addCost >=0 ? text.addCost : 0).toFixed(2)
            const { editable } = record
            return editable ?
              <Input autoFocus defaultValue={record.addCost ? Number(record.addCost).toFixed(2) : null} onChange={(e) => { this.addCostValue(e.target.value, record, 'addCost') }}/>
              : textToFixed
          }
        },
        {
          title: '计算后赔偿金额',
          key: 'calcuAmount',
          className: 'tHeader',
          width: 50,
          fixed: 'right',
          render: text => {return text.calcuAmount ? Number(text.calcuAmount).toFixed(2) : null}
        },
        {
          title: '操作',
          key: 'operation1',
          fixed: 'right',
          width: 100,
          className: 'tHeader',
          fixed: 'right',
          render: (asset, record) => {
            const {editable} = record;
            return (
              <div>
                {
                  editable ?
                    <span className='operat-btn'>
                      <a onClick={() => this.saveAssetItem(record)}>保存</a>&emsp;&nbsp;
                      <a onClick={() => this.cancelAssetItem(record.key)}>取消</a>
                    </span>
                    : <span className='operat-btn'>
                      <a onClick={() => {
                        that.editorAssetItem(record.key)
                      }}>编辑</a>
                    </span>
                }
              </div>
            )
          },
        })
    }
    if(!disabled && !this.props.isApprove) {
      columns.push({
        title: '操作',
        key: 'operation',
        fixed: 'right',
        width: 100,
        className: 'tHeader',
        render: (asset) => <span className='operat-btn'>
          <a href="#" onClick={()=>{this.deleteAssetItem(asset)}}>删除</a>
        </span>,
      })
    }
    return columns
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
  // 取消保存
  cancelAssetItem = (key) => {
    const newData = [...this.state.assetList];
    const target = newData.filter(item => key === item.key)[0];
    if (target) {
      Object.assign(target, this.state.cacheData.filter(item => key === item.key)[0]);
      delete target.editable;
      this.setState({ assetList: newData });
    }
  }
  useMonth = (now, pass, year) => {
    return year * 12 + (now - pass);
  }
  // 保存资产
  saveAssetItem = (record) => {
    let Obj = this.state.assetObj;
    let worth = null
    const nowYear = Number(new Date().getFullYear());
    const nowDay = new Date().getDay() > 10 ? new Date().getDay() : `0${new Date().getDay()}`;
    const nowMonth = new Date().getMonth() + 1 > 10 ? new Date().getMonth() + 1 : `0${new Date().getMonth() + 1}`;
    const newData = [...this.state.assetList];
    const target = newData.filter(item => record.key === item.key)[0];
    let amount = null; // 计算后的赔偿金额
    if (target) {
        // 直接本地
        delete target.editable;
        newData.map((item, idx) => {
          // 计算资产 <48个月 原值 - 原值95%/(48*已使用月份) >48 *5%
          if(item.serviceDate && item.addCost) {
            const serviceYear = Number(item.serviceDate.substring(0,4))
            const serviceMonth = Number(item.serviceDate.substring(4,6))
            const serviceDay = Number(item.serviceDate.substring(6))
            const cost = Number(item.addCost)
            if((Number(nowYear) - Number(serviceYear) === 4) && (Number(nowMonth) - Number(serviceMonth) >= 0) ||
              (Number(nowYear) - Number(serviceYear) > 4) ) {
              // 大于48个月
              amount = cost*0.05
            } else {
              // 小于48个月
              amount = cost - ((cost*0.95)/48)*this.useMonth(nowMonth, serviceMonth, nowYear - serviceYear)
            }
            item['calcuAmount'] = amount
            if(item.calcuAmount) {
              worth += Number(item.calcuAmount.toFixed(2))
            }
          } else {
            item['calcuAmount'] = 0
          }
        })
        for(let k in Obj) {
          if(k === record.itemId) {
            Obj[k] = Number(record.addCost).toFixed(2);
          }
        }
        const cacheData = newData.map(item => ({ ...item }));
        this.setState({ assetList: newData, worth: worth, assetObj: Obj, cacheData: cacheData, showWorth: true });
      }
  }
  // 上传附件
  getUpLoadFile = (upLoadObj, type) => {
    this.setState({
      uploadVoucher: upLoadObj,
    })
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
        const { agentUser={}, assetList=[], voucherId, assetCategoryCheck } = this.state
        const agentUserIsLeave = agentUser.isStaffLeave && agentUser.isStaffLeave === 'yes' // 当前代理人是否离职
        const assetInfos = assetList.map((v)=>{
          return {
            assetId: v.assetId,
            serialNumber: v.serialNumber,
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
          remark,
          remarkOption
        } = values
        if(agentUserIsLeave && assetCategoryCheck === '10') {
          if(!approveManager) {
            // 员工离职需选择上级经理
            message.warning('请选择离职员工上级经理')
            return
          }
        }

        const params = {
          voucherType:'30',
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
          remark: remarkOption === 'default' ? '丢失赔偿' : remark,
          isStrideCompany: applyCompanyId === newCompanyId ? 'no' : 'yes',
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
              this.props.history.push('/applicationSearch/search')
            }else if(!res || !res.response){
              message.error('系统问题，请联系系统管理员')
            }else{
              message.error(res.response.resultMessage);
            }
            this.setState({ subing: false })
            setTimeout(()=>{
              this.submitIng = false
            },5000)
          })
        }else{
          if(!values.promise) {
            message.error('请勾选保证协议')
            return false
          }
          this.setState({ subing: true })
          this.assetFn(params)
        }
      }
    });
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
    const { isAgent, agentUser={}, assetList, remarkOption, assetCategoryCheck, uploadVoucher } = this.state
    const { dispatch, isApprove, isComplete, match, form, applyInfo, assetCategory,
      companyList=[], regionList=[], sbuList=[], ccList=[] } = this.props
    const { getFieldDecorator } = form;
    const formItemLayout = {labelCol: { span: 8 }, wrapperCol: { span: 14 }};
    const spanLayout = {labelCol: { span: 4 }, wrapperCol: { span: 18 }};
    const remarkLayout = {labelCol: { span: 2 }, wrapperCol: { span: 22 }};
    const disabledAgent = isAgent === 'no' ? true : false // 选择代理人是否可用
    const agentUserIsLeave = agentUser.isStaffLeave && agentUser.isStaffLeave === 'yes' // 当前代理人是否离职
    const { status='00', editable='yes', approveInfos, workflowInfos, addCost, fileUrl, uploadProof, returnNode, voucherStatus,remark } = applyInfo
    const disabled = editable === 'no' || isApprove ? true : false
    const isProof = Object.keys(uploadVoucher).length !== 0 ? true : false;
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
                      onChange={this.isAgentChange}
                    >
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
                      onChange={this.assetCategoryChange}
                    >
                      {this.getAssetCategoryRadio(assetCategory, !isNew && voucherStatus !== '00')}
                    </RadioGroup>
                  )}
                </FormItem>
              </Col>
            </Row>
            {
              agentUserIsLeave ?
                <Row>
                  <Col span={24}>
                    <FormItem style={{display: 'none'}} label="上级经理">
                      {getFieldDecorator('approveManager')(
                        <Input style={{display: 'none'}} />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={16}>
                    <FormItem labelCol = {{ span: 4 }} wrapperCol={{ span: 14 }} label="上级经理：" extra={<span style={{color: '#f04134'}}>员工已离职，请选择申请员工的上级经理。</span>}>
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
            <Row>
              <Col span={8}>
                <FormItem {...formItemLayout} label="要赔偿的资产：">
                  <Button disabled={disabled} type="primary" size="default" onClick={this.modalAssetOpen}>选择</Button>
                </FormItem>
              </Col>
            </Row>
            <Table  pagination={false} columns={this.getColumns(disabled)} dataSource={assetList} />
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
            {
              remarkOption !== 'default' ?
                <Row style={{paddingLeft: '19px'}}>
                  <Col span={24}>
                    <FormItem {...remarkLayout} label="赔偿说明：">
                      {getFieldDecorator('remark',{
                        rules: [{ required: true, message: '赔偿说明必填' }],
                        initialValue: remark === '丢失赔偿' ? null : remark
                      })(
                        <TextArea placeholder='请输入赔偿原因' disabled={disabled} className="text-area" />
                      )}
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
                        text={'上传凭证'}
                      />
                      {isProof ?
                        <div className='upLoadList'>
                          <span>{uploadVoucher.name}</span>
                          <Icon type="downLoad" onClick={()=> {this.setState({uploadVoucher: {}})}}>
                            <b>删除</b>
                          </Icon>
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
            {
              match.params.id === undefined || (!isApprove && match.params.id !== undefined) ?
                <FormItem className="btn">
                  {status === '00' ? <Button type="primary" size="default" onClick={()=>{this.onSubmit('save')}}>保存</Button> : null}
                  {editable === 'yes' ? <Button type="primary" size="default" onClick={()=>{this.onSubmit('submit')}}>提交</Button> : null}
                </FormItem> : null
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
                isComplete={isComplete}
                assetObj={this.state.assetObj}
                addCost={addCost}
                returnNode={returnNode}
                loadStart={this.loadStart}
                loadEnd={this.loadEnd}
                fileUrl={isProof ? uploadVoucher.id : null}
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
      {this.state.assetVisible ?
        <Modal
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
      <Modal
        title="删除资产"
        visible={this.state.delAsset}
        onOk={this.delAssetFunc}
        onCancel={this.hideDelAsset}
      >
        <p>你确定要删除吗？</p>
      </Modal>
    </div>
  }

}

export default Form.create()(Root)
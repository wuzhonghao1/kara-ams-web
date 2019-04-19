import React from 'react'
import './Search.css'
import { Form, Input, Row, Col, Select, DatePicker, Button, Table, Icon, Modal, Checkbox, Card, Tooltip } from 'antd';
import message from '../common/Notice/notification'
import StaffFinder from '../common/staffFinder/staffFinder'
import BatchApp from './batchApprove'
import debounce from 'lodash/debounce'
import Forward from './forward'

const FormItem = Form.Item;
const InputSearch = Input.Search;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;

class Search extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      ccData: [],
      visible: false,
      taskForward: false, // 任务转发
      batchApprove: false, // 批量审核
      loading: false,
      forwardId: [], // 单个id
      isSysManger: false,
      checkLists: [], // 批量操作
      expand: false, // 折叠form
      pageNo: 0,
      pageSize: 0,
      pageCount: 0,
      count: 0,
    }
    const titles = [
      {name: '流水号', width: 170},
      {name: '申请人', width: 70},
      {name: '员工编号', width: 80},
      {name: '代理人', width: 70},
      {name: '申请时间', width: 130},
      {name: '资产种类', width: 70},
      {name: '资产编号', width: 110},
      {name: '所属公司', width: 90},
      {name: '所属BU', width: 100},
      {name: '所属CC', width: 60},
      {name: '申请单类型', width: 100},
      {name: '当前状态'},
      {name: '当前审批人'}];
    const keys = ['voucherNo', 'applyName', 'applyStaffCode', 'createName', 'applyTime',
      'assetCategoryName', 'assetIds', 'ownerCompany', 'ownerSbu', 'costCenter', 'voucherTypeName',
      'voucherStatusName', 'taskApproveName'];
    const columns = titles.map((o, i)=>{
      let key = keys[i];
      let column = {
        title: o.name,
        className:'tHeader',
        dataIndex: key,
        key: key,
        width: o.width,
      };
      if(key === 'voucherNo') {
        column.render = (text, record, index)=><span className="link" onClick={()=>this.linkFunc(record)}>{text}</span>
      }
      if(key === 'taskApproveName' || key === 'voucherStatusName' || key === 'voucherTypeName'){
        column.fixed = 'right'
      }
      if(key === 'assetIds'){
        column.render = (text, record, index)=>{
          let node = []
          if(record.assetIds && record.assetIds.length > 0 ) {
            record.assetIds.map((i, k) => {
              node.push(<p key={k} style={{padding: '3px 0'}}>{i}</p>)
            })
          }
          return <div>{node}</div>
        }
      }
      return column;
    });
    columns.push({
      title:'操作',
      className:'tHeader',
      key: 'operation',
      fixed: 'right',
      width: 120,
      render: (text, record, index) => {
        return (<div className="table-action">
          {
            record.isApproveNode === 'yes' ?
              <Tooltip overlayClassName="ant-tooltip-icon" title="审批">
                <a onClick={()=>this.GoToApprove(record.voucherId, record.voucherType)}>
                  <Icon type="ams-finance"/>
                </a>
              </Tooltip> : null
          }
          {
            record.isApproveNode === 'yes' ?
              <Tooltip overlayClassName="ant-tooltip-icon" title="转发">
                <a onClick={()=>this.GoToForward(record.approveId)}>
                  <Icon type="export"/>
                </a>
              </Tooltip> : null
          }
          {
            record.reminderFlag === 'yes' ?
              <Tooltip overlayClassName="ant-tooltip-icon" title="催交">
                <a onClick={()=>{this.reminderBtn(record.voucherId)}}>
                  <Icon type="right-circle-o"/>
                </a>
              </Tooltip> : null
          }
          <Tooltip overlayClassName="ant-tooltip-icon" title="详情">
            <a onClick={()=>this.GoToDetail(record.voucherId, record.voucherType)}>
              <Icon type="eye-o"/>
            </a>
          </Tooltip>
      </div>)
      },
    });
    this.checkItem = (record) => {
      let checkArr = this.state.checkLists;
      const isExit = checkArr.indexOf(record.approveId);
      if (isExit === -1) {
        checkArr.push(record.approveId)
      } else {
        checkArr.splice(isExit, 1)
      }
      this.setState({ checkLists: checkArr })
    }
    columns.unshift({
      title: '',
      className: 'tHeader',
      key: 'check',
      width: 50,
      render: (text, record) => {
        if(record.isApproveNode === 'yes' && record.allowBatchApprove === 'yes')
        return (
          <Checkbox onChange={() => { this.checkItem(record) }}/>
        )
      }
    })
    this.columns = columns;
  }
  componentWillMount() {
    this.props.getApplyStatus()
    this.props.getVoucherTypeParam()
    this.props.getAssetCategoryParam()
    this.setState({loading: true})
    this.props.approveTask({
        pageNo: 1,
        pageSize: 10,
        approveStatus: 'undo'
      }).then(res => { this.setState({loading: false}) })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.searchInfo !== nextProps.searchInfo) {
      // 设置搜索pageinfo
      this.setState({
        pageNo: nextProps.searchInfo.pageNo,
        count: nextProps.searchInfo.count,
        pageCount: nextProps.searchInfo.pageCount,
        pageSize: nextProps.searchInfo.pageSize,
      })
    }
  }

  componentDidMount() {
    const location = window.location.search;
    if (location.slice(1).split('=').indexOf('voucherNo') > -1) {
      this.props.form.setFieldsValue({ voucherNo: window.location.search.slice(1).split('voucherNo=').slice(-1)[0]})
      this.setState({loading: true})
      this.props.approveTask({
        pageNo: 1,
        pageSize: 10,
        voucherNo: window.location.search.slice(1).split('voucherNo=').slice(-1)[0],
      }).then(res => { this.setState({loading: false}) })
    } else if (location.slice(1) === 'more') {
      this.props.form.setFieldsValue({ accountName: this.props.user.accountName, approveStatus: 'undo' })
      this.setState({loading: true})
      this.props.approveTask({
        pageNo: 1,
        pageSize: 10,
        personId: this.props.user.accountId,
        approveStatus: 'undo',
      }).then(res => { this.setState({loading: false}) })
    }
  }

  linkFunc = (r) => {
    if(r.isApproveNode === 'yes') {
      this.GoToApprove(r.voucherId, r.voucherType)
    } else {
      this.GoToDetail(r.voucherId, r.voucherType)
    }
  }

  // 催交
  reminderBtn = (re) => {
    this.setState({ loading: true })
    this.props.reminder(re).then(res => {
      this.setState({ loading: false })
      if(res && res.response && res.response.resultCode === '000000') {
        message.success('催交成功')
      } else if (res && res.response && res.response.resultCode !== '000000') {
        message.error(res.response.resultMessage)
      } else {
        message.error('催交失败')
      }
    })
  }

  handleOk = () => {
    this.setState({ visible: false });
  }
  handleCancel = () => {
    this.setState({ visible: false });
  }

  doSearch = (e)=>{
    if(e) { e.preventDefault(); }
    this.props.form.validateFields((err, values) => {
      let beginDate,endDate,voucherNo,serialNumber,assetCategory,ccId,companyId,approveStatus,personId,regionId,sbuId,voucherStatus,voucherType,assetDesc
      if(values.startEnd && values.startEnd.length > 0) {
        beginDate = values.startEnd[0].format("YYYYMMDD");
        endDate = values.startEnd[1].format("YYYYMMDD");
      }
      if(values.assetCategory != ''){
        assetCategory = values.assetCategory
      }
      if(values.voucherNo != ''){
        voucherNo = values.voucherNo
      }
      if(values.serialNumber != ''){
        serialNumber = values.serialNumber
      }
      if(values.ccId != ''){
        ccId = values.ccId
      }
      if(values.companyId != ''){
        companyId = values.companyId
      }
      if(values.approveStatus != ''){
        approveStatus = values.approveStatus
      }
      if(values.personId != ''){
        personId = values.personId
      }
      if(values.regionId != ''){
        regionId = values.regionId
      }
      if(values.sbuId != ''){
        sbuId = values.sbuId
      }
      if(values.status != ''){
        voucherStatus = values.status
      }
      if(values.voucherType != ''){
        voucherType = values.voucherType
      }
      if(values.assetDesc != ''){
        assetDesc = values.assetDesc
      }
      this.setState({loading: true})
      this.props.approveTask({
        pageNo: 1,
        pageSize: 10,
        assetDesc,beginDate,endDate,voucherNo,serialNumber,assetCategory,ccId,companyId,approveStatus,personId,regionId,sbuId,voucherStatus,voucherType
      }).then(res => { this.setState({loading: false, checkLists:[]}) })
    });
  }

  selectStaff = (staff)=> {
    const { personId, accountName } = staff[0]
    this.props.form.setFieldsValue({ personId: personId , accountName })
    this.handleCancel()
  }
  changePage = (current, size) => {
    // 翻页
    this.props.form.validateFields((err, values) => {
      let beginDate,endDate,voucherNo,serialNumber,assetCategory,ccId,companyId,approveStatus,personId,regionId,sbuId,status,voucherType, assetDesc
      if(values.startEnd && values.startEnd.length > 0) {
        beginDate = values.startEnd[0].format("YYYYMMDD");
        endDate = values.startEnd[1].format("YYYYMMDD");
      }
      if(values.assetCategory != ''){
        assetCategory = values.assetCategory
      }
      if(values.voucherNo != ''){
        voucherNo = values.voucherNo
      }
      if(values.serialNumber != ''){
        serialNumber = values.serialNumber
      }
      if(values.ccId != ''){
        ccId = values.ccId
      }
      if(values.companyId != ''){
        companyId = values.companyId
      }
      if(values.approveStatus != ''){
        approveStatus = values.approveStatus
      }
      if(values.personId != ''){
        personId = values.personId
      }
      if(values.regionId != ''){
        regionId = values.regionId
      }
      if(values.sbuId != ''){
        sbuId = values.sbuId
      }
      if(values.status != ''){
        status = values.status
      }
      if(values.voucherType != ''){
        voucherType = values.voucherType
      }
      if(values.assetDesc != ''){
        assetDesc = values.assetDesc
      }
      this.setState({loading: true})
      this.props.approveTask({
        pageNo: current,
        pageSize: size,
        assetDesc,beginDate,endDate,voucherNo,serialNumber,assetCategory,ccId,companyId,approveStatus,personId,regionId,sbuId,status,voucherType
      }).then(res => { this.setState({loading: false}) })
    });
  }
  handleCcChange = debounce((value) => {
    // 所属CC 模糊查询
    if (value.trim() === '') {
      return;
    }
    const bgId = sessionStorage.getItem('bgId')
    this.props.getOrgCostCenterInfo(bgId, value).then((d) => {
      if (d.response.resultCode === '000000') {
        const result = d.response.result
        const data = []
        result.forEach((r) => {
          data.push({
            value: r.costcenterId,
            text: r.costcenterName,
          })
        })
        this.setState({ ccData: data })
      }
    })
  }, 200)

  doExport = ()=>{
    // 导出excel
    this.props.form.validateFields((err, values) => {
      // this.props.DoExport(values)
    });
  }

  batchTaskForward = ()=>{
    if(this.state.checkLists.length === 0) {
      message.warning('请选择要转发的信息')
      return false
    }
    this.setState({ taskForward: true })
  }

  GoToDetail = (voucherId, voucherType)=> {
    // 详情
    if(voucherType === '10') {
      this.props.history.push(`/apply/transferDetail/${voucherId}`)
    }
    if(voucherType === '20') {
      this.props.history.push(`/apply/invalidateDetail/${voucherId}`)
    }
    if(voucherType === '30') {
      this.props.history.push(`/apply/compensateDetail/${voucherId}`)
    }
  }

  GoToApprove = (voucherId, voucherType)=> {
    // 审批页面
    if(voucherType === '10') {
      this.props.history.push(`/apply/transfer/${voucherId}?approve`)
    }
    if(voucherType === '20') {
      this.props.history.push(`/apply/invalidate/${voucherId}?approve`)
    }
    if(voucherType === '30') {
      this.props.history.push(`/apply/compensate/${voucherId}?approve`)
    }
  }
  GoToForward = (approveIds) => {
    // 转发模态框
    this.setState({ taskForward: true, forwardId: [approveIds] })
  }
  handleForward = () => {
    // 取消转发
    this.setState({ taskForward: false, forwardId: [] });
  }
  batchOk = () => {
    // 打开批量审核
    if(this.state.checkLists.length === 0) {
      message.warning('请选择要审核的信息')
      return false
    }
    this.setState({ batchApprove: true })
  }
  hideBatch = () => {
    // 取消批量审批
    this.setState({ batchApprove: false });
  }
  handleReset = () => {
    this.props.form.resetFields();
  };

  render(){
    const { searchInfo, taskDelivery } = this.props;
    const {companyList=[], regionList=[], sbuList=[], applyStatus, voucherType, assetCategory} = this.props.dictionary
    const dictionary = {companyData:companyList, regionData: regionList, sbuList: sbuList}
    const { getFieldDecorator } = this.props.form;
    const columns = this.columns;
    const layoutProps = {
      labelCol: {
        span: 7
      },
      wrapperCol: {
        span: 17
      }
    }

    let tableArr = []
    searchInfo ? searchInfo.result.map((item, idx) => {
      tableArr.push({
        ...item,
        no: idx + 1,
        filterMultiple: false,
        costCenter: item.ownerCCId
      })
    }):null;

    return (<div className="businessApprovalSearch">
      <Card className="m-card border-bottom" bordered={false} noHovering>
        <h1>查询条件</h1>
        <Form onSubmit={this.doSearch}>
          <Row>
            <Col span={8}>
              <FormItem style={{display: 'none'}} {...layoutProps} label="员工姓名：">
                {getFieldDecorator('personId')(
                  <Input style={{display: 'none'}} disabled />
                )}
              </FormItem>
              <FormItem {...layoutProps} label="员工姓名：">
                <div className="u-select-user-input" onClick={()=>{this.setState({visible: true})}}>
                  {getFieldDecorator('accountName')(
                    <Input disabled suffix={<Icon type="search"/>} />
                  )}
                </div>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="资产编号" {...layoutProps}>
                {
                  getFieldDecorator('serialNumber')(<Input/>)
                }
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem label="流水号" {...layoutProps}>
                {
                  getFieldDecorator('voucherNo')(<Input />)
                }
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem label="申请单类型" {...layoutProps}>
                {
                  getFieldDecorator('voucherType', {initialValue: ''})(
                    <Select>
                      <Option value="">--请选择--</Option>
                      {voucherType.map((i,k) => {
                        return <Option key={k} value={i.paramValue}>{i.paramValueDesc}</Option>
                      })}
                    </Select>
                  )
                }
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="申请单状态" {...layoutProps}>
                {
                  getFieldDecorator('status', {initialValue: ''})(
                    <Select>
                      <Option value="">--请选择--</Option>
                      {applyStatus.map((i,k) => {
                        return <Option key={k} value={i.paramValue}>{i.paramValueDesc}</Option>
                      })}
                    </Select>
                  )
                }
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem label="审批情况" {...layoutProps}>
                {
                  getFieldDecorator('approveStatus', {initialValue: 'undo'})(
                    <Select>
                      <Option value="">--请选择--</Option>
                      <Option value="all">全部</Option>
                      <Option value="done">已审批</Option>
                      <Option value="undo">待审批</Option>
                    </Select>
                  )
                }
              </FormItem>
            </Col>
          </Row>
          <Row style={!this.state.expand ? {display: 'none'} : {}}>
            <Col span={8}>
              <FormItem label="所属公司" {...layoutProps}>
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
            <Col span={8}>
              <FormItem label="所属BU" {...layoutProps}>
                {
                  getFieldDecorator('sbuId', {initialValue: ''})(
                    <Select>
                      <Option value="">--请选择--</Option>
                      {sbuList.map((i,k) => {
                        return <Option key={k} value={i.flexValue}>{i.description}</Option>
                      })}
                    </Select>
                  )
                }
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem label="所属CC" {...layoutProps}>
                {
                  getFieldDecorator('ccId', {initialValue: ''})(<Select
                    mode="combobox"
                    placeholder={'请输入costCenterId'}
                    defaultActiveFirstOption={false}
                    showArrow={false}
                    filterOption={false}
                    onChange={this.handleCcChange}
                    >
                      {
                        this.state.ccData.map(d =>
                          <Option key={d.value}>
                            {d.text}
                          </Option>)
                      }
                    </Select>)
                }
              </FormItem>
            </Col>
          </Row>
          <Row style={!this.state.expand ? {display: 'none'} : {}}>
            <Col span={8}>
              <FormItem label="所属地区" {...layoutProps}>
                {
                  getFieldDecorator('regionId', {initialValue: ''})(
                    <Select>
                      <Option value="">--请选择--</Option>
                      {regionList.map((i,k) => {
                        return <Option key={k} value={i.flexValue}>{i.description}</Option>
                      })}
                    </Select>
                  )
                }
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="资产种类" {...layoutProps}>
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
            <Col span={7}>
              <FormItem label="申请起止时间" {...layoutProps}>
                {
                  getFieldDecorator('startEnd')(<RangePicker style={{width: '100%'}} />)
                }
              </FormItem>
            </Col>
          </Row>
          <Row style={!this.state.expand ? {display: 'none'} : {}} >
            <Col span={8}>
              <FormItem label="资产描述" {...layoutProps}>
                {
                  getFieldDecorator('assetDesc')(<Input/>)
                }
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={23} style={{textAlign: 'right'}}>
              <Button type="primary" htmlType="submit">查询</Button>&emsp;&emsp;
              <Button type="primary" size="default" onClick={this.handleReset}>清空</Button>
              <a style={{ marginLeft: 8, fontSize: 12 }} onClick={(e) => { this.setState({expand: !this.state.expand}) }}>
                {this.state.expand ? '收起' : '展开'}<Icon type={this.state.expand ? 'up' : 'down'} />
              </a>
            </Col>
          </Row>
        </Form>
      </Card>
      <Card className="m-card" bordered={false}  noHovering>
        <h1>
          查询结果&emsp;
          <Button type="primary" onClick={this.batchOk}>批量审核</Button>
          &emsp;
          <Button type="primary" onClick={this.batchTaskForward}>批量任务转发</Button>
        </h1>
        <Table
          columns={columns}
          dataSource={tableArr}
          rowKey={record => record.voucherNo}
          loading={this.state.loading}
          pagination={{
            showSizeChanger: true,
            onShowSizeChange: this.changePage,
            showTotal: t=>`共${t}条`,
            showQuickJumper: true,
            total: this.state.count,
            pageSize: this.state.pageSize,
            current: this.state.pageNo,
            onChange: this.changePage
          }}
          scroll={{x: 1330}}
        />
      </Card>
      <Modal
        visible={this.state.visible}
        title="员工查询"
        width="1000px"
        footer={null}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <StaffFinder
          dispatch={this.props.dispatch}
          multiple={false}
          bgCode={sessionStorage.getItem('bgCode')}
          keywords={this.state.keywords}
          selectStaff={this.selectStaff}
          translate={true}
          companyData={companyList}
          regionData={regionList}
          buData={sbuList}
          ccData={this.props.dictionary.ccList ? this.props.dictionary.ccList : []}
        />
      </Modal>
      {
        this.state.taskForward ?
          <Modal
            width='660px'
            visible={this.state.taskForward}
            title="业务审批转发"
            footer={null}
            onCancel={this.handleForward}
          >
            <Forward
              dictionary={dictionary}
              dispatch={this.props.dispatch}
              onCancel={this.handleForward}
              forwardId={this.state.forwardId}
              checkLists={this.state.checkLists}
              taskDelivery={taskDelivery}
              doSearch={this.doSearch}
            />
          </Modal> : null
      }
      <Modal
        width='660px'
        visible={this.state.batchApprove}
        title="批量审批"
        footer={null}
        onCancel={this.hideBatch}
      >
        <BatchApp
          onCancel={this.hideBatch}
          doSearch={this.doSearch}
          approveBatch={this.props.approveBatch}
          checkLists={this.state.checkLists}
        />
      </Modal>
    </div>)
  }
}

export default Form.create()(Search)

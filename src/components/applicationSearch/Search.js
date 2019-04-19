import React from 'react'
import './Search.less'
import debounce from 'lodash/debounce'
import {Form, Input, Row, Col, Select, DatePicker, Button, Table, Icon, Modal, Card, Tooltip} from 'antd';
import message from '../common/Notice/notification'
import StaffFinder from '../common/staffFinder/staffFinder'
import ChangeApp from './ChangeApp'
import { saveAs } from '../../util/FileSaver'
const { TextArea } = Input;
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
          showEmployee: false,
          showUrge: false,
          isAccounting: false, // 核算会计
          showCancel: false,
          isSystemManager: false,
          pageNo: 0,
          pageSize: 0,
          pageCount: 0,
          count: 0,
          expend: false, // 展开 收起
          changeApp: false, // 更改当前审批人
          loading: false
      }
    const titles = ['流水号','申请人','员工编号','代理人','申请时间','资产种类','资产编号','所属公司','所属BU','所属CC','所属地区','申请单类型','当前状态','当前审批人'];
    const keys = ['voucherNo', 'applyName', 'applyStaffCode', 'createName', 'applyTime', 'assetCategoryName', 'serialNumber', 'ownerCompany', 'ownerSbu', 'costCenter', 'ownerRegion', 'voucherTypeName', 'voucherStatusName', 'taskApproveName'];
    const widths = [180, 80, 70, 80, 140, 80, 100, 90, 100]
    const columns = titles.map((o, i)=>{
      let key = keys[i];
      let column = {
        title: o,
        className:'tHeader',
        dataIndex: key,
        key: key,
        width: widths[i] ? widths[i] : null,
      };
      if(key === 'voucherNo'){
        column.render = (text, record, index)=><span className="link" onClick={()=>this.GoToDetail(record.voucherId, record.voucherType)}>{text}</span>
      }
      if(key === 'taskApproveName' || key === 'voucherStatusName' || key === 'voucherTypeName'){
        column.fixed = 'right'
      }
      if(key === 'serialNumber'){
        column.render = (text, record, index)=>{
            let node = []
            if(record.assetIds && record.assetIds.length > 0 ) {
                record.assetIds.map((i, k) => {
                    node.push(<p key={k}>{i}</p>)
                })
            }
            return <div>{node}</div>
        }
      }
      if(o === '申请时间'){
        column.sorter = (a, b)=>{
          if(a[key] > b[key]){
            return 1;
          }else if(a[key] === b[key]){
            return 0;
          }else{
            return -1;
          }
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
          <Tooltip overlayClassName="ant-tooltip-icon" title="详情">
            <a onClick={()=>{this.GoToDetail(record.voucherId, record.voucherType)}}>
              <Icon type="eye-o"/>
            </a>
          </Tooltip>
        {
          record.canCancel === 'yes' ?
            <Tooltip overlayClassName="ant-tooltip-icon" title="取消">
              <a onClick={()=>this.cancel(record.voucherId)}>
                <Icon type="rollback"/>
              </a>
            </Tooltip> : null
        }
        {
          record.editable === 'yes' ?
            <Tooltip overlayClassName="ant-tooltip-icon" title="修改">
              <a onClick={()=>this.GoToEdit(record.voucherId, record.voucherType)}>
                <Icon type="edit"/>
              </a>
            </Tooltip> : null
        }
        {
          (this.state.showUrge || this.state.isAccounting) && record.voucherStatus === '02' ?
            <Tooltip overlayClassName="ant-tooltip-icon" title="催办">
              <a onClick={()=>this.urgeApplication(record.approveId)}>
                <Icon type="clock-circle-o"/>
              </a>
            </Tooltip> : null
        }
        {
          this.state.showUrge && record.voucherStatus === '02' ?
            <Tooltip overlayClassName="ant-tooltip-icon" title="更改当前审批人">
              <a onClick={()=>this.changeApprove(record)}>
                <Icon type="swap"/>
              </a>
            </Tooltip> : null
        }
      </div>)
      },
    });
    this.columns = columns;
  }
  componentWillMount() {
    this.props.getApplyStatus()
    this.props.getVoucherTypeParam()
    this.props.getAssetCategoryParam()
    this.props.user.businessKeys.map(i => {
      if (i === 'VOUCHER') {
        this.setState({ showEmployee: true })
      }
    })
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.user && this.props.user.roleInfos) {
      if(!this.state.showUrge) {
        // 系统管理员
        this.props.user.roleInfos.map((i)=> {
          if(i.userRole === 'SYSTEM_MANAGER'){
            this.setState({showUrge: true, isSystemManager: true})
          }
        })
      }
      if(!this.state.isAccounting) {
        // 核算会计
        this.props.user.roleInfos.map((i)=> {
          if(i.userRole === 'FINANCIAL_ACCOUNT'){
            this.setState({isAccounting: true})
          }
        })
      }
    }
    if (this.props.pageInfo !== nextProps.pageInfo) {
      // 设置搜索pageinfo
      this.setState({
        pageNo: nextProps.pageInfo.pageNo,
        count: nextProps.pageInfo.count,
        pageCount: nextProps.pageInfo.pageCount,
        pageSize: nextProps.pageInfo.pageSize,
      })
    }
  }
  componentDidMount() {
    const location = window.location.search;
    const { user, form } = this.props
    // form.setFieldsValue({ accountName: user.accountName, personId: user.personId })
    this.doSearch()
    if (location.slice(1).split('=').indexOf('voucherNo') > -1) {
      this.props.form.setFieldsValue({ voucherNo: window.location.search.slice(1).split('voucherNo=').slice(-1)[0] })
      if (this.state.showEmployee) {
        this.props.DoAdminSearch({
          pageNo: this.state.pageNo,
          pageSize: this.state.pageSize,
          voucherNo: window.location.search.slice(1).split('voucherNo=').slice(-1)[0],
        })
      }
      else {
        this.props.DoSearch({
          pageNo: this.state.pageNo,
          pageSize: this.state.pageSize,
          voucherNo: window.location.search.slice(1).split('voucherNo=').slice(-1)[0],
        })
      }
    } else if (location.slice(1) === 'more') {
      this.props.form.setFieldsValue({ accountName: this.props.user.accountName })
      if (this.state.showEmployee) {
        this.props.DoAdminSearch({
          pageNo: this.state.pageNo,
          pageSize: this.state.pageSize,
          personId: this.props.user.accountId,
        })
      }
      else {
        this.props.DoSearch({
          pageNo: this.state.pageNo,
          pageSize: this.state.pageSize,
          personId: this.props.user.accountId,
        })
      }
    }
  }
  cancel = (voucherId) => {
    this.setState({voucherId: voucherId, showCancel: true})
  }
  changeApprove = (nowApprover) => {
    // 更改当前审批人
    this.setState({ changeApp: true, nowApprover })
  }
  closeChange = () => {
    this.setState({ changeApp: false, nowApprover: {} })
  }
  urgeApplication = (approveId) => {
    // 催办
    this.props.urgeApplication(approveId).then((result) => {
      if(result.response.resultCode != '000000') {
        message.error(result.response.resultMessage)
      } else {
        message.success('催办成功')
      }
    })
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
  GoToEdit = (voucherId, voucherType)=> {
    // 编辑
    if(voucherType === '10') {
      this.props.history.push(`/apply/transfer/${voucherId}`)
    }
    if(voucherType === '20') {
      this.props.history.push(`/apply/invalidate/${voucherId}`)
    }
    if(voucherType === '30') {
      this.props.history.push(`/apply/compensate/${voucherId}`)
    }
  }
  doSearch = (e)=>{
    if (e) { e.preventDefault(); }
    this.props.form.validateFields((err, values) => {
      let beginDate,endDate,assetCategory,ccId,companyId,personId,regionId,
        sbuId,voucherStatus,voucherType, serialNumber, voucherNo, auditFrom, auditTo
      if(values.startEnd && values.startEnd.length > 0) {
        beginDate = values.startEnd[0].format("YYYYMMDD");
        endDate = values.startEnd[1].format("YYYYMMDD");
      }
      if(values.approveTime && values.approveTime.length > 0) {
        auditFrom = values.approveTime[0].format("YYYYMMDD");
        auditTo = values.approveTime[1].format("YYYYMMDD");
      }
      if(values.serialNumber){
        serialNumber = values.serialNumber
      }
      if(values.voucherNo != ''){
        voucherNo = values.voucherNo
      }
      if(values.assetCategory != ''){
        assetCategory = values.assetCategory
      }
      if(values.ccId != ''){
        ccId = values.ccId
      }
      if(values.companyId != ''){
        companyId = values.companyId
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
      if(this.state.showEmployee) {
        this.setState({ loading: true })
        this.props.DoAdminSearch({
          pageNo: 1,
          pageSize: 10,
          beginDate,
          endDate,
          assetCategory,
          ccId,
          companyId,
          personId,
          regionId,
          sbuId,
          voucherStatus,
          voucherType,
          serialNumber,
          voucherNo,
          auditFrom,
          auditTo
        }).then(res => {
          this.setState({ loading: false })
          if(res && res.response && res.response.resultCode !== '000000') {
            message.error(res.response.resultMessage)
          }
        })
      } else {
        this.setState({ loading: true })
        this.props.DoSearch({
          pageNo: 1,
          pageSize: 10,
          beginDate,
          endDate,
          assetCategory,
          ccId,
          companyId,
          regionId,
          sbuId,
          voucherStatus,
          voucherType,
          serialNumber,
          voucherNo,
          auditFrom,
          auditTo
        }).then(res => {
          this.setState({ loading: false })
          if(res && res.response && res.response.resultCode !== '000000') {
            message.error(res.response.resultMessage)
          }
        })
      }

    });
  }
  doExport = ()=>{
    this.props.form.validateFields((err, values) => {
      let serialNumber, voucherNo, assetCategory, voucherType, voucherStatus,
        sbuId, companyId, ccId, regionId, beginDate, endDate, auditFrom, auditTo;
      if (values.startEnd && values.startEnd.length !== 0) {
        beginDate = values.startEnd[0].format('YYYYMMDD')
        endDate = values.startEnd[1].format('YYYYMMDD')
      }
      if(values.approveTime && values.approveTime.length > 0) {
        auditFrom = values.approveTime[0].format("YYYYMMDD");
        auditTo = values.approveTime[1].format("YYYYMMDD");
      }
      if (values.voucherNo) {
        voucherNo = values.voucherNo
      }
      if (values.assetCategory) {
        assetCategory = values.assetCategory
      }
      if (values.voucherType) {
        voucherType = values.voucherType
      }
      if (values.status) {
        voucherStatus = values.status
      }
      if (values.sbuId) {
        sbuId = values.sbuId
      }
      if (values.companyId) {
        companyId = values.companyId
      }if (values.ccId) {
        ccId = values.ccId
      }
      if (values.regionId) {
        regionId = values.regionId
      }
      if(values.serialNumber != ''){
        serialNumber = values.serialNumber
      }
      const params = {
        serialNumber, voucherNo, assetCategory, voucherType, voucherStatus,
        sbuId, companyId, ccId, regionId, beginDate, endDate, auditFrom, auditTo
      }
      if(this.state.showEmployee) {
        // 系统管理员导出
        this.props.exportMangerExcel(params).then(result => {
          if(result && result.response && !result.response.resultCode) {
            saveAs(result.response, `申请单${Date.parse(new Date())}.xls`);
          } else if (result.response.resultCode === '666666'){
            message.warning(result.response.resultMessage);
          } else{
            message.error('导出申请单失败!');
          }
        })
      } else {
        this.props.exportExcel(params).then(result => {
          if(result && result.response && !result.response.resultCode) {
            saveAs(result.response, `申请单${Date.parse(new Date())}.xls`);
          } else if (result.response.resultCode === '666666'){
            message.warning(result.response.resultMessage);
          } else{
            message.error('导出申请单失败!');
          }
        })
      }
    });
  }
  handleOk = () => {
      this.setState({ visible: false });
  }
  handleCancel = () => {
      this.setState({ visible: false });
  }
  handleConfirmCancel =()=> {
      if(!this.state.reason || this.state.reason === '') {
        message.warning('请填写取消原因');
        return false
      }
      this.props.cancelApplication(this.state.voucherId, this.state.reason).then((result)=> {
        if(result.response.resultCode === '000000') {
          message.success('撤销成功')
          this.doSearch()
          this.setState({showCancel: false, reason: ''})
        }
        else {
          message.error(result.response.resultMessage)
          return
        }
      })
  }
  selectStaff = (staff)=> {
    const { personId, lastName } = staff[0]
    this.props.form.setFieldsValue({personId:personId , accountName:lastName})
    this.handleCancel()
  }
  PageSizeChange = (current, size)=> {
      this.setState({pageSize: size})
  }
  changePage = (current, size) => {
    // 翻页
    this.props.form.validateFields((err, values) => {
      let beginDate,endDate,assetCategory,ccId,companyId,personId,regionId,
        sbuId,voucherType, serialNumber, voucherStatus, auditFrom, auditTo
      if(values.startEnd && values.startEnd.length > 0) {
        beginDate = values.startEnd[0].format("YYYYMMDD");
        endDate = values.startEnd[1].format("YYYYMMDD");
      }
      if(values.approveTime && values.approveTime.length > 0) {
        auditFrom = values.approveTime[0].format("YYYYMMDD");
        auditTo = values.approveTime[1].format("YYYYMMDD");
      }
      if(values.assetCategory != ''){
        assetCategory = values.assetCategory
      }
      if(values.ccId != ''){
        ccId = values.ccId
      }
      if(values.companyId != ''){
        companyId = values.companyId
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
      if(values.serialNumber != ''){
        serialNumber = values.serialNumber
      }
      if(this.state.showEmployee) {
        this.props.DoAdminSearch({pageNo: current, pageSize: size,serialNumber,beginDate,endDate,assetCategory,ccId,companyId,personId,regionId,sbuId,voucherStatus,voucherType,auditFrom,auditTo})
      }
      else {
        this.props.DoSearch({pageNo: current, pageSize: size,serialNumber,beginDate,endDate,assetCategory,ccId,companyId,regionId,sbuId,voucherStatus,voucherType,auditFrom,auditTo})
      }

    });
  }
  closeCancel = () => {
    // 关闭撤销框
    this.setState({showCancel: false, reason: ''})
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

  render(){
    const { getFieldDecorator } = this.props.form;
    const columns = this.columns;
    let tableResult = [];
      this.props.pageInfo.result.map((i,k)=>{
          tableResult.push({
              key: k,
              NO: k + 1,
              costCenter: i.ownerCCId,
              ...i
          })
      })
    const layoutProps = {
      labelCol: {
        span: 7
      },
      wrapperCol: {
        span: 17
      }
    }
    const {companyList, regionList, sbuList, applyStatus, voucherType, assetCategory} = this.props.dictionary
    return (<div className="applicationSearch">
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
                      <Input size='large' suffix={<Icon type="search"/>} />
                  )}
                </div>
              </FormItem>
                  {/*<FormItem {...layoutProps} label="员工姓名：">*/}
                    {/*<div className={`u-select-user-input disabled`}>*/}
                      {/*{getFieldDecorator('accountName')(*/}
                          {/*<Input disabled suffix={<Icon type="search"/>} />*/}
                      {/*)}*/}
                    {/*</div>*/}
                  {/*</FormItem>*/}
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
              <FormItem label="申请时间" {...layoutProps}>
                {
                  getFieldDecorator('startEnd')(<RangePicker style={{width: '100%'}} />)
                }
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem label="财务审核时间" {...layoutProps}>
                {
                  getFieldDecorator('approveTime')(<RangePicker style={{width: '100%'}} />)
                }
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={23} style={{textAlign: 'right', margin: '5px 0'}}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button type="primary" onClick={this.doExport}>导出</Button>
              <Button type="primary" onClick={() => { this.props.form.resetFields() }}>清空</Button>
              <a style={{ marginLeft: 8, fontSize: 12 }} onClick={() => { this.setState({expand: !this.state.expand}) }}>
                {this.state.expand ? '收起' : '展开'}<Icon type={this.state.expand ? 'up' : 'down'} />
              </a>
            </Col>
          </Row>
        </Form>
      </Card>
      <Card className="m-card" bordered={false} noHovering>
        <h1>查询结果</h1>
        <Table
          columns={columns}
          dataSource={tableResult}
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
          scroll={{ x: 1390 }}
        />
      </Card>
      <Modal
          visible={this.state.visible}
          title="员工查询"
          width="1000px"
          footer={null}
          onOk={this.handleOk}
          onCancel={this.handleCancel}>
          <StaffFinder dispatch={this.props.dispatch}
                       multiple={false}
                       bgCode={this.props.user.companyId.substr(0,1)}
                       keywords={this.state.keywords}
                       selectStaff={this.selectStaff}
                       companyData={this.props.dictionary.companyList}
                       regionData={this.props.dictionary.regionList}
                       buData={this.props.dictionary.sbuList}
                       ccData={this.props.dictionary.ccList ? this.props.dictionary.ccList : []}
          />
      </Modal>
      <Modal
          visible={this.state.showCancel}
          title="请填写取消原因"
          width="800px"
          footer={[
              <Button key="commit" type="primary" htmlType="submit" style={{marginBottom: '0'}} onClick={this.handleConfirmCancel}>确定</Button>,
              <Button key="cancel" style={{marginBottom: '0'}} onClick={this.closeCancel}>取消</Button>
          ]}
          onCancel={this.closeCancel}
      >
          <Row>
              <Col span={20}>
                  <FormItem {...layoutProps} label="取消原因">
                      <TextArea value={this.state.reason} row={8} onChange={(e) => {
                        this.setState({reason: e.target.value})
                      }}/>
                  </FormItem>
              </Col>
          </Row>
      </Modal>
      {
        this.state.changeApp ?
          <Modal
            visible={this.state.changeApp}
            title="更改当前审批人"
            width="520px"
            onCancel={this.closeChange}
            footer={null}
          >
            <ChangeApp
              info={this.state.nowApprover}
              dispatch={this.props.dispatch}
              multiple={false}
              bgCode={this.props.user.companyId.substr(0,1)}
              keywords={this.state.keywords}
              companyData={this.props.dictionary.companyList}
              regionData={this.props.dictionary.regionList}
              buData={this.props.dictionary.sbuList}
              ccData={this.props.dictionary.ccList ? this.props.dictionary.ccList : []}
              onCancel={this.closeChange}
              changeApprover={this.props.changeApprover}
              batchChangeApprover={this.props.batchChangeApprover}
              doSearch={this.doSearch}
            />
          </Modal> : null
      }
    </div>)
  }
}

export default Form.create()(Search)

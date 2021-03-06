import React from 'react'
import { Form, Button, Row, Col, Input, Select, Table, Pagination, Modal, Icon, Card, Spin } from 'antd';
import StaffFinder from '../../common/staffFinder/staffFinder'
import InputNewDesc from './inputNewDesc'
import ModifyLogs from '../../../containers/common/modifyLogs'
import message from '../../common/Notice/notification'
import debounce from 'lodash/debounce'
import { saveAs } from '../../../util/FileSaver';

const { Option, OptGroup } = Select;
const FormItem = Form.Item;

class Manager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      exportStaus: false, // 导出loading
      data: [],
      visible: false, // 作用于查找人弹窗
      value: [],
      loading: false, // 变更描述确认
      assetIds: [], // 变更描述 批量选中行assetIds
      selectedRowKeys: [], // 变更描述 批量选中行
      batchStatus: false, // 变更描述 批量默认不可操作
      spin: false, // 表格table查询loading
      curPageNo: 1,
      curPageSize: 10,
    };
  }

  componentWillMount() {
    if (this.props.managerListData.length){
      this.props.clearManagerAssetsTable();
    } 
  }

  // 勾选员工信息

  handleOk = () => {
      this.setState({ visible: false });
  }

  handleCancel = () => {
      this.setState({ visible: false });
  }

  selectStaff = (staff)=> {
    const { personId, employeeNumber, lastName } = staff[0]
    this.props.form.setFieldsValue({ personId, accountName: `${lastName} / ${employeeNumber}`})
    this.handleCancel()
  }

  resetBtn = () => {
    this.props.form.resetFields()
    this.setState({
      loading: false, // 变更描述确认
      assetIds: [], // 变更描述 批量选中行assetIds
      selectedRowKeys: [], // 变更描述 批量选中行
      batchStatus: false, // 变更描述 批量默认不可操作
      spin: false, // 表格table查询loading
    });
  }

  // 所属CC 模糊查询
  handleCcChange = debounce((value) => {
    if (value.trim() === '') {
      return;
    }
    // this.setState({ value });
    const { bgId } = this.props.user
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
        this.setState({ data })
      }
    })
    fetch(value, data => this.setState({ data }));
  }, 200)

  getFormValues = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // console.log('Receive values of form: ', values)
      }

      // 对于空的或undefined值，过滤
      const newValues = Object.keys(values).reduce((x, y) => {
        if (y !== 'accountName' && values[y]) {
          x[y] = values[y]
        }
        return x
      }, {})
      this.formValues = newValues
    })
  }

  // 财产转移查询
  handleSearch = (e='', curPageNo='', curPageSize='') => {
    if (e) {
      e.preventDefault();
    }
    if(curPageNo && curPageSize) {
      this.setState({spin: true, curPageNo, curPageSize})
    } else {
      this.setState({ spin: true })
    }
    this.getFormValues();
    this.props.getManagerSearch({
      pageNo: curPageNo || this.state.curPageNo,
      pageSize: curPageSize || this.state.curPageSize,
      ...this.formValues
    }).then(result => {
      this.setState({ spin: false })
      if (result.response.resultCode !== '000000') {
      message.error(result.response.resultMessage)
    }})
  }
  
  // 变更描述选中行
  onSelectChange = (selectedRowKeys, selectedRows) => {
    // console.log('selectedRowKeys changed: ', selectedRowKeys, selectedRows);
    let selectedAssetIds = selectedRows.reduce((sum, cur) => {
      return sum.concat(cur.assetId)
    }, [])
    // console.log('selectedAssetIds', selectedAssetIds)
    this.setState({ selectedRowKeys, assetIds: selectedAssetIds });
  }

  hideModifyModal = () => {
    this.setState({
      assetIds: [],
      selectedRowKeys: [],
      batchStatus: false,
    })
  }
	
	// 批量变更确认
	batchApprove = () => {
    // 显示modal
		this.setState({ batchStatus: true });
  }
  
  // 导出
  doExport = () => {
    this.setState({ exportStaus: true })
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // console.log('Receive values of form: ', values)
      }
      // console.log('values', values)

      // 对于空的或undefined值，过滤
      const newValues = Object.keys(values).reduce((x, y) => {
        if (y !== 'accountName' && values[y]) {
          x[y] = values[y]
        }
        return x
      }, {})
      this.props.exportManagerAsset(newValues).then(result => {
        this.setState({ exportStaus: false })
        if (result && result.response.resultMessage) {
          message.error(result.response.resultMessage)
        } else {
          saveAs(result.response, `资产明细表_${this.props.user.accountName}_${Date.parse(new Date())}.xls`)
        }
      })
    })
  }

  pageSizeChange = (size) => {
    this.setState({ curPageNo: 1, curPageSize: size, spin: true, })
    this.getFormValues();
    this.props.getManagerSearch({
      pageNo: this.state.curPageNo,
      pageSize: size,
      ...this.formValues
    }).then(result => {
      this.setState({ spin: false })
      if (result.response.resultCode !== '000000') {
        message.error(result.response.resultMessage)
      }
    })
  }

  pageNoChange = (page) => {
    // console.log('page', page)
    this.setState({ curPageNo: page, spin: true });
    this.getFormValues();
    this.props.getManagerSearch({
      pageNo: page,
      pageSize: this.state.curPageSize,
      ...this.formValues
    }).then(result => {
      this.setState({ spin: false })
      if (result.response.resultCode !== '000000') {
        message.error(result.response.resultMessage)
      }
    })
  }

  render() {
		const { columns, user, managerListData=[], managerListPageInfo } = this.props
    const { getFieldDecorator } = this.props.form;
    // console.log('用户角色', user.roleInfos[0].infos, user.roleInfos[0].userRole, managerListPageInfo)
    let total; // 总共条数
    if (Object.keys(managerListPageInfo).length) {
      total = managerListPageInfo.count
    }
    const { dictionary } = this.props; // 通过接口获得的公司
    const { companyList, sbuList, regionList, assetKey, assetsType, adminAssetsType } = dictionary
    const layoutProps = {
      labelCol: {
        span: 7
      },
      wrapperCol: {
        span: 17
      }
		}
		const { batchStatus, selectedRowKeys } = this.state
		const options = this.state.data.map(d => <Option key={d.value}>{d.text}</Option>);
    // rowSelection objects indicates the need for row selection
    // 只有当前登录用户角色是roleInfos.userRole === SUPER_ASSET_MANAGER, 才允许修改
    // console.log('user', this.props.user)
    const rowSelection = user.roleInfos.some(x => (x.userRole === 'SUPER_ASSET_MANAGER'))  ? {
      selectedRowKeys,
      onChange: this.onSelectChange,
    } : null

		const hasSelected = selectedRowKeys.length > 0

    return <div className='assetInquiry'>
    <Spin spinning={this.state.exportStaus}>
      <Card className="m-card condition" title="查询条件" bordered={false} noHovering>
        <Form onSubmit={(e) => this.handleSearch(e, 1, 10)}>
          <Row>
            <Col span={8}>
              <FormItem style={{display: 'none'}} {...layoutProps} label="员工信息：">
                  {getFieldDecorator('personId')(
                      <Input style={{display: 'none'}} disabled />
                  )}
              </FormItem>
              <FormItem {...layoutProps} label="员工信息：">
                <div className="u-select-user-input" onClick={()=>{this.setState({visible: true})}}>
                    {getFieldDecorator('accountName')(
                        <Input disabled suffix={<Icon type="search"/>} />
                    )}
                </div>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="资产类别" {...layoutProps}>
                {
                  getFieldDecorator('assetType', {initialValue: []})(
                    <Select
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      mode="multiple"
                    >
                      <OptGroup label='IT资产类'>
                        {assetsType.map((item) => (<Option key={item.paramValue} value={item.paramValue}>{item.paramValueDesc}</Option>))}
                      </OptGroup>
                      <OptGroup label='行政资产类'>
                        {adminAssetsType.map((item) => (<Option key={item.paramValue} value={item.paramValue}>{item.paramValueDesc}</Option>))}
                      </OptGroup>
                    </Select>)
                }
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem label="资产关键字" {...layoutProps}>
                {
                  getFieldDecorator('assetKey', {initialValue: ''})(
                    <Select>
                      <Option value="">--请选择--</Option>
                      {assetKey.map((item) => (<Option key={item.paramValue} value={item.paramValue}>{item.paramValueDesc}</Option>))}
                    </Select>
                  )
                }
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem label="资产编号" {...layoutProps}>
                {
                  getFieldDecorator('serialNumber')(<Input/>)
                }
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="资产描述" {...layoutProps}>
                {
                  getFieldDecorator('description')(<Input/>)
                }
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem label="所属公司" {...layoutProps}>
                {
                  getFieldDecorator('companyId', {initialValue: ''})(
                    <Select>
                      <Option value="">--请选择--</Option>
                      {companyList.map((item)=>(<Option key={item.flexValue} value={item.flexValue}>{item.description}</Option>))}
                    </Select>
                  )
                }
              </FormItem>
            </Col>
          </Row>
          <Row>
          <Col span={8}>
            <FormItem label="所属BU" {...layoutProps}>
              {/* BU管理员不可编辑，只能查询其所在bu */}
              {
                getFieldDecorator('sbuId', {initialValue: ''})(
                  <Select>
                    <Option value="">--请选择--</Option>
                    {sbuList.map((item)=>(<Option key={item.flexValue} value={item.flexValue}>{item.description}</Option>))}
                  </Select>
                )
              }
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="所属CC" {...layoutProps}>
              {
                getFieldDecorator('ccId')(
                  <Select
                    mode="combobox"
                    placeholder={'ccId'}
                    defaultActiveFirstOption={false}
                    showArrow={false}
                    filterOption={false}
                    onChange={this.handleCcChange}
                    value={this.state.data}
                  >
                    {options}
                  </Select>)
              }
            </FormItem>
          </Col>
          <Col span={7}>
            <FormItem label="所属地区" {...layoutProps}>
              {
                getFieldDecorator('regionId', {initialValue: ''})(
                  <Select>
                    <Option value="">--请选择--</Option>
                    {regionList.map((item)=>(<Option key={item.flexValue} value={item.flexValue}>{item.description}</Option>))}
                  </Select>
                )
              }
            </FormItem>
          </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem {...layoutProps} label="在职状态：">
                {
                  getFieldDecorator('postStatus', {initialValue: ''})(
                    <Select>
                      <Option value="">--请选择--</Option>
                      <Option value="在职">在职</Option>
                      <Option value="离职">离职</Option>
                    </Select>
                  )
                }
              </FormItem>
            </Col>
            <Col className="taRight" span={15}>
              <Button type='primary' htmlType="submit">查询</Button>
              <Button type='primary' onClick={this.resetBtn}>清空</Button>
              <Button type='primary' onClick={this.doExport}>导出</Button>
            </Col>
          </Row>
        </Form>
      </Card>
      <div className='result'>
          <h3>查询结果&emsp;
          {user.roleInfos.some(x => (x.userRole === 'SUPER_ASSET_MANAGER')) ? (<Button
          type="primary"
          disabled={!hasSelected}
          onClick={this.batchApprove}
        >
          资产描述变更
        </Button>): ''}</h3>
        <Table
          rowKey={row => row.assetId}
          rowSelection={rowSelection}
          columns={columns}
          dataSource={managerListData}
          pagination={false}
          scroll={{ x: 1622 }}
          loading={this.state.spin}
        />
        <Modal
          title={'资产描述变更'}
          width="500px"
          visible={batchStatus}
          onCancel={this.hideModifyModal}
          footer={null}      
        >
          <InputNewDesc
            onCancel={this.hideModifyModal}
            updateAssetDesc={this.props.updateAssetDesc}
            selectedRows={this.state.assetIds}
            handleSearch={this.handleSearch}
          />
        </Modal>
        <Modal
            visible={this.state.visible}
            title="员工查询"
            width="1000px"
            footer={null}
            onOk={this.handleOk}
            onCancel={this.handleCancel}>
            <StaffFinder
              dispatch={this.props.dispatch}
              multiple={false}
              keywords={this.state.keywords}
              bgCode={this.props.user.companyId.substr(0, 1)}
              selectStaff={this.selectStaff}
              companyData={this.props.dictionary.companyList}
              regionData={this.props.dictionary.regionList}
              buData={this.props.dictionary.sbuList}
              ccData={this.props.dictionary.ccList ? this.props.dictionary.ccList : []}
            />
        </Modal>
        <Modal
          title={`资产编号：${this.props.serialNumber}`}
          width="1000px"
          footer={null}
          visible={this.props.visible}
          onOk={this.props.hideModal}
          onCancel={this.props.hideModal}
          wrapClassName='logModal'
        >
            <ModifyLogs />
        </Modal>
        <br/>
        <div style={{ paddingRight: '20px', textAlign: 'right' }}>
          <Pagination
            current={this.state.curPageNo}
            pageSize={this.state.curPageSize}
            showSizeChanger
            onShowSizeChange={(current, size) => this.pageSizeChange(size)}
            showTotal={t=>`共${t}条`}
            total={total}
            onChange={(page) => this.pageNoChange(page)}
            showQuickJumper
            pageSizeOptions={['10', '20', '50', '100']}
            ></Pagination>
        </div>
        <br />
      </div>
    </Spin>
    </div>
  }
}
export default Form.create()(Manager)

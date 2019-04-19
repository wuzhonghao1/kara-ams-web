import React from 'react'
import { Form, Button, Row, Col, Input, Select, Table, Pagination, Modal, Icon, Card, Spin } from 'antd';
import StaffFinder from '../../common/staffFinder/staffFinder'
import debounce from 'lodash/debounce'
import ModifyLogs from '../../../containers/common/modifyLogs'
import { saveAs } from '../../../util/FileSaver'
import message from '../../common/Notice/notification'

const { Option, OptGroup } = Select;
const FormItem = Form.Item;

class CcManger extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      exportStatus: false, // 导出loading
      data: [],
      visible: false,
      value: [],
      curPageNo: 1,
      curPageSize: 10,
      loading: false,
    };
  }

  componentWillMount() {
    if (this.props.ccOwnerManageListData.length) {
      this.props.clearCCAssetsTable();
    }
  }

  // 勾选员工信息

  handleOk = () => {
      this.setState({ visible: false });
  }

  handleCancel = () => {
      this.setState({ visible: false });
  }

  selectStaff = (staff) => {
    const { personId, employeeNumber, lastName } = staff[0]
    this.props.form.setFieldsValue({ personId, accountName: `${lastName} / ${employeeNumber}` })
    this.handleCancel()
  }

  resetBtn = () => {
    this.props.form.resetFields()
    this.setState({
      loading: false,
      visible: false,
      value: [],
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

  // 获取表单值
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
    if (curPageNo && curPageSize) {
      this.setState({ loading: true, curPageNo, curPageSize });
    } else {
      this.setState({ loading: true });
    }
    this.getFormValues();
    this.props.getCcOwnerManageSearch({
      pageNo: this.state.curPageNo,
      pageSize: this.state.curPageSize,
      ...this.formValues
    }).then(result => {
      this.setState({ loading: false })
      if (result && result.response && result.response.resultCode !== '000000') {
      message.error(result.response.resultMessage)
    }})
  }

  // 导出
  doExport = () => {
    this.setState({ exportStatus: true })
    this.getFormValues();
    this.props.exportCCOwnerAsset(this.formValues).then(result => {
      this.setState({ exportStatus: false })
      if (result && result.response.resultMessage) {
        message.error(result.response.resultMessage)
      } else {
        saveAs(result.response, `资产明细表_${this.props.user.accountName}_${Date.parse(new Date())}.xls`)
      }
    })
  }

  pageSizeChange = (size) => {
    this.setState({ curPageNo: 1, curPageSize: size, loading: true, })
    this.getFormValues()
    this.props.getCcOwnerManageSearch({
      pageNo: 1,
      pageSize: size,
      ...this.formValues,
    }).then(result => {
      this.setState({ loading: false })
      if (result.response.resultCode !== '000000') {
        message.error(result.response.resultMessage)
      }
    })
}

  pageNoChange = (page) => {
    // console.log('page', page)
    this.setState({ curPageNo: page, loading: true });
    this.getFormValues();
    this.props.getCcOwnerManageSearch({
      pageNo: page,
      pageSize: this.state.curPageSize,
      ...this.formValues
    }).then(result => {
      this.setState({loading: false})
      if (result.response.resultCode !== '000000') {
        throw new Error(result.response.resultMessage)
      }
    })
  }

  render() {
    const { columns, ccOwnerManageListData, ccOwnerManageListPageInfo } = this.props
    let total; // 总共条数
    if (Object.keys(ccOwnerManageListPageInfo).length) {
      total = ccOwnerManageListPageInfo.count
    }
    // console.table(ccOwnerManageListData)
    const { getFieldDecorator } = this.props.form;
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
    const options = this.state.data.map(d => <Option key={d.value}>{d.text}</Option>);

    return <div className='assetInquiry'>
    <Spin spinning={this.state.exportStatus}>
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
              getFieldDecorator('ccId0')(
                <Select
                  mode="combobox"
                  placeholder={'ccId'}
                  defaultActiveFirstOption={false}
                  showArrow={false}
                  filterOption={false}
                  onChange={this.handleCcChange}
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
      <h3>查询结果</h3>
      <Table
        rowKey={row => row.assetId}
        columns={columns}
        dataSource={ccOwnerManageListData}
        pagination={false}
        scroll={{ x: 1842, y: 300}}
        loading={this.state.loading}
      />
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
          bgCode={sessionStorage.getItem('bgCode')}
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
      <div style={{ paddingRight: '20px', textAlign: 'right'}}>
        <Pagination
          current={this.state.curPageNo}
          pageSize={this.state.curPageSize}
          showSizeChanger
          onShowSizeChange={(current, size) => this.pageSizeChange(size)}
          showTotal={t=>`共${t}条`}
          onChange={(page) => this.pageNoChange(page)}
          showQuickJumper
          total={total}
          pageSizeOptions={['10', '20', '50', '100']}
          ></Pagination>
      </div>
      <br />
    </div>
    </Spin>
    </div>
  }
}
export default Form.create()(CcManger)

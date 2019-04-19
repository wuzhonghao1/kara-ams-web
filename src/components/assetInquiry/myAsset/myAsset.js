import React from 'react'
import { Form, Button, Row, Col, Input, Select, Table, Pagination, Card, Spin } from 'antd';
import debounce from 'lodash/debounce'
import '../assetInquiry.less'
import message from '../../common/Notice/notification'
import { saveAs } from '../../../util/FileSaver';

const { Option, OptGroup } = Select;
const FormItem = Form.Item;

class MyAsset extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      exportStatus: false, // 导出loading
      data: [],
      visible: false,
      selectedRowKeys: [], // 批量审核选中行
      batchStatus: false, // 批量按钮默认不可操作
      value: [],
      curPageNo: 1,
      curPageSize: 10,
      loading: false,
    };
  }

  componentDidMount() {
    this.setState({exportStatus: true})
    this.props.getMyAssetSearch({
      pageNo: 1,
      pageSize: 10,
    }).then((result) => {
      this.setState({ exportStatus: false })
      if(result && result.response && result.response.resultCode !== '000000') {
        message.error(result.response.resultMessage)
      }
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
        if (y.slice(0, 5) !== 'audit' && y !== 'accountName' && y !== 'changeBatch' && values[y]) {
          x[y] = values[y]
        }
        return x
      }, {})
      this.formValues = newValues
    })
  }

  // 财产转移查询
  handleSearch = (e='', curPageNo='', curPageSize='') => {
    if(e) {
      e.preventDefault();
    }
    if (curPageNo && curPageSize) {
      this.setState({ loading: true, curPageNo, curPageSize });
    } else {
      this.setState({ loading: true });
    }
    this.getFormValues()
    this.props.getMyAssetSearch({
      pageNo: this.state.curPageNo,
      pageSize: this.state.curPageSize,
      ...this.formValues,
    }).then(result => {
      this.setState({ loading: false })
      if (result.response.resultCode !== '000000') {
      message.error(result.response.resultMessage)
    }})
  }

  // 清空
  resetBtn = () => {
    this.props.form.resetFields()
    this.setState({
      loading: false,
      visible: false,
      value: [],
      selectedRowKeys: [], // 批量审核选中行
      batchStatus: false, // 批量按钮默认不可操作
    });
  }

  // 导出
  doExport = () => {
    this.setState({exportStatus: true})
    this.getFormValues()
    this.props.exportMyAsset(this.formValues).then(result => {
      this.setState({ exportStatus: false })
      if (result && result.response.resultMessage) {
        message.error(result.response.resultMessage)
      } else {
        saveAs(result.response, `资产明细表_${this.props.user.accountName}_${Date.parse(new Date())}.xls`)
      }
    })
  }

  pageSizeChange = (size) => {
    this.setState({ curPageNo: 1, curPageSize: size, loading: true })
    this.getFormValues()
    this.props.getMyAssetSearch({
      pageNo: this.state.curPageNo,
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
    this.getFormValues()
    this.props.getMyAssetSearch({
      pageNo: page,
      pageSize: this.state.curPageSize,
      ...this.formValues
    }).then(result => {
      this.setState({ loading: false })
      if (result.response.resultCode !== '000000') {
        message.error(result.response.resultMessage)
      }
    })
  }

  render() {
    const { columns, myAssetsListPageInfo } = this.props
    let myAssetListData = []
    if (myAssetsListPageInfo.result) {
      myAssetListData = myAssetsListPageInfo.result
    }
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
            <FormItem label="资产编号" {...layoutProps}>
              {
                getFieldDecorator('serialNumber')(<Input/>)
              }
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
						<FormItem label="资产描述" {...layoutProps}>
							{
								getFieldDecorator('description')(<Input/>)
							}
						</FormItem>
					</Col>
          <Col span={8}>
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
					<Col span={7}>
						<FormItem label="所属CC" {...layoutProps}>
							{
								getFieldDecorator('ccId')(
									<Select
										mode="combobox"
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
          <Col className="taRight" span={7} style={{marginTop: '3px'}} >
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
        loading={this.state.loading}
        rowKey={row => row.assetId}
        columns={columns}
        dataSource={myAssetListData}
        pagination={false}
      />
      <br/>
      <div style={{ paddingRight: '20px', textAlign: 'right' }}>
        <Pagination
          current={this.state.curPageNo}
          pageSize={this.state.curPageSize}
          showSizeChanger
          onShowSizeChange={(current, size) => this.pageSizeChange(size)}
          showTotal={t=>`共${t}条`}
          total={myAssetsListPageInfo.count}
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
export default Form.create()(MyAsset)

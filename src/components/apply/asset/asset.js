import React from 'react'
import { Form, Button, Row, Col, Input, Select, Table, Pagination, Card } from 'antd'
import debounce from 'lodash/debounce'
import {getOrgCostCenterInfo} from '../../../actions/dictionary/dictionary'
import './asset.less'
import message from '../../common/Notice/notification'
const { Option, OptGroup } = Select;
const FormItem = Form.Item;

class Component extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      ccData: [],
      cc: '',
      selectedRowKeys: [],
      loading: false,
      pageNo: 1,
      pageSize: 10,
      total: 0,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.assetInfo !== nextProps.assetInfo) {
      const pageInfo = nextProps.assetInfo
      this.setState({ pageNo: pageInfo.pageNo, pageSize: pageInfo.pageSize, total: pageInfo.count })
    }
  }

  getTableData = (data) => {
    return data.map((v,i)=>{
      return {
        key: i+1,
        ...v,
        costCenter: v.assignedCcId,
      }
    })
  }

  getColumns = () => {
   return [
     {
       title: '序号',
       dataIndex: 'key',
       width: 60,
     },
     {
       title: '资产编号',
       dataIndex: 'serialNumber',
       width: 100,
     },
     {
       title: '资产描述',
       dataIndex: 'description',
       width: 460,
     },
     {
       title: '所属公司',
       dataIndex: 'assignedCompanyName',
       width: 100,
     },
     {
       title: '所属BU',
       dataIndex: 'assignedSbuName',
       width: 110,
     },
     {
       title: '所属CC',
       dataIndex: 'costCenter',
       width: 80,
     },
     {
       title: '所属地区',
       dataIndex: 'assignedRegionName',
       width: 80,
     },
     {
       title: '启用时间',
       dataIndex: 'serviceDate',
       render: text => (`${text.substring(0,4)}-${text.substring(4,6)}-${text.substring(6)}`),
     },
   ]
  }

  rowSelection = () => {
    return {
      onChange: (selectedRowKeys, selectedRows) => {
        this.check = selectedRows
        this.setState({selectedRowKeys})
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
      }),
      selectedRowKeys: this.state.selectedRowKeys
    }
  }

  onCheck = () => {
    if(!this.check || this.check.length === 0) {
        message.error('请选择资产')
      return false
    }
    this.props.assetCheckCB(this.check)
    this.props.modalAssetClose()
  }
  enterSearch = (e) => {
    // 回车查询
    if(e.keyCode === 13 && !e.ctrlKey) {
      this.searchAsset()
    }
  }

  searchAsset = () => {
    const {assetCategoryCheck, userInfo} = this.props
    const { personId } = userInfo
    this.props.form.validateFields((err, values) => {
      let serialNumber, description, sbuId, companyId, regionId, ccId
      if(values.assetNumber) {
        serialNumber = values.assetNumber.trim()
      }
      if(values.description) {
        description = values.description.trim()
      }
      if(values.companyId) {
        companyId = values.companyId.trim()
      }
      if(values.sbuId) {
        sbuId = values.sbuId.trim()
      }
      if(values.regionId) {
        regionId = values.regionId.trim()
      }
      if(values.ccId) {
        ccId = values.ccId.trim()
      }
      this.setState({ loading: true })
      this.props.getAsset({
        pageNo:1,
        pageSize:10,
        personId,
        assetCategory: assetCategoryCheck,
        serialNumber,
        description,
        sbuId,
        companyId,
        regionId,
        ccId,
        assetStatus: 'PROCESSED'
      }).then((res)=>{
        if(res && res.response && res.response.resultCode === '000000') {
          this.props.setNewArr(res.response.pageInfo)
          this.setState({ loading: false })
          if(res.response.pageInfo.result.length === 0) {
              message.error('该用户名下无可操作的资产')
            this.setState({ loading: false })
          }
        }else if(res && res.response && res.response.resultMessage){
            message.error(res.response.resultMessage)
          this.setState({ loading: false })
        }else{
            message.error('获取资产接口错误')
          this.setState({ loading: false })
        }
        this.setState({selectedRowKeys: []})
      })
    })
  }
  handleCcChange = debounce((value) => {
    // 所属CC 模糊查询
    if (value.trim() === '') {
      this.setState({ cc: value })
      return;
    }
    const bgId = sessionStorage.getItem('bgId')
    this.props.dispatch(getOrgCostCenterInfo(bgId, value)).then((d) => {
      if (d.response.resultCode === '000000') {
        const result = d.response.result
        const data = []
        result.forEach((r) => {
          data.push({
            value: r.costcenterId,
            text: r.costcenterName,
          })
        })
        this.setState({ ccData: data, cc: value })
      }
    })
    fetch(value, data => this.setState({ cc: data.value }));
  }, 200)
  changePage = (page, pageSize) => {6
    const {assetCategoryCheck, userInfo} = this.props
    const { personId } = userInfo
    this.props.form.validateFields((err, values) => {
      let serialNumber, description, sbuId, companyId, regionId, ccId
      if(values.assetNumber) {
        serialNumber = values.assetNumber.trim()
      }
      if(values.description) {
        description = values.description.trim()
      }
      if(values.companyId) {
        companyId = values.companyId.trim()
      }
      if(values.sbuId) {
        sbuId = values.sbuId.trim()
      }
      if(values.regionId) {
        regionId = values.regionId.trim()
      }
      if(values.ccId) {
        ccId = values.ccId.trim()
      }
      this.setState({ loading: true })
      this.props.getAsset({
        pageNo:page,
        pageSize:pageSize,
        personId,
        assetCategory: assetCategoryCheck,
        serialNumber,
        description,
        sbuId,
        companyId,
        regionId,
        ccId,
        assetStatus: 'PROCESSED'
      }).then((res)=>{
        if(res && res.response && res.response.resultCode === '000000') {
          const pageInfo = res.response.pageInfo
          this.props.setNewArr(pageInfo)
          this.setState({ loading: false, pageNo: pageInfo.pageNo, pageSize: pageInfo.pageSize, total: pageInfo.count })
          if(res.response.pageInfo.result.length === 0) {
            message.error('该用户名下无可操作的资产')
            this.setState({ loading: false })
          }
        }else if(res && res.response && res.response.resultMessage){
            message.error(res.response.resultMessage)
          this.setState({ loading: false })
        }else{
            message.error('获取资产接口错误')
          this.setState({ loading: false })
        }
        this.setState({ selectedRowKeys: [] })
      })
    })
  }
  PageNoChange = (page, pageSize) => {
    // 更改分页
    this.changePage(page, pageSize)
  }
  PageSizeChange = (page, pageSize)=> {
    this.changePage(page, pageSize)
    this.setState({ pageSize: pageSize, pageNo: 1 })
  }

  render(){
    const { assetInfo={}, sbuList, companyList, regionList } = this.props
    const { result=[] } = assetInfo
    const { getFieldDecorator } = this.props.form;
    const layoutProps = {
      labelCol: {
        span: 7
      },
      wrapperCol: {
        span: 15
      }
    }

    return <div className="m-apply-asset">
      <Card className="m-card" title="查询条件" bordered={false} noHovering>
        <Form>
          <Row>
            <Col span={8}>
              <FormItem label="资产编号" {...layoutProps}>
                {
                  getFieldDecorator('assetNumber')(<Input onKeyDown={e => this.enterSearch(e)}/>)
                }
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="资产描述" {...layoutProps}>
                {
                  getFieldDecorator('description')(<Input onKeyDown={e => this.enterSearch(e)}/>)
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
                  getFieldDecorator('ccId')(
                    <Select
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
          </Row>
          <Row>
            <Col className="taRight" span={23}>
              <Button type='primary' onClick={this.searchAsset}>查询</Button>
            </Col>
          </Row>
        </Form>
      </Card>
      <Card
        className="m-card"
        bordered={false}
        noHovering
      >
        <h1>
          查询结果
          <Button type="primary" size="default" style={{marginRight: '950px'}} onClick={this.onCheck}>确认选择</Button>
        </h1>
        <Table
          rowSelection={this.rowSelection()}
          columns={this.getColumns()}
          dataSource={this.getTableData(result)}
          loading={this.props.loading || this.state.loading}
          scroll={{y: 260}}
          pagination={{
            showSizeChanger: true,
            onShowSizeChange: this.PageSizeChange,
            showTotal: t=>`共${t}条`,
            onChange: this.PageNoChange,
            showQuickJumper: true,
            total: this.state.total,
            current: this.state.pageNo,
            pageSize: this.state.pageSize,
          }}
        />
      </Card>
    </div>
  }
}

export default Form.create()(Component)
import React from 'react'
import {Card, Row, Col, Form, Input, Button, Select, Table} from 'antd'
import message from '../../common/Notice/notification'
import debounce from 'lodash/debounce'
import './staffFinder.less'
import {getUserList} from '../../../actions/user'
import {getOrgCostCenterInfo} from '../../../actions/dictionary/dictionary'

const FormItem = Form.Item
const Option = Select.Option
//  eslint-disable-next-line react/prefer-stateless-function
export default class Root extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      company: '',
      bu: '',
      cc: '',
      region: '',
      keywords: this.props.keywords,
      selectItem: [],
      data: [],
      ccData: [],
      pageNO: 1,
      pageSize: 10,
      total: 0,
      selectedRowKeys: [],
      columns: [{
        title: '姓名',
        dataIndex: 'lastName',
        width: '10%',
      }, {
        title: '员工编号',
        dataIndex: 'employeeNumber',
        width: '7%'
      }, {
        title: 'SBU',
        dataIndex: 'sbuName',
        width: '10%',
      }, {
        title: 'CC',
        dataIndex: 'costcenter',
        width: '20%',
      }, {
        title: '地区',
        dataIndex: 'regionName',
        width: '10%',
      }, {
        title: '公司',
        dataIndex: 'companyName',
        width: '15%',
      }, {
        title: '部门',
        dataIndex: 'organizationName',
        width: '20%',
      }],
      searchColumns: [{
        title: '姓名',
        dataIndex: 'accountName',
        width: '10%',
      }, {
        title: '员工编号',
        dataIndex: 'staffCode',
        width: '7%',
      }, {
        title: 'SBU',
        dataIndex: 'sbuName',
        width: '10%',
      }, {
        title: 'CC',
        dataIndex: 'costcenter',
        width: '20%',
      }, {
        title: '地区',
        dataIndex: 'regionName',
        width: '10%',
      }, {
        title: '公司',
        dataIndex: 'companyName',
        width: '15%',
      }, {
        title: '部门',
        dataIndex: 'orgName',
        width: '20%',
      }],
    }
  }

  rowSelectionKey = () => {
    const self = this
    let rowSelection = {}
    return rowSelection = {
      onChange: (selectedRowKeys) => {
        this.setState({selectedRowKeys})
      },
      onSelect: (record, selected) => {
        const target = this.state.data.filter(item => record === item)[0];
        if (target) {
          if (selected) {
            this.setState({selectItem: [target]});
          }
        }
      },
      onSelectAll: (selected) => {
        const newData = [...this.state.data];
        if (selected) {
          this.setState({selectItem: newData});
        }
        else {
          this.setState({selectItem: []});
        }
      },
      selectedRowKeys: self.state.selectedRowKeys,
      type: 'radio',
    }
  }
  submit = () => {
    if (!this.props.multiple && this.state.selectItem.length > 1) {
      message.error('只能选择一名员工')
      return false
    }
    if (this.state.selectItem.length === 0) {
      message.error('请选择员工')
      return false
    }
    this.setState({
      company: '',
      bu: '',
      cc: '',
      region: '',
      keywords: this.props.keywords,
      selectItem: [],
      data: [],
      pageNO: 1,
      pageSize: 10,
      total: 0,
    });
    if (this.props.translate) {
      const newSelect = this.state.selectItem.map(v => ({
        accountName: v.lastName,
        bgId: v.businessGroupId,
        companyId: v.companyId,
        companyName: v.companyName,
        costCenter: v.costcenterId,
        costCenterName: v.costcenterName,
        isStaffLeave: v.currentFlag === 'Y' ? 'no' : 'yes',
        orgId: v.organizationId,
        orgName: v.organizationName,
        personId: v.personId,
        regionId: v.regionId,
        regionName: v.regionName,
        sbuId: v.sbuId,
        sbuName: v.sbuName,
        staffAccount: v.ntAccount,
        staffCode: v.employeeNumber,
      }))
      this.props.selectStaff(newSelect)
    } else {
      this.props.selectStaff(this.state.selectItem)
    }
  }
  enterSearch = (e) => {
    // 回车查询
    if(e.keyCode === 13 && !e.ctrlKey) {
      this.queryList(this.state.pageSize, 1)
    }
  }
  queryList = (size, no) => {
    let staffKey, ccId, companyId, regionId, subId
    if (this.state.keywords != '') {
      staffKey = this.state.keywords
    }
    if (this.state.cc != '') {
      ccId = this.state.cc
    }
    if (this.state.company != '') {
      companyId = this.state.company
    }
    if (this.state.region != '') {
      regionId = this.state.region
    }
    if (this.state.bu != '') {
      subId = this.state.bu
    }

    let params = {}
    if (this.props.useAmsPai) {
      params = {
        pageNo: no,
        pageSize: size,
        keyword: staffKey,
        companyId,
        ccId,
        regionId,
        valid: this.props.valid
      }
    } else {
      params = {
        pageNo: no,
        pageSize: size,
        employeeInfo: {
          staffKey,
          subId,
          companyId,
          ccId,
          regionId,
          inServiceStaff: this.props.valid ? 'Y' : 'N',
          bgCode: this.props.bgCode ? this.props.bgCode : undefined
        }
      }
    }
    this.setState({loading: true});
    this.props.dispatch(getUserList(params, this.props.useAmsPai)).then((result) => {
      if (result.response.resultCode === '000000') {
        let temp = []
        const res = this.props.useAmsPai ? result.response.result.result : result.response.pageInfo.result
        if (this.props.useAmsPai) {
          res.map((i, k) => {
            temp.push({
              key: k,
              NO: k + 1,
              costcenter: `(${i.costCenter}) ${i.costCenterName}`,
              ...i
            })
          })
        } else {
          res.map((i, k) => {
            temp.push({
              key: k,
              NO: k + 1,
              costcenter: `(${i.costcenterId}) ${i.costcenterName}`,
              ...i
            })
          })
        }
        const total = this.props.useAmsPai ? result.response.result.pageCount : result.response.pageInfo.total
        this.setState({total, data: temp, loading: false, pageNO: no, pageSize: size})
      } else {
        message.warning('无查询结果')
        this.setState({total: 0, data: [], loading: false})
      }
      this.setState({selectedRowKeys: []});
    });
  }
  PageSizeChange = (current, size) => {
    this.queryList(size, 1)
    this.setState({pageSize: size, current: 1})
  }
  PageNoChange = (no, pageSize) => {
    this.queryList(this.state.pageSize, no)
  }
  handleCcChange = debounce((value) => {
    // 所属CC 模糊查询
    if (value.trim() === '') {
      this.setState({ cc: value })
      return;
    }
    // this.setState({ value });
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
        this.setState({ccData: data, cc: value})
      }
    })
    fetch(value, data => this.setState({cc: data.value}));
  }, 200)

  render() {
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 14},
    };
    const {companyData, regionData, buData} = this.props
    const ic = this.inputChange;
    return (
      <Form className="m-staffFinder" sytle={{padding: '0'}}>
        <Card className="m-card" title="查询条件" bordered={false} noHovering>
          <Row>
            <Col span={8}>
              <FormItem {...formItemLayout} label="员工信息：">
                <Input
                  value={this.state.keywords}
                  onChange={(e) => {
                    this.setState({keywords: e.target.value})
                  }}
                  onKeyDown={e => this.enterSearch(e)}
                  placeholder="姓名/NT账号/员工编号"
                />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="所属公司：">
                <Select
                  showSearch
                  defaultValue=""
                  optionFilterProp="children"
                  onChange={(value) => {
                    this.setState({company: value})
                  }}
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                  <Option value="">全部</Option>
                  {companyData.map((i, k) => {
                    return <Option key={k} value={i.flexValue}>{i.description}</Option>
                  })}
                </Select>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="所属地区：">
                <Select defaultValue="" onChange={(value) => {
                  this.setState({region: value})
                }}>
                  <Option value="">全部</Option>
                  {regionData.map((i, k) => {
                    return <Option key={k} value={i.flexValue}>{i.description}</Option>
                  })}
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem {...formItemLayout} label="所属BU：">
                <Select
                  defaultValue=""
                  showSearch
                  optionFilterProp="children"
                  onChange={(value) => {
                    this.setState({bu: value})
                  }}
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                  <Option value="">全部</Option>
                  {buData.map((i, k) => {
                    return <Option key={k} value={i.flexValue}>{i.description}</Option>
                  })}
                </Select>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="所属CC：">
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
                </Select>
              </FormItem>
            </Col>
            <Col className="taRight" span={8}>
              <FormItem>
                <Button type="primary" onClick={() => {
                  this.queryList(this.state.pageSize, 1)
                }}>查询</Button>
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card className="m-card" title="" bordered={false} noHovering>
          <h1>
            查询结果
            <Button type="primary" onClick={this.submit}>确认选择</Button>
          </h1>
          <Row>
            <Col span={24}>
                <Table
                  rowSelection={this.rowSelectionKey()}
                  columns={this.props.useAmsPai ? this.state.searchColumns : this.state.columns}
                  dataSource={this.state.data}
                  scroll={{y: 310}}
                  loading={this.state.loading}
                  rowKey={record => record.staffCode ? record.staffCode : record.employeeNumber}
                  pagination={{
                    showSizeChanger: true,
                    onShowSizeChange: this.PageSizeChange,
                    showTotal: t => `共${t}条`,
                    onChange: this.PageNoChange,
                    showQuickJumper: true,
                    total: this.state.total,
                    current: this.state.pageNO
                  }}
                />
            </Col>
          </Row>
        </Card>
      </Form>
    );
  }

}

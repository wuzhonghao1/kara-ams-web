import React from 'react'
import moment from 'moment'
import cloneDeep from 'lodash/cloneDeep';
import { Form, Button, Row, Col, Input, Select, DatePicker, Table, Pagination, Modal, Icon, Card, Spin } from 'antd';
import message from '../common/Notice/notification'
import StaffFinder from '../common/staffFinder/staffFinder'
import debounce from 'lodash/debounce'
import { saveAs } from '../../util/FileSaver';
import './ccOwnerConfirm.less'
const { Option, OptGroup } = Select;
const { MonthPicker } = DatePicker
const FormItem = Form.Item;

class CCOwnerConfirm extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      tableList: [],
      data: [],
      visible: false,
      selectedRowKeys: [], // 批量审核选中行
      loading: false,
      changeList: [],
      batchStatus: false, // 批量按钮默认不可操作
      exportStatus: false, // 导出loading状态
      value: [],
      curPageNo: 1,
      curPageSize: 10,
      expand: false,
      showBtn: true,
      columns: [
        {
          title: '批次号',
          dataIndex: 'changeBatch',
          key: 'changeBatch',
          width: 70,
          fixed: 'left',
        },
        {
          title: '员工姓名',
          dataIndex: 'assignedOwnerName',
          key: 'assignedOwnerName',
          width: 70,
          fixed: 'left',
        },
        {
          title: '员工编号',
          dataIndex: 'assignedOwnerNumber',
          key: 'assignedOwnerNumber',
          width: 70,
          fixed: 'left',
        },
        {
          title: '资产编号',
          dataIndex: 'serialNumber',
          key: 'serialNumber',
          width: 110,
          fixed: 'left',
        },
        {
          title: '资产关键字',
          dataIndex: 'assetKeyName',
          key: 'assetKeyName',
          width: 100,
        },
        {
          title: '资产描述',
          dataIndex: 'description',
          key: 'description',
          width: 220,
        },
        {
          title: '变更前',
          children: [{
            title: '所属公司',
            dataIndex: 'frontCompany',
            key: 'frontCompany',
            width: 120,
          }, {
            title: '所属BU',
            dataIndex: 'frontBu',
            key: 'frontBu',
            width: 120,
          }, {
            title: '所属CC',
            dataIndex: 'frontCc',
            key: 'frontCc',
            width: 80,
            render: (text, record) => <div>{record.frontCCId}</div>
          }, {
            title: '所属地区',
            dataIndex: 'frontRegion',
            key: 'frontRegion',
            width: 70,
          }],
        },
        {
          title: '变更后',
          children: [{
            title: '所属公司',
            dataIndex: 'backCompany',
            key: 'backCompany',
            width: 120,
          }, {
            title: '所属BU',
            dataIndex: 'backBu',
            key: 'backBu',
            width: 120,
          }, {
            title: '所属CC',
            dataIndex: 'backCc',
            key: 'backCc',
            width: 80,
            render: (text, record) => <div>{record.backCCId}</div>
          }, {
            title: '所属地区',
            dataIndex: 'backRegion',
            key: 'backRegion',
            width: 70,
          }],
        },
        {
          title: '确认人',
          dataIndex: 'ccOwnerName',
          key: 'ccOwnerName',
          width: 100,
        },
        {
          title: '确认时间',
          dataIndex: 'changeTime',
          key: 'changeTime',
          width: 100,
        },
        {
          title: '确认结果',
          dataIndex: 'changeStatusName',
          fixed: 'right',
          key: 'changeStatusName',
          width: 90,
          render: (text, record, index) => (
            this.state.showBtn && record.changeStatus === '10' ?
            (<Select defaultValue="" value={record.result || ''} style={{ width: 90 }} onChange={(value) => this.handleChange(value, record.changeId)}>
              <Option value="">请选择</Option>
              <Option value="yes">同意</Option>
              <Option value="no">不同意</Option>
            </Select>) : text)
        },
        {
          title: '确认说明',
          dataIndex: 'remark',
          fixed: 'right',
          key: 'remark',
          width: 100,
          render: (text, record, index) => (
            this.state.showBtn && record.changeStatus === '10' ?
            (<Input className={record.result === 'no' && record.remark.trim() === '' ? 'error' : ''} placeholder='确认说明' value={record.remark || ''} onChange={(value) => this.handleChangeInput(value, record.changeId)} />) : text
          )
        }
      ]
    };
  }
  // 自动查询
  componentWillMount() {
    this.props.clearTable();
  }

  componentDidMount() {
    this.props.form.setFieldsValue({ changeStatus: "10" });
    this.handleSearch()
  }


  // 选择同意 or 不同意
  handleChange = (value, changeId) => {
    if (value) {
      let changeIds = this.state.selectedRowKeys.filter(i => i !== changeId).concat(changeId) // 选中该行
      let newTableList = cloneDeep(this.state.tableList)
      newTableList.forEach(item => {
        if (item.changeId === changeId) {
          item.result = value
          item.remark = ''
        }
      })
      this.setState({ selectedRowKeys: changeIds, tableList: newTableList });
    } else {
      let changeIds = this.state.selectedRowKeys.filter(i => i !== changeId) // 取消选中该行
      let newTableList = cloneDeep(this.state.tableList)
      newTableList.forEach(item => {
        if (item.changeId === changeId) {
          item.result = ''
          item.remark = ''
        }
      })
      this.setState({ selectedRowKeys: changeIds, tableList: newTableList  })
    }
  }


  // 选择同意 or 不同意 输入确认说明
  handleChangeInput = (e, changeId) => {
    let newTableList = cloneDeep(this.state.tableList)
    newTableList.forEach(x => {
      if (x.changeId === changeId) {
        x.remark = e.target.value;
      }
    })
    this.setState({ tableList: newTableList})
  }

  // 变更描述选中行
  onSelectChange = (selectedRowKeys, selectedRows) => {
    let changeIdList = selectedRows.reduce((sum, cur) => {
      return sum.concat(cur.changeId)
    }, [])
    let newTableList = cloneDeep(this.state.tableList)
    newTableList.forEach(x => {
      if (changeIdList.indexOf(x.changeId) === -1) {
        // console.log('找不到了' )
        x.hide = 'yes'
      } else {
        x.hide = ''
      }
    })
    this.setState({ selectedRowKeys: changeIdList, tableList: newTableList });
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
    this.props.form.setFieldsValue({ personId, accountName: `${lastName} / ${employeeNumber}` })
    this.handleCancel()
  }

  // 资产变更审核 变更前，变更后函数对比
  handleModifyChange = (value) => {
    if (value.length === 2) {
      if ((value[0].indexOf('_') === 0 && value[1].indexOf('_') === 0) || (value[0].indexOf('_') !== 0 && value[1].indexOf('_') !== 0) // 2元素同为1组
       ) {
        value.shift();
        this.setState({value: value})
      } else if (value[0].indexOf('_') === 0 && value[1].indexOf('_') !== 0){
        value.reverse();
        this.setState({value: value})
      }
    } else if (value.length === 3) {
      if (value[2].indexOf('_') === 0 && value[0].indexOf('_') === 0) {
        value.shift();
        this.setState({value: value})
      } else if (value[2].indexOf('_') !== 0 && value[0].indexOf('_') !== 0) {
        value.shift();
        value.reverse();
        this.setState({ value: value })
      } else if (value[2].indexOf('_') === 0 && value[1].indexOf('_') === 0) {
        value.splice(1, 1);
        this.setState({value: value})
      } else if (value[2].indexOf('_') !== 0 && value[1].indexOf('_') !== 0) {
        value.splice(1, 1);
        value.reverse();
        console.log('value2', value)
        this.setState({ value: value })
      }
    } else {
      this.setState({value: value})
    }
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

  // 获取表单数据 => 统一查询 return 搜索条件
  getFormValues = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // console.log('Receive values of form: ', values)
      }
      // 对于空的或undefined值，过滤
      const newValues = Object.keys(values).reduce((x, y) => {
        if (y === 'changeBatch' && values[y]) { // 变更批次
          x.changeBatch = moment(values[y]).format('YYYYMM')
          if (moment().format('YYYYMM') !== moment(values[y]).format('YYYYMM')) {
            this.setState({showBtn: false})
          } else {
            this.setState({ showBtn: true })
          }
          // } else if (y ==='ccId0' && values['ccId0']) { // 变更前ccId
          //   x.frontCcId = values['ccId0']
          // } else if (y ==='ccId1' && values['ccId1']) { // 变更后ccId
          //   x.backCcId = values['ccId1']
        } else if (y.slice(0, 5) !== 'audit' && y !== 'accountName' && y !== 'changeBatch' && values[y]) {
          x[y] = values[y]
        } else if (y === 'auditCompanyId' && values[y].length) { // 变更前公司ID 变更后公司ID
          if (values[y].length === 1) {
            if (values[y][0].slice(0, 1) !== '_' && values[y][0] !== '0') {
              x['frontCompanyId'] = values[y][0]
            }
            if (values[y][0].slice(0, 1) === '_' && values[y][0] !== '_0') {
              x['backCompanyId'] = values[y][0].slice(1)
            }
          } else if (values[y].length === 2) {
            values[y].forEach(item => {
              if (item !== '0' && item !== '_0' && item) {
                if (item.slice(0, 1) === '_') {
                  x['backCompanyId'] = item.slice(1)
                } else if (item.slice(0, 1) !== '_') {
                  x['frontCompanyId'] = item
                }
              }
            })
          }
        } else if (y === 'auditSbuId' && values[y].length) { //变更前sbuId 变更后sbuId
          if (values[y].length === 1) {
            if (values[y][0].slice(0, 1) !== '_' && values[y][0] !== '0') {
              x['frontSbuId'] = values[y][0]
            }
            if (values[y][0].slice(0, 1) === '_' && values[y][0] !== '_0') {
              x['backSbuId'] = values[y][0].slice(1)
            }
          } else if (values[y].length === 2) {
            values[y].forEach(item => {
              if (item !== '0' && item !== '_0' && item) {
                if (item.slice(0, 1) === '_') {
                  x['backSbuId'] = item.slice(1)
                } else if (item.slice(0, 1) !== '_') {
                  x['frontSbuId'] = item
                }
              }
            })
          }
        } else if (y === 'auditRegionId' && values[y].length) { //变更前 后RegionId
          if (values[y].length === 1) {
            if (values[y][0].slice(0, 2) !== '_1' && values[y][0] !== '1') {
              x['frontRegionId'] = values[y][0]
            }
            if (values[y][0].slice(0, 1) === '_' && values[y][0] !== '_1') {
              x['backRegionId'] = values[y][0].slice(1)
            }
          } else if (values[y].length === 2) {
            values[y].forEach(item => {
              if (item !== '1' && item !== '_1' && item) {
                if (item.slice(0, 1) === '_') {
                  x['backRegionId'] = item.slice(1)
                } else if (item.slice(0, 1) !== '_') {
                  x['frontRegionId'] = item
                }
              }
            })
          }
        }

        return x
      }, {})
      this.newValues = newValues // 将列表数据保存到store上
    })
  }

  // 展开or收起
  expand = () => {
   const $row = document.getElementById('theRow');
   const $col = document.getElementById('theCol');
   const $taRight = document.getElementById('taRight');
   if (this.state.expand) {
     this.setState({expand: false})
     $row.style.display = 'none';
     $col.style.display = 'none';
     $taRight.style.marginRight = '5%'
   } else {
     this.setState({ expand: true })
     $row.style.display = 'block';
     $col.style.display = 'block';
     $taRight.style.marginRight = '4%'
   }
  }

  // 财产转移查询
  handleSearch = (e='', curPageNo='', curPageSize='') => {
    if (curPageNo && curPageSize) {
      this.setState({ loading: true, curPageNo, curPageSize });
    } else {
      this.setState({ loading: true })
    }
    if (e) {
      e.preventDefault();
    }
    this.getFormValues();
    this.props.getCCOwnerSearch({
      pageNo: this.state.curPageNo,
      pageSize: this.state.curPageSize,
      ...this.newValues,
    }).then((result) => {
      this.setState({loading: false})
      if (result && result.response && result.response.resultCode === '000000') {
        this.setState({
          tableList: this.props.assetChangeListPageInfo.result
        });
      }
    })
  }

  // 重置reset
  resetBtn = () => {
    this.props.form.resetFields()
    this.setState({
      selectedRowKeys: [],
      batchStatus: false,
      tableList: [],
      visible: false,
      changeList: [],
      curPageNo: 1,
      curPageSize: 10,
    });
  }

  // 资产变更审核
  batchApprove = () => {
    this.setState({batchStatus: true})
    // 遍历 校验
    let changeList=[]
    this.state.selectedRowKeys.forEach(x=> {
      this.state.tableList.filter(item => {
        if(item.changeId === x) {
          let object = Object.create(null);
          object.changeId = item.changeId;
          object.result = item.result;
          object.remark = item.remark;
          if (item.result === 'no' &&( !item.remark || item.remark.trim() === '')) {
            message.error('确认结果为不同意时，必须填写确认说明,请检查')
            return false
          } else if (!item.result) {
            message.error('确认结果没选择,请检查')
            return false
          }
          changeList = changeList.concat(object)
        }
      })
    })
    // 变更确认
    if(changeList.length) {
      this.props.getCCOwnerConfirm({
        changeList: changeList
      }).then(result => {
        if (result && result.response && result.response.resultCode === '000000') {
          message.success('变更成功')
          //查询列表
          this.handleSearch()
        } else {
          message.error(result.response.resultMessage)
        }
        this.setState({
          batchStatus: false,
          selectedRowKeys: [],
        })
      })
    } else {
      this.setState({
        batchStatus: false,
        selectedRowKeys: [],
      })
    }
  }

  // 导出
  doExport = () => {
    this.setState({ exportStatus: true })
    this.getFormValues();
    this.props.getCCOwnerExport(this.newValues).then(result => {
      this.setState({ exportStatus: false })
      if(result && result.response && !result.response.resultCode) {
        saveAs(result.response, `资产变更明细表_${Date.parse(new Date())}.xls`);
      } else if (result.response.resultCode === '666666'){
        message.warning(result.response.resultMessage);
      } else{
        message.error('导出申请单失败!');
      }
    })
  }

  pageSizeChange = (size) => {
    this.setState({ curPageNo: 1, curPageSize: size, loading: true, })  
    this.getFormValues()    
    this.props.getCCOwnerSearch({
      pageNo: 1,
      pageSize: size,
      ...this.newValues,
    }).then((result) => {
      if (result && result.response && result.response.resultCode === '000000') {
        this.setState({
          tableList: this.props.assetChangeListPageInfo.result,
          visible: false,
          selectedRowKeys: [], // 批量审核选中行
          changeList: [],
          batchStatus: false, // 批量按钮默认不可操作
          loading: false
        });
      }
    })
  }

  pageNoChange = (page) => {
    // console.log('page', page)
    this.setState({ curPageNo: page, loading: true });
    this.getFormValues() 
    this.props.getCCOwnerSearch({
      pageNo: page,
      pageSize: this.state.curPageSize,
      ...this.newValues,
    }).then((result) => {
      if (result && result.response && result.response.resultCode === '000000') {
        this.setState({
          tableList: this.props.assetChangeListPageInfo.result,
          visible: false,
          selectedRowKeys: [], // 批量审核选中行
          changeList: [],
          batchStatus: false, // 批量按钮默认不可操作
          loading: false
        });
      }
    })
  }

  render() {
    const { assetChangeListPageInfo } = this.props;
    const data = this.state.tableList // 将数据放到本地state，后期修改确认结果，确认说明好修改
    const { getFieldDecorator } = this.props.form;
    const { columns } = this.state;

    const { dictionary } = this.props; // 通过接口获得的公司
    const { companyList, sbuList, regionList, assetKey, changeOption, changeStatus } = dictionary
    const { batchStatus, selectedRowKeys } = this.state
    const layoutProps = {
      labelCol: {
        span: 7
      },
      wrapperCol: {
        span: 17
      }
    }
    const rowSelection = this.state.showBtn ? {
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: record => ({
        disabled: record.changeStatus !== '10'
      })
    } : null;
    const hasSelected = selectedRowKeys.length > 0
    const options = this.state.data.map(d => <Option key={d.value}>{d.text}</Option>);

    return <div className='CCOwnerConfirm'>
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
              <FormItem label='变更批次' {...layoutProps}>
                {
                  getFieldDecorator('changeBatch', {initialValue: moment(new Date(), 'YYYYMM')})(<MonthPicker format='YYYYMM' style={{width: '100%'}} />)
                }
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem label="变更项" {...layoutProps}>
                {
                  getFieldDecorator('changeOption', {initialValue: ''})(
                    <Select>
                      <Option value="">--请选择--</Option>
                      {changeOption.map((item)=>(<Option key={item.paramValue} value={item.paramValue}>{item.paramValueDesc}</Option>))}
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
                  getFieldDecorator('assetId')(<Input/>)
                }
              </FormItem>
            </Col>
            <Col span={8}>
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
            <Col span={7}>
              <FormItem label="确认结果" {...layoutProps}>
                {
                  getFieldDecorator('changeStatus', { initialValue: '' })(
                    <Select>
                      <Option value="">--请选择--</Option>
                      {changeStatus.map((item) => (<Option key={item.paramValue} value={item.paramValue}>{item.paramValueDesc}</Option>))}
                    </Select>
                  )
                }
              </FormItem>
            </Col> 
          </Row>
          <Row id='theRow' style={{display: 'none'}}>
            <Col span={8}>
              <FormItem label="所属公司" {...layoutProps}>
                {
                  getFieldDecorator('auditCompanyId', { initialValue: ['0', '_0'] })(
                    <Select
                      mode="multiple"
                      onChange={this.handleModifyChange}
                    >
                      <OptGroup label="变更前">
                        <Option value="0">--请选择--</Option>
                        {companyList.map((item) => (<Option key={item.flexValue} value={item.flexValue}>{item.description}</Option>))}
                      </OptGroup>
                      <OptGroup label="变更后">
                        <Option value="_0">--请选择--</Option>
                        {companyList.map((item) => (<Option key={item.flexValue} value={'_' + item.flexValue}>{item.description}</Option>))}
                      </OptGroup>
                    </Select>
                  )
                }
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="所属BU" {...layoutProps}>
                {
                  getFieldDecorator('auditSbuId', {initialValue: ['0', '_0']})(
                    <Select
                      mode="multiple"
                      onChange={this.handleModifyChange}
                    >
                      <OptGroup label="变更前">
                        <Option value="0">--请选择--</Option>
                        {sbuList.map((item)=>(<Option key={item.flexValue} value={item.flexValue}>{item.description}</Option>))}
                      </OptGroup>
                      <OptGroup label="变更后">
                        <Option value="_0">--请选择--</Option>
                        {sbuList.map((item)=>(<Option key={item.flexValue} value={'_' + item.flexValue}>{item.description}</Option>))}
                      </OptGroup>
                    </Select>
                  )
                }
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem label="所属CC" {...layoutProps}>
                {
                  getFieldDecorator('frontCcId')(
                    <Select
                      mode="combobox"
                      placeholder={'变更前ccId'}
                      defaultActiveFirstOption={false}
                      showArrow={false}
                      filterOption={false}
                      onChange={this.handleCcChange}
                      style={{width: '50%'}}
                    >
                      {options}
                    </Select>)
                }
                {
                  getFieldDecorator('backCcId')(
                    <Select
                      mode="combobox"
                      placeholder={'变更后ccId'}
                      defaultActiveFirstOption={false}
                      showArrow={false}
                      filterOption={false}
                      onChange={this.handleCcChange}
                      style={{width: '50%'}}
                    >
                      {options}
                    </Select>)
                }
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8} id='theCol' style={{display: 'none'}}>
              <FormItem label="所属地区" {...layoutProps}>
                {
                  getFieldDecorator('auditRegionId', { initialValue: ['1', '_1'] })(
                    <Select
                      mode="multiple"
                      onChange={this.handleModifyChange}
                    >
                      <OptGroup label="变更前">
                        <Option value="1">--请选择--</Option>
                        {regionList.map((item) => (<Option key={item.flexValue} value={item.flexValue}>{item.description}</Option>))}
                      </OptGroup>
                      <OptGroup label="变更后">
                        <Option value="_1">--请选择--</Option>
                        {regionList.map((item) => (<Option key={item.flexValue} value={'_' + item.flexValue}>{item.description}</Option>))}
                      </OptGroup>
                    </Select>
                  )
                }
              </FormItem>
            </Col>
            <Col className="taRight" id='taRight' style={{float: 'right', marginRight: '5%'}} offset={8} span={7}>
              <Button type='primary' htmlType="submit">查询</Button>
              <Button type='primary'onClick={this.resetBtn}>清空</Button>
              <Button type='primary'onClick={this.doExport}>导出</Button>
                {this.state.expand ? <span className='expand up' onClick={this.expand}>收起</span> : <span className='expand down' onClick= { this.expand }>展开</span>}
            </Col>
          </Row>
        </Form>
      </Card>
      <div className='result'>
        <h3>查询结果&emsp;
        {this.state.showBtn ? (<Button
              type="primary"
              disabled={!hasSelected}
              onClick={this.batchApprove}
              loading={batchStatus}
            >
              变更确认
        </Button>) : null } &emsp;&emsp;</h3>
        <Table
          rowKey={row => row.changeId}
          rowSelection={rowSelection}
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ x: 1800 }}
          className='special'
          loading={this.state.loading}
        />
        <Modal
            visible={this.state.visible}
            title="员工查询"
            width="1000px"
            footer={null}
            onOk={this.handleOk}
            onCancel={this.handleCancel}>
            <StaffFinder dispatch={this.props.dispatch}
                        multiple={false}
                        bgCode={sessionStorage.getItem('bgCode')}
                        keywords={this.state.keywords}
                        selectStaff={this.selectStaff}
                        companyData={this.props.dictionary.companyList}
                        regionData={this.props.dictionary.regionList}
                        buData={this.props.dictionary.sbuList}
                        ccData={this.props.dictionary.ccList ? this.props.dictionary.ccList : []}
            />
        </Modal>
        <br/>
        <div style={{paddingRight: '20px', textAlign: 'right'}}>
          <Pagination
            current={this.state.curPageNo}
            pageSize={this.state.curPageSize}
            showSizeChanger
            onShowSizeChange={(current, size) => this.pageSizeChange(size)}
            showTotal={t => `共${t}条`}
            total={assetChangeListPageInfo.count}
            onChange={(page) => this.pageNoChange(page)}
            showQuickJumper
            pageSizeOptions={['10', '20', '50', '100']}
          ></Pagination>
            <br />
        </div>
      </div>
    </Spin>
    </div>
  }
}
export default Form.create()(CCOwnerConfirm)

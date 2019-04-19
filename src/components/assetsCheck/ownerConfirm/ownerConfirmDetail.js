import React from 'react'
import {Card, Row, Col, Form, Input, Button, Select, Table} from 'antd'
import './ownerConfirmDetail.less'
import message from '../../common/Notice/notification'
const FormItem = Form.Item
const Option = Select.Option

const showValue = (v) => {
  if(v === '10') {
    return '同意'
  }else if(v === '20') {
    return '转移'
  }else if(v === '30') {
    return '报废'
  }else if(v === '40') {
    return '赔偿'
  }else if(v === '50') {
    return '系统确认'
  }
}

const EditableCell = ({editable, value, onChange}) => (
  <div>
    {editable
      ? <Input value={value ? value : ''} onChange={e => onChange(e.target.value)}/>
      : value
    }
  </div>
);

const SelectCell = ({editable, value, onChange}) => {
  return <div>
    {editable ?
      <Select value={value} onChange={onChange}>
        <Option key="1" value="00">请选择</Option>
        <Option key="2" value="10">同意</Option>
        <Option key="3" value="20">已转移</Option>
        <Option key="4" value="30">已报废</Option>
        <Option key="5" value="40">已赔偿</Option>
      </Select>
      : showValue(value)
    }
  </div>
}

export default class Root extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectYear: '',
      selectItems: [],
      checkAll: false,
      tableData: [],
      columns: [],
      checkBtn: '',
      unConfirm: 0, //未确认
      confirm: 0, //已确认
      data: [], //备选item
      isDetail: false, //是否为详情页面
      assetCategory: '', // 资产大类
      showApprove: true, // 显示操作
      selectedRowKeys: [], // 控制选框
      taskName: '', //任务名称
      loading: false,
      pageNo: 1,
      pageSize: 10,
      count: 0,
    }
  }

  componentWillMount() {
    if(this.props.location.search === '') {
      this.setState({ isDetail: true, checkBtn: '' })
      this.searchDetail('')
    } else {
      this.setState({ checkBtn: '30' })
      this.searchDetail('30')
    }
  }
  columns = () => {
    let  columns
    columns =[{
        title: '序号',
        width: '2%',
        dataIndex: 'key',
      },{
        title: '员工编号',
        dataIndex: 'assignedOwnerNumber',
      }, {
        title: '员工姓名',
        dataIndex: 'assignedOwnerName',
      }, {
        title: '资产编号',
        dataIndex: 'serialNumber',
      }, {
        title: '资产关键字',
        dataIndex: 'assetKey',
      }, {
        title: '资产描述',
        dataIndex: 'description',
      }, {
        title: '所属公司',
        dataIndex: 'assignedCompanyName',
      }, {
        title: '所属BU',
        dataIndex: 'assignedSbuName',
      }, {
        title: '所属CC',
        dataIndex: 'assignedCcId',
      }, {
        title: '所属区域',
        dataIndex: 'assignedRegionName',
      }, {
        title: '启用时间',
        dataIndex: 'serviceDate',
      }, {
        title: '确认结果',
        width: 100,
        fixed: 'right',
        render: (text, record) => this.renderSelectColumns(text, record, 'ownerConfirm'),
      }, {
        title: '确认说明',
        width: 150,
        fixed: 'right',
        render: (text, record) => this.renderColumns(text, record, 'remark'),
      }]

    return columns
  }
  changePage = (no, size) => {
    this.searchDetail(this.state.checkBtn, no, size)
  }
  searchDetail = (status, no, size) => {
    // 详情
    this.setState({ loading: true })
    this.props.getOwnerDetail(this.props.match.params.id, status, no || this.state.pageNo, size || this.state.pageSize).then(res => {
      if(res.response.resultCode === '000000' && res.response.pageInfo.result) {
        const arr = res.response.pageInfo.result
        if(arr.length !== 0) {
          let time = arr[0].ownerConfirmTime;
          const endTime = time.replace(new RegExp("-","gm"),"/");
          const lastTime =(new Date(endTime)).getTime()
          const now = new Date().getTime()
          if( now > lastTime) {
            // 当前时间大于最后审批时间
            this.setState({ showApprove: false })
          }
        }
        let newArr = arr.map((i, idx) => {
          return {
            ...i,
            key: idx + 1,
            editable: true,
            comfirm: this.state.isDetail ? i.ownerConfirm: '10',
            remark: i.ownerConfirmRemark ? i.ownerConfirmRemark : '',
          }
        })
        this.setState({
          tableData: newArr,
          confirm: res.response.confirmCount,
          unConfirm: res.response.unConfirmCount,
          assetCategory: res.response.assetCategory,
          selectedRowKeys: [],
          taskName: res.response.taskName,
          count: res.response.pageInfo.count,
          pageNo: res.response.pageInfo.pageNo,
          pageSize: res.response.pageInfo.pageSize,
        })
      } else if(res.response.resultCode !== '000000') {
        message.error(res.response.resultMessage)
        this.setState({ tableData: [], confirm: 0, unConfirm: 0, selectedRowKeys: [], taskName: '' })
      } else {
        this.setState({ tableData: [], confirm: 0, unConfirm: 0, selectedRowKeys: [], taskName: '' })
      }
      this.setState({ loading: false })
    })
  }

  assetOperation = (type) => {
    if(this.state.selectItems.length === 0) {
      message.warning('请选择要操作的资产')
      return
    }
    // serialNumber
    let assetArr = []
    this.state.selectItems.map(item => {
      assetArr.push({
        serialNumber: item.serialNumber,
        description: item.description,
        assignedCompanyId: item.assignedCompanyId,
        assignedCompanyName: item.assignedCompanyName,
        assignedSbuId: item.assignedSbuId,
        assignedSbuName: item.assignedSbuName,
        assignedCcId: item.assignedCcId, //:null
        assignedCcName: item.assignedCcName,
        assignedRegionId: item.assignedRegionId,
        assignedRegionName: item.assignedRegionName,
        serviceDate: item.serviceDate,
      })
    })
    this.props.assetOpt(assetArr, this.state.assetCategory)
    if(type === 'transfer') {
      this.props.history.push(`/apply/transfer`)
    }
    if(type === 'compensate') {
      this.props.history.push(`/apply/compensate`)
    }
    if(type === 'invalidate') {
      this.props.history.push(`/apply/invalidate`)
    }
  }

  renderColumns(text, record, column) {
    if(this.state.isDetail) {
      return (
        <EditableCell
          editable={false}
          value={record.remark ? record.remark : ''}
        />);
    } else {
      return (
        <EditableCell
          editable={true}
          value={text.remark ? text.remark : ''}
          onChange={value => this.handleChange(value, text.key, column)}
        />);
    }
  }

  renderSelectColumns(text, record, column) {
    console.log('select', record)
    if(this.state.isDetail) {
      return (
        <SelectCell
          editable={false}
          value={record.ownerConfirm ? record.ownerConfirm : ''}
        />
      );
    } else {
      return (
        <SelectCell
          editable={true}
          value={record.ownerConfirm ? record.ownerConfirm : '10'}
          onChange={value => this.confirm(value, record.key, column)}
        />
      );
    }
  }

  handleChange(value, key, column) {
    const newData = [...this.state.tableData];
    const target = newData.filter(item => key === item.key)[0];
    if (target) {
      target[column] = value;
      this.setState({tableData: newData});
    }
  }

  confirm = (value, key, column) => {
    const newData = [...this.state.tableData];
    const target = newData.filter(item => key === item.key)[0];
    if (target) {
      target[column] = value;
      this.setState({tableData: newData});
    }
  }

  rowSelection = () => {
    const self = this
    return {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({selectedRowKeys})
      },
      onSelect: (record, selected, selectedRows) => {
        const newData = [...this.state.tableData];
        const target = newData.filter(item => record === item)[0];
        if (target) {
          if (selected) {
            let temp = this.state.selectItems
            temp.push(target)
            this.setState({selectItems: temp})
            if (temp.length === this.state.tableData.length) {
              this.setState({checkAll: true})
            }
          } else {
            let temp = this.state.selectItems
            temp.splice(temp.indexOf(target), 1)
            this.setState({selectItems: temp})
          }
        }
      },
      onSelectAll: (selected) => {
        const newData = [...this.state.tableData];
        newData.forEach((i) => {
          if (selected) {
            i.editable = true;
            this.setState({selectItems: newData, tableData: newData});
          }
          else {
            i.editable = false;
            this.setState({selectItems: [], tableData: newData});
          }
        })
      },
      selectedRowKeys: self.state.selectedRowKeys
    }
  }

  onCheckAllChange = (e) => {
    this.setState({
      selectItems: e.target.checked ? this.state.tableData : [],
      checkAll: e.target.checked,
    });
  }
  selectItem = (e) => {
    if (e.target.checked) {
      let temp = this.state.selectItems
      temp.push(e.target.value)
      this.setState({selectItems: temp})
      if (temp.length === this.state.tableData.length) {
        this.setState({checkAll: true})
      }
    } else {
      let temp = this.state.selectItems
      temp.splice(temp.indexOf(e.target.value), 1)
      this.setState({selectItems: temp})
    }
  }
  selectStatus = (status) => {
    // 选择确认状态
    if(this.state.checkBtn !== status) {
      this.searchDetail(status, 1)
      this.setState({ checkBtn: status })
    }
  }
  confirmAsset = () => {
    let param = [];
    // 资产确认
    if(this.state.selectItems.length === 0) {
      message.warning('请选择要确认的资产')
      return
    }
    for(let i of this.state.selectItems){
      if(!i.ownerConfirm || i.ownerConfirm === '00') {
        message.warning('请选择确认结果')
        break
      }
      param.push({
        snapshotId: i.snapshotId,
        comfirm: i.ownerConfirm,
        remark: i.remark || '',
      })
    }
    this.props.ownerDelConfirm(param, 'asset').then(res => {
      if(res.response && res.response.resultCode === '000000') {
        message.success('确认成功')
        this.searchDetail(this.state.checkBtn)
      } else {
        message.error(res.response.resultMessage)
        return
      }
    });
  }

  render() {
    const {checkBtn, taskName, isDetail} = this.state
    return <Form className="m-ownerDetail">
      <p>任务名称：{taskName}</p>
      <p>当前任务您共有<span> {Number(this.state.confirm) + Number(this.state.unConfirm)} </span>项参与确认，已确认<span>{this.state.confirm}</span>项，未确认<span>{this.state.unConfirm}</span>项</p>
        <div className="buttonContainer">
          <div>
            <label>确认状态</label>
            <Button className="firstButton" type={checkBtn === '' ? "primary" : ''} onClick={() => {this.selectStatus('')}} >全部</Button>
            <Button type={checkBtn === '20' ? "primary" : ''} onClick={() => {this.selectStatus('20')}}>已确认</Button>
            <Button type={checkBtn === '30' ? "primary" : ''} onClick={() => {this.selectStatus('30')}}>未确认</Button>
          </div>
          {
            !isDetail ?
              <div>
                <Button type="primary" onClick={() => {
                  this.assetOperation('transfer')
                }}>资产转移申请</Button>
                <Button type="primary" onClick={() => {
                  this.assetOperation('compensate')
                }}>资产赔偿申请</Button>
                <Button type="primary" onClick={() => {
                  this.assetOperation('invalidate')
                }}>资产报废申请</Button>
                <Button type="primary" onClick={this.confirmAsset}>资产确认</Button>
              </div> : null
          }
        </div>
      <Card className="m-card" title="" bordered={false} noHovering>
        <Row>
          <Col span={24}>
            <Table
              rowSelection={this.rowSelection()}
              columns={this.columns()}
              dataSource={this.state.tableData}
              rowKey={record => record.key}
              scroll={{x: 1500}}
              loading={this.state.loading}
              pagination={{
                showTotal: t=>`共${t}条`,
                showQuickJumper: true,
                onShowSizeChange: this.changePage,
                showSizeChanger:true,
                total: this.state.count,
                pageSize: this.state.pageSize,
                onChange: this.changePage
              }}
            />
          </Col>
        </Row>
      </Card>
    </Form>
  }
}
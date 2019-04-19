import React from 'react'
import {Card, Row, Col, Form, Button, Icon, Select, Table, Pagination, Tooltip} from 'antd'
import debounce from 'lodash/debounce'
import YearPicker from '../../common/yearPanel/yearPicker'
import './ownerConfirm.less'
import message from '../../common/Notice/notification'
const FormItem = Form.Item
const Option = Select.Option

const viewDetail = (id) => {
  window.location.href = 'ownerConfirmDetail/1'
}

class Root extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectYear: '',
      selectTask: '',
      selectStatus: '',
      task: 0, // 任务数量
      taskName: [], // 任务名称
      count: 0, // 总数
      pageNo: 1, // 页数
      pageSize: 10, // 每页
      pageCount: 1, // 当前页
      tableData: [], // 查询结果
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.searchRes !== nextProps.searchRes) {
      // 查询结果
      let newArr = []
      const {count, pageNo, pageSize, pageCount, result} = nextProps.searchRes;
      if(result) {
        result.map((arr, idx) => {
          newArr.push({
            ...arr,
            key: idx + 1,
          })
        })
      }
      this.setState({count: count, pageNo: pageNo, pageSize: pageSize, pageCount: pageCount, tableData: newArr })
    }
  }

  columnDom = () => {
    const columns = [{
      title: '序号',
      dataIndex: 'key',
    }, {
      title: '盘点年度',
      dataIndex: 'year',
    }, {
      title: '任务名称',
      dataIndex: 'taskName',
      render: (text, record) => {
        return <div className="table-action">
          <a className='table-href' onClick={() => {
            record.hasEnd === 'yes' ?
              this.goDetail(record.inventoryTaskId, record.taskStatus, 'detail') :
              this.goDetail(record.inventoryTaskId, record.taskStatus, 'confirm')
          }}>{text}</a>
        </div>
      }
    }, {
      title: '任务状态',
      dataIndex: 'taskStatusDesc',
    }, {
      title: '确认截止时间',
      dataIndex: 'assetOwnerEndDate',
    }, {
      title: '操作',
      dataIndex: 'handle',
      render: (text, record, index) => {
        return <div className="table-action">
          {
            record.hasEnd === 'yes' ?
              <Tooltip overlayClassName="ant-tooltip-icon" title="详情">
                <a onClick={()=>{this.goDetail(record.inventoryTaskId, record.taskStatus, 'detail')}}>
                  <Icon type="eye-o"/>
                </a>
              </Tooltip>:
              <Tooltip overlayClassName="ant-tooltip-icon" title="确认">
                <a onClick={()=>{this.goDetail(record.inventoryTaskId, record.taskStatus, 'confirm')}}>
                  <Icon type="check-square-o"/>
                </a>
              </Tooltip>
          }
        </div>
      },
    }];
    return columns
  }

  selectTask = (task) => {
    this.setState({selectTask: task})
  }
  selectYear = (year) => {
    this.setState({selectYear: year})
  }
  goDetail = (id, status, type) => {
    this.props.ownerStatus(status)
    if(type === 'detail') {
      this.props.history.push(`ownerConfirmDetail/${id}`)
    } else if (type === 'confirm') {
      this.props.history.push(`ownerConfirmDetail/${id}?${type}`)
    }
  }
  queryList = () => {
    // 查询
    this.props.form.validateFields((err, values) => {
      let taskName, taskStatus, year;
      if (!err) {
        if (values.taskName) {
          taskName = values.taskName
        }
        if (values.taskStatus || values.taskStatus === '') {
          taskStatus = values.taskStatus
        }
        if (this.state.selectYear !== '') {
          year = this.state.selectYear
        }
        let body = {
          year,
          taskName,
          taskStatus,
          pageNo: "1",
          pageSize: "10",
        }
        this.props.getOwnerList(body)
      } else {
        message.error('查询错误')
        return
      }
    })
  }
  handleReset = () => {
    this.selectYear(null)
    this.props.form.resetFields();
  };
  pageChange = (current, size) => {
    // 分页
    this.props.form.validateFields((err, values) => {
      let taskName, taskStatus, year;
      if (!err) {
        if (values.taskName) {
          taskName = values.taskName
        }
        if (values.taskStatus) {
          taskStatus = values.taskStatus
        }
        if (this.state.selectYear !== '') {
          year = this.state.selectYear
        }
        let body = {
          year,
          taskName,
          taskStatus,
          pageNo: current,
          pageSize: size,
        }
        this.props.getOwnerList(body)
      } else {
        message.error('查询错误')
        return
      }
    })
  }
  handleTask = debounce((value) => {
    // 所属CC 模糊查询
    if (value.trim() === '') {
      return;
    }
    this.props.getList(value.trim()).then((d) => {
      if (d.response && d.response.resultCode === '000000') {
        const result = d.response.data
        const data = []
        result.forEach((r) => {
          data.push({
            value: r.inventoryTaskId,
            text: r.taskName,
          })
        })
        this.setState({taskName: data})
      }
    })
  })

  render() {
    const {getFieldDecorator} = this.props.form;
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 14},
    };
    return <Form className="m-owner">
      <Card className="m-card" title="查询条件" bordered={false} noHovering>
        <Row>
          <Col span={8}>
            <FormItem {...formItemLayout} label="年度：">
              <YearPicker parentValue={this.state.selectYear} onSelect={this.selectYear}></YearPicker>
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="任务名称：">
              {
                getFieldDecorator('taskName', {initialValue: ''})(<Select
                  mode="combobox"
                  placeholder={'请输入任务名称'}
                  defaultActiveFirstOption={false}
                  showArrow={false}
                  filterOption={false}
                  onChange={this.handleTask}
                >
                  {
                    this.state.taskName.map(d =>
                      <Option key={d.value} value={d.text}>
                        {d.text}
                      </Option>)
                  }
                </Select>)
              }
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="任务状态：">
              {
                getFieldDecorator('taskStatus', {initialValue: '10'})(
                  <Select
                    showSearch
                    optionFilterProp="children"
                  >
                    <Option value="">全部</Option>
                    <Option value="10">进行中</Option>
                    <Option value="20">已完成</Option>
                  </Select>)
              }
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col className="taRight" span={24}>
            <FormItem>
              <Button type='primary' size="default" onClick={this.queryList} >查询</Button>
              <Button type="primary" size="default" onClick={this.handleReset}>清空</Button>
            </FormItem>
          </Col>
        </Row>
      </Card>
      <p>您当前参与的盘点任务有<span> {this.props.task ? this.props.task : 0} </span>个，请在确认截止时间之前完成确认，超期未确认的资产系统将自动确认</p>
      <Card className="m-card" title="查询结果" bordered={false} noHovering>
        <Row>
          <Col span={24}>
            <Table
              columns={this.columnDom()}
              dataSource={this.state.tableData}
              pagination={{
                showSizeChanger: true,
                onShowSizeChange: this.pageChange,
                showTotal: t=>`共${t}条`,
                showQuickJumper: true,
                total: this.state.count,
                onChange: this.pageChange
              }}
            />
          </Col>
        </Row>
      </Card>
    </Form>
  }

}

export default Form.create()(Root)
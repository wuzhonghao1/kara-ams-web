import React from 'react'
import {Card, Row, Col, Form, Button, Icon, Select, Table, Tooltip} from 'antd'
import message from '../../common/Notice/notification'
import debounce from 'lodash/debounce'
import YearPicker from '../../common/yearPanel/yearPicker'
import './ccOwnerConfirm.less'
const FormItem = Form.Item
const Option = Select.Option

class Root extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectYear: '',
      selectTask: '',
      selectStatus: '10',
      taskName: [],
      taskList: [],
      taskListCount: 0,
    }
  }

  componentWillMount () {
    this.getTaskList({
      pageNo: "1",
      pageSize: "10",
      year: "",
      taskName: "",
      taskStatus: "10" // 任务状态 进行中 10
    })
  }

  getColumns = () => {
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
              this.confirm(record.inventoryTaskId) :
              this.viewDetail(record.inventoryTaskId)
          }}>{text}</a>
        </div>
      }
    }, {
      title: '任务状态',
      dataIndex: 'taskStatusDesc',
    }, {
      title: '确认截止时间',
      dataIndex: 'ccOwnerEndDate',
    }, {
      title: '操作',
      render: (text, record) => {
        return <div className="table-action">
          {text.hasEnd === 'yes' ?
          <Tooltip overlayClassName="ant-tooltip-icon" title="确认"><a onClick={() => {
            this.confirm(text.inventoryTaskId)
          }}>
            <Icon className="handleIcon"
                  type='check-square-o'
            />
          </a>
          </Tooltip> :
          <Tooltip overlayClassName="ant-tooltip-icon" title="查看"><a onClick={() => {
            this.viewDetail(text.inventoryTaskId)
          }}>
            <Icon className="handleIcon"
                  type='eye-o'
            />
          </a></Tooltip> }
        </div>
      }
    }];
    return columns
  }

  confirm = (id) => {
    this.props.history.push(`ccOwnerConfirm/${id}?taskStatus=30`)
  }

  viewDetail = (id) => {
    this.props.history.push(`ccOwnerConfirm/${id}?view=true`)
  }

  getTaskList = (body) => {
    this.props.getTaskList(body).then(res=>{
      if(res && res.response && res.response.resultCode === '000000' && res.response.results) {
        const results = res.response.results
        const taskCount = res.response.taskCount
        const {result:taskList=[]} = results
        const newList = taskList ? taskList.map((v,k)=>({...v,key:k+1})) : []
        this.setState({taskList:newList, taskListCount: taskCount})
      }
    })
  }

  onChange = (status) => {
    this.setState({selectStatus: status})
  }
  selectTask = (task) => {
    this.setState({selectTask: task})
  }
  selectYear = (year) => {
    this.setState({selectYear: year})
  }
  queryList = (current, size) => {
    let body = {
      year: this.state.selectYear,
      taskName: this.state.selectTask,
      taskStatus: this.state.selectStatus,
      pageNo: current || "1",
      pageSize: size || "10",
    }
    this.getTaskList(body)
  }
  handleTask = debounce((value) => {
    // 所属CC 模糊查询
    if (!value || value.trim() === '') {
      return;
    }
    this.props.getList(value.trim()).then((d) => {
      if (d && d.response && d.response.resultCode === '000000') {
        const result = d.response.data ? d.response.data : []
        this.setState({taskName: result })
      }
    })
  })

  render() {
    const { taskList, taskListCount, selectYear, selectTask } = this.state
    const {getFieldDecorator} = this.props.form;
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 14},
    };
    return <Form className="m-ccowner">
      <Card className="m-card" title="查询条件" bordered={false} noHovering>
        <Row>
          <Col span={8}>
            <FormItem {...formItemLayout} label="年度：">
              <YearPicker parentValue={selectYear} onSelect={this.selectYear}></YearPicker>
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
                  onSelect={this.selectTask}
                >
                  {
                    this.state.taskName.map((v,k) =>
                      <Option key={k} value={v.taskName}>
                        {v.taskName}
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
                    onSelect={e => this.onChange(e)}
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
          <Col className="taRight">
            <FormItem>
              <Button type="primary" onClick={()=>{this.queryList()}}>查询</Button>
              <Button type="primary" onClick={()=>{this.selectYear(null);this.props.form.setFieldsValue({taskName:'',taskStatus:'10'});}}>清空</Button>
            </FormItem>
          </Col>
        </Row>
      </Card>
      <p>您当前参与的盘点任务有<span> {taskListCount} </span>个，请在确认截止时间之前完成确认，超期未确认的资产系统将自动确认</p>
      <Card className="m-card" title="查询结果" bordered={false} noHovering>
        <Row>
          <Col span={24}>
            <Table
              columns={this.getColumns()}
              dataSource={taskList}
              style={{marginBottom: '10px'}}
              pagination={{
                showSizeChanger: true,
                onShowSizeChange: this.queryList,
                showTotal: t=>`共${t}条`,
                showQuickJumper: true,
                total: this.state.count,
                pageSize: this.state.pageSize,
                current: this.state.pageNo,
                onChange: this.queryList
              }}
            />
          </Col>
        </Row>
      </Card>
    </Form>
  }

}

export default Form.create()(Root)
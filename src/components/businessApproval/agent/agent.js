import React from 'react'
import { Card, Row, Col, Form, Input, Icon, Select, Table, Button, Modal, Tooltip } from 'antd'
import message from '../../common/Notice/notification'
import StaffFinder from '../../common/staffFinder/staffFinder'
import AgentDel from './agentDel'
import './agent.less'
import AgentAdd from './agentAdd'
const FormItem = Form.Item;
const Option = Select.Option;

class ApproveProxy extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      showAgent: false,
      showAgented: false,
      showEdit: false,
      isSysManger: false,
      selAgent: {},
      deleteId: '',
      editObj: {},
      pageNo: 0,
      pageSize: 0,
      pageCount: 0,
      count: 0,
    }
  }

  componentWillMount() {
    const roleArr = this.props.user.roleInfos
    roleArr.map(i => {
      if(i.userRole === 'SYSTEM_MANAGER'){
        this.setState({ isSysManger: true })
      }
    })
    this.props.getApplyStatus()
    this.props.getVoucherTypeParam()
    this.props.getAssetCategoryParam()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.agentInfo !== nextProps.agentInfo) {
      // 设置搜索pageinfo
      this.setState({
        pageNo: nextProps.agentInfo.pageNo,
        count: nextProps.agentInfo.count,
        pageCount: nextProps.agentInfo.pageCount,
        pageSize: nextProps.agentInfo.pageSize,
      })
    }
  }

  componentDidMount() {
    // 设置默认被代理人
    const { accountId, accountName } = this.props.user
    this.props.form.setFieldsValue({ approverAccountId: accountId , approverName: accountName })
    this.searchAgent()
  }

  deleteAgent = (record) => {
    // 删除审批代理人记录 approveAgentId
    if (this.state.deleteId === record.approveAgentId) {
      this.setState({ showDelete: true });
    } else {
      this.setState({ showDelete: true, deleteId: record.approveAgentId });
    }
  }

  initEditObj = () => {
    // 初始化编辑对象
    this.setState({ editObj: {} })
  }

  agentDelOk = () => {
    // 确认删除
    this.props.approvalAgentDel(this.state.deleteId).then(result => {
      if (result.response.resultCode !== '000000') {
        message.error(result.response.resultMessage);
      } else {
        message.success('删除成功');
        this.searchAgent(); // 更新列表
        this.cancelDelete();
      }
    });
  }

  onCancel = (e) => {
    e.preventDefault();
    this.setState({ visible: false, editObj: {} });
  };

  handleAdd = (e) => {
    e.preventDefault();
    this.setState({visible: true});
  };

  handleReset = () => {
    this.props.form.resetFields();
  };

  handleOk = () => {
    this.setState({ showAgent: false, showAgented: false });
  }

  handleCancel = () => {
    this.setState({ showAgent: false, showAgented: false });
  }

  editAgent = (record) => {
    //编辑代理审批人 this.props.approvalAgentUpdate()
    this.setState({
      visible: true,
      editObj: record
    });
  }

  cancelDelete = () => {
    // 取消删除
    this.setState({ showDelete: false });
  }

  selectAgented = (staff)=> {
    // 被代理人
    const { accountId, accountName } = staff[0]
    this.props.form.setFieldsValue({ approverAccountId: accountId , approverName: accountName })
    this.handleCancel()
  }

  selectAgent = (staff)=> {
    // 代理人
    const { accountId, accountName } = staff[0]
    this.props.form.setFieldsValue({ agentAccountId: accountId , agentName: accountName })
    this.handleCancel()
  }

  changePage = (current, size) => {
    // 翻页
    this.props.form.validateFields((err, values) => {
      let agentAccountId, approverAccountId, status;
      if (values.approverAccountId !== '') {
        approverAccountId = values.approverAccountId;
      }
      if (values.agentAccountId !== '') {
        agentAccountId = values.agentAccountId;
      }
      if (values.status !== '') {
        status = values.status;
      }
      // 管理员审批代理人
      this.props.getAdminAgents({pageNo: current, pageSize: size, approverAccountId, agentAccountId, status});
      // 自己的审批代理人
      //this.props.getMyAgents({pageNo: 1, pageSize: 10, approverAccountId: user.accountId, agentAccountId, status});
    })
  }

  searchAgent = (e) => {
    if (e) { e.preventDefault(); }
    this.props.form.validateFields((err, values) => {
      let agentAccountId, approverAccountId, status;
      if (values.approverAccountId !== '') {
        approverAccountId = values.approverAccountId;
      }
      if (values.agentAccountId !== '') {
        agentAccountId = values.agentAccountId;
      }
      if (values.status !== '') {
        status = values.status;
      }
      if(this.state.isSysManger) {
        // 管理员审批代理人
        this.props.getAdminAgents({pageNo: 1, pageSize: 10, approverAccountId, agentAccountId, status});
      } else {
        // 自己的审批代理人
        this.props.getMyAgents({pageNo: 1, pageSize: 10, agentAccountId, status});
      }
    })
  }

  render() {
    const columns = [{
      title: '序号',
      dataIndex: 'number',
      rowKey: 'number',
      className:'tHeader',
      width: 30,
    }, {
      title: '被代理人姓名',
      dataIndex: 'approverName',
      rowKey: 'approverName',
      className:'tHeader',
      width: 60,
    }, {
      title: '被代理人工号',
      dataIndex: 'approverStaffCode',
      key: 'approverStaffCode',
      className:'tHeader',
      width: 60,
    }, {
      title: '被代理人所属部门',
      dataIndex: 'approverOrgName',
      key: 'approverOrgName',
      className:'tHeader',
      width: 150,
    }, {
      title: '代理人姓名',
      dataIndex: 'agentName',
      key: 'agentName',
      className:'tHeader',
      width: 60,
    }, {
      title: '代理人工号',
      dataIndex: 'agentStaffCode',
      key: 'agentStaffCode',
      className:'tHeader',
      width: 60,
    }, {
      title: '代理人所属部门',
      dataIndex: 'agentOrgName',
      key: 'agentOrgName',
      className:'tHeader',
      width: 150,
    }, {
      title: '生效日期',
      dataIndex: 'beginDate',
      key: 'beginDate',
      className:'tHeader',
      width: 120,
    }, {
      title: '失效日期',
      dataIndex: 'endDate',
      key: 'endDate',
      className:'tHeader',
      width: 120,
    },{
      title: '操作',
      className:'tHeader',
      key: 'operation',
      fixed: 'right',
      width: 80,
      render: (text, record, index) => {
        return (<div className="table-action" style={record.valid === 'yes' ? {} : {display: 'none'}}>
          <Tooltip overlayClassName="ant-tooltip-icon" title="编辑">
            <a onClick={() => { this.editAgent(record) }}>
              <Icon type="edit"/>
            </a>
          </Tooltip>
          <Tooltip overlayClassName="ant-tooltip-icon" title="删除">
            <a onClick={() => { this.deleteAgent(record) }}>
              <Icon type="delete"/>
            </a>
          </Tooltip>
        </div>)
      },
    }];
    const { agentInfo } = this.props;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 14 },
    };
    const layoutProps = {
      labelCol: {
        span: 7
      },
      wrapperCol: {
        span: 17
      }
    }
    let agentArr = [];
    agentInfo && agentInfo.result ? agentInfo.result.map((item, idx) => {
      agentArr.push({
        ...item,
        number: idx + 1,
      })
    }) : null;
    return <Form className="m-invalidate">
      <Card className="m-card border-bottom" title="查询条件" bordered={false} noHovering>
        <Row>
          <Col span={8}>
            <FormItem style={{display: 'none'}} {...layoutProps} label="被代理人信息：">
              {getFieldDecorator('approverAccountId')(
                <Input style={{display: 'none'}} disabled />
              )}
            </FormItem>
            <FormItem {...layoutProps} label="被代理人信息：">
              <div className={`u-select-user-input ${this.state.isSysManger ? '' : 'disabled'}`} onClick={()=>{this.state.isSysManger ?this.setState({showAgented: true}) : null}}>
                {getFieldDecorator('approverName')(
                  <Input disabled suffix={<Icon type="search"/>} />
                )}
              </div>
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem style={{display: 'none'}} {...layoutProps} label="代理人信息：">
              {getFieldDecorator('agentAccountId')(
                <Input style={{display: 'none'}} disabled />
              )}
            </FormItem>
            <FormItem {...layoutProps} label="代理人信息：">
              <div className="u-select-user-input" onClick={()=>{this.setState({showAgent: true})}}>
                {getFieldDecorator('agentName')(
                  <Input disabled suffix={<Icon type="search"/>} />
                )}
              </div>
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="代理状态：">
              {getFieldDecorator('status')(
                <Select
                  showSearch
                  optionFilterProp="children"
                >
                  <Option value="yes">有效</Option>
                  <Option value="no">无效</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem className="btn">
              <Button type="primary" size="default" onClick={this.searchAgent}>查询</Button>
              <Button type="primary" size="default" onClick={this.handleReset}>清空</Button>
            </FormItem>
          </Col>
        </Row>
      </Card>
      <Card
        className="m-card"
        bordered={false}
        noHovering
      >
        <h1>
          查询结果
          <Button style={{float: 'right', marginRight: '20px'}} type="primary" size="default" onClick={this.handleAdd}>
            新增
          </Button>
        </h1>
        <Table
          columns={columns}
          dataSource={agentArr}
          rowKey={record => record.number}
          style={{marginTop: '10px'}}
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
        />
      </Card>
      {
        this.state.visible ?
          <Modal
            width={600}
            visible={this.state.visible}
            onCancel={this.onCancel}
            footer={null}
          >
            <AgentAdd
              selAgent={this.state.selAgent}
              handleCancel={this.onCancel}
              user={this.props.user}
              approvalAgentAdd={this.props.approvalAgentAdd}
              approvalAgentUpdate={this.props.approvalAgentUpdate}
              dictionary={this.props.dictionary}
              dispatch={this.props.dispatch}
              searchAgent={this.searchAgent}
              isSysManger={this.state.isSysManger}
              editObj={this.state.editObj}
            />
          </Modal> : null
      }
      {
        this.state.showAgent ?
          <Modal
            visible={this.state.showAgent}
            title="员工查询"
            width="1000px"
            footer={null}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
          >
            <StaffFinder
              dispatch={this.props.dispatch}
              useAmsPai
              valid='yes'
              multiple={false}
              keywords={this.state.keywords}
              selectStaff={this.selectAgent}
              companyData={this.props.dictionary.companyList}
              regionData={this.props.dictionary.regionList}
              buData={this.props.dictionary.sbuList}
              ccData={this.props.dictionary.ccList ? this.props.dictionary.ccList : []}
            />
          </Modal> : null
      }
      {
        this.state.showAgented ?
          <Modal
            visible={this.state.showAgented}
            title="员工查询"
            width="1000px"
            footer={null}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
          >
            <StaffFinder
              dispatch={this.props.dispatch}
              useAmsPai
              valid='yes'
              multiple={false}
              keywords={this.state.keywords}
              selectStaff={this.selectAgented}
              companyData={this.props.dictionary.companyList}
              regionData={this.props.dictionary.regionList}
              buData={this.props.dictionary.sbuList}
              ccData={this.props.dictionary.ccList ? this.props.dictionary.ccList : []}
            />
          </Modal> : null
      }
      <Modal
        title="删除审批代理人"
        visible={this.state.showDelete}
        onCancel={this.cancelDelete}
        onOk={this.agentDelOk}
      >
        <p>你确定要删除吗？</p>
      </Modal>
    </Form>
  }
}

export default Form.create()(ApproveProxy)

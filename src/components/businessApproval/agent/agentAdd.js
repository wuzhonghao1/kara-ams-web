import React from 'react';
import { Form, Icon, Select, Input, Button, DatePicker, Modal, Row, Col } from 'antd';
import message from '../../common/Notice/notification'
import moment from 'moment';
import StaffFinder from '../../common/staffFinder/staffFinder'
const FormItem = Form.Item;
const Option = Select.Option;
/**
 * 汇款账号维护添加组件
 */
class AgentAddForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAgent: false,
      showAgented: false,
      isSystemManger: false, // 是否系统管理员
    }
  }
  componentWillMount() {
    if(this.props.user.roleInfos) {
      this.props.user.roleInfos.map(item => {
        if(item.userRole === 'SYSTEM_MANAGER') {
          this.setState({ isSystemManger: true })
        }
      })
    }
  }
  componentDidMount() {
    const { accountId, accountName } = this.props.user
    const { editObj } = this.props;
    const isEdit = JSON.stringify(editObj) !== '{}';
    if (!isEdit) {
      this.props.form.setFieldsValue({ approverAccountId: accountId , approverName: accountName })
    }
  }

  handleSubmit = (e) => {
    const { editObj } = this.props;
    const isEdit = JSON.stringify(editObj) !== '{}';
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      let approveAccountId, agentAccountId, beginTime, endTime
      if (!values.approverAccountId) {
        if (isEdit) {
          approveAccountId = editObj.approverAccountId;
        } else {
          // 被代理人
          message.error('请选择被代理人');
          return false
        }
      } else {
        approveAccountId = values.approverAccountId;
      }
      if (!values.agentAccountId) {
        if (isEdit) {
          agentAccountId = editObj.agentAccountId;
        } else {
          // 代理人
          message.error('请选择代理人');
          return false
        }
      } else {
        agentAccountId = values.agentAccountId;
      }
      if (!values.beginTime) {
        // 开始时间
        if (isEdit) {
          beginTime = editObj.beginDate;
        } else {
          message.error('请选择生效日期');
          return false
        }
      } else {
        beginTime = values.beginTime.format("YYYYMMDD HH:mm:ss")
      }
      if (values.endTime) {
        endTime = values.endTime.format("YYYYMMDD HH:mm:ss")
      } else {
        endTime = editObj.endDate;
      }
      if (isEdit) {
        // 编辑
        const params = {
          approveAgentId: editObj.approveAgentId,
          approveAccountId: approveAccountId,
          agentAccountId: agentAccountId,
          beginTime: beginTime,
          endTime: endTime,
        }
        this.props.approvalAgentUpdate(params).then(result => {
          if (result.response.resultCode === '000000') {
            message.success('编辑成功');
            this.props.searchAgent(e);
            this.props.handleCancel(e);
          } else {
            message.error(result.response.resultMessage);
          }
        })
      } else {
        // 新建
        this.props.approvalAgentAdd({approveAccountId, agentAccountId, beginTime, endTime}).then(result => {
          if (result.response.resultCode === '000000') {
            message.success('保存成功');
            this.props.searchAgent(e);
            this.props.handleCancel(e);
          } else {
            message.error(result.response.resultMessage);
          }
        })
      }
    })
  };

  handleOk = () => {
    this.setState({ showAgent: false, showAgented: false });
  }

  handleCancel = () => {
    this.setState({ showAgent: false, showAgented: false });
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

  render() {
    const { getFieldDecorator } = this.props.form;
    const { editObj } = this.props;
    const isEdit = JSON.stringify(editObj) !== '{}';
    const formItemLayout = {
      labelCol: {
        sm: { span: 6 },
      },
      wrapperCol: {
        sm: { span: 15 },
      },
    };
    const endTime = () => {
      if (isEdit && editObj.endDate !== '') {
        return {initialValue: moment(editObj.endDate, 'YYYY-MM-DD HH:mm:ss')}
      }
    }
    const beginTime = () => {
      if (isEdit) {
        return {
          rules: [{required: true,  message: '请选择生效日期'}],
          initialValue: moment(editObj.beginDate, 'YYYY-MM-DD HH:mm:ss'),
        }
      } else {
        return {
          rules: [{required: true,  message: '请选择生效日期'}],
        }
      }
    }
    return(
      <Form onSubmit={this.handleSubmit} style={{marginTop: '25px'}}>
        <Row>
          <Col span={24}>
            <FormItem style={{display: 'none'}} {...formItemLayout} label="被代理人信息：">
              {getFieldDecorator('approverAccountId')(
                <Input style={{display: 'none'}} disabled />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem {...formItemLayout} label="被代理人信息：">
              <div
                className={`u-select-user-input ${this.state.isSystemManger ? '' : 'disabled'}`}
                style={{ width: 300 }}
                onClick={this.state.isSystemManger ? ()=>{this.setState({showAgented: true})} :null}
              >
                {getFieldDecorator('approverName', {
                  rules: [{required: true, message: '请选择被代理人'}],
                  initialValue: !isEdit ? '' : editObj.approverName,
                })(
                  <Input disabled suffix={<Icon type="search"/>} />
                )}
              </div>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem style={{display: 'none'}} {...formItemLayout} label="代理人信息：">
              {getFieldDecorator('agentAccountId')(
                <Input style={{display: 'none'}} disabled />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem {...formItemLayout} label="代理人信息：">
              <div className="u-select-user-input" style={{ width: 300 }} onClick={()=>{this.setState({showAgent: true})}}>
                {getFieldDecorator('agentName', {
                  rules: [{required: true,  message: '请选择代理人'}],
                  initialValue: !isEdit ? '' : editObj.agentName,
                })(
                  <Input disabled suffix={<Icon type="search"/>} />
                )}
              </div>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formItemLayout}
              label="生效日期"
              hasFeedback
            >
              {getFieldDecorator('beginTime', beginTime())(
                <DatePicker
                  style={{ width: 300 }}
                  showTime
                  format={'YYYY-MM-DD HH:mm:ss'}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formItemLayout}
              label="失效日期"
              hasFeedback
            >
              {getFieldDecorator('endTime', endTime())(
                <DatePicker
                  style={{ width: 300 }}
                  showTime
                  format={'YYYY-MM-DD HH:mm:ss'}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem>
              <div className="footer">
                <Button type="primary" onClick={(e) => this.props.handleCancel(e)}>取消</Button>
                <Button className="save" type="primary" htmlType="submit">保存</Button>
              </div>
            </FormItem>
          </Col>
        </Row>
        {
          this.state.showAgent ?
            <Modal
              visible={this.state.showAgent}
              title="员工查询"
              width="1000px"
              footer={null}
              onOk={this.handleOk}
              onCancel={this.handleCancel}
              zIndex={1001}
            >
              <StaffFinder
                dispatch={this.props.dispatch}
                multiple={false}
                keywords={this.state.keywords}
                valid="no"
                useAmsPai
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
              bgCode={sessionStorage.getItem('bgCode')}
              onOk={this.handleOk}
              onCancel={this.handleCancel}
              zIndex={1001}
            >
              <StaffFinder
                valid="no"
                useAmsPai
                dispatch={this.props.dispatch}
                multiple={false}
                keywords={this.state.keywords}
                bgCode={sessionStorage.getItem('bgCode')}
                selectStaff={this.selectAgented}
                companyData={this.props.dictionary.companyList}
                regionData={this.props.dictionary.regionList}
                buData={this.props.dictionary.sbuList}
                ccData={this.props.dictionary.ccList ? this.props.dictionary.ccList : []}
              />
            </Modal> : null
        }
      </Form>
    )
  }
}

const AgentAdd = Form.create()(AgentAddForm);

export default AgentAdd;
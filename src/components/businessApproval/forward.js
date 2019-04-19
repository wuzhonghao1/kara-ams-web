/**
 * Created by Berlin on 2017/11/30.
 */
import React from 'react';
import './Search.css'
import StaffFinder from '../common/staffFinder/staffFinder'
import { Form, Icon, Input, Button, Modal, Row, Col, Spin } from 'antd';
import message from '../common/Notice/notification'
import {taskDelivery} from '../../actions/approve/agent'
const FormItem = Form.Item;

class TaskForward extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      loading: false,
    }
  }
  handleOk = () => {
    this.setState({ visible: false });
  }
  handleCancel = () => {
    this.setState({ visible: false });
  }
  selectStaff = (staff)=> {
    const { personId, accountName } = staff[0]
    this.props.form.setFieldsValue({ personId: personId , accountName: accountName })
    this.handleCancel()
  }
  handleSub = () => {
    const { forwardId, checkLists } = this.props;
    // 确认转发
    this.props.form.validateFields((err, value) => {
      if (!value.accountName) {
        message.error('请选择要转发的员工');
        return false;
      }
      if (!value.input) {
        message.error('请填写转发原因');
        return false;
      }
      if (forwardId.length > 0) {
        const params = {
          approveIds: forwardId,
          deliverPersonId: value.personId,
          deliverReason: value.input
        }
        this.setState({ loading: true })
        this.props.dispatch(taskDelivery(params)).then(result => {
          this.setState({ loading: false })
          if(result.response.resultCode === '000000') {
            message.success('转发成功')
            if(this.props.doSearch) {this.props.doSearch()}
            this.props.history.push('/businessApproval/search')
            this.props.onCancel();
          } else {
            message.error(result.response.resultMessage)
          }
        })
      } else {
        const params = {
          approveIds: checkLists,
          deliverPersonId: value.personId,
          deliverReason: value.input
        }
        this.props.dispatch(taskDelivery(params)).then(result => {
          if(result.response.resultCode === '000000') {
            message.success('转发成功')
            if(this.props.doSearch) {this.props.doSearch()}
            this.props.history.push('/businessApproval/search')
            this.props.onCancel();
          } else {
            message.error(result.response.resultMessage)
          }
        })
      }
    })
  }
  render() {
    const { dictionary } = this.props;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        sm: { span: 6 },
      },
      wrapperCol: {
        sm: { span: 8 },
      },
    };
    return (
      <Form>
        <Spin spinning={this.state.loading}>
          <FormItem style={{display: 'none'}} {...formItemLayout} label="请选择任务转交人：">
            {getFieldDecorator('personId')(
              <Input style={{display: 'none'}} disabled />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="转交至：">
            <div className="u-select-user-input" style={{width: '300px'}} onClick={()=>{this.setState({visible: true})}}>
              {getFieldDecorator('accountName')(
                <Input disabled suffix={<Icon type="search"/>}/>
              )}
            </div>
          </FormItem>
          <FormItem {...formItemLayout} label="转发原因：">
            <div className="u-select-user-input" style={{width: '300px'}}>
              {getFieldDecorator('input')(
                <Input size='large'/>
              )}
            </div>
          </FormItem>
          <Row>
            <Col span={23} style={{textAlign: 'right'}}>
              <Button onClick={this.props.onCancel}>取消</Button>&emsp;&emsp;
              <Button type="primary" onClick={this.handleSub}>确认</Button>
            </Col>
          </Row>
          <Modal
            visible={this.state.visible}
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
              selectStaff={this.selectStaff}
              companyData={dictionary.companyData}
              regionData={dictionary.regionData}
              buData={dictionary.sbuList}
            />
          </Modal>
        </Spin>
      </Form>)
  }
}

const Forward = Form.create()(TaskForward);
export default Forward;
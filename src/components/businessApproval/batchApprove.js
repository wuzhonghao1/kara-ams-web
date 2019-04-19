/**
 * Created by Berlin on 2017/12/7.
 */
import React from 'react'
import './Search.css'
import { Form, Icon, Input, Button, Row, Col } from 'antd';
import message from '../common/Notice/notification'
const FormItem = Form.Item;

class Root extends React.Component {
  approve = () => {
    // 通过
    const { approveBatch, checkLists } = this.props;
    this.props.form.validateFields((err, values) => {
      if(!values.input) {
        approveBatch({
          approveIds: checkLists,
          approveStatus: 'yes',
        }).then(res => {
          if(res.response.resultCode === '000000') {
            message.success('审批成功')
            this.props.doSearch()
            this.props.onCancel();
          } else {
            message.error(res.response.resultMessage);
            this.props.doSearch()
            this.props.onCancel();
          }
        })
      } else {
        approveBatch({
          approveIds: checkLists,
          approveStatus: 'yes',
          approveRemark: values.input
        }).then(res => {
          if(res.response.resultCode === '000000') {
            message.success('审批成功')
            this.props.doSearch()
            this.props.onCancel();
          } else {
            message.error(res.response.resultMessage);
            this.props.doSearch()
            this.props.onCancel();
          }
        })
      }
    })
  }

  reject = () => {
    // 驳回
    const { approveBatch, checkLists } = this.props;
    this.props.form.validateFields((err, values) => {
      if(!values.input) {
        message.warning('请填写驳回原因');
        return false
      } else {
        approveBatch({
          approveIds: checkLists,
          approveStatus: 'no',
          approveRemark: values.input
        }).then(res => {
          if(res.response.resultCode === '000000') {
            message.success('审批成功')
            this.props.doSearch()
            this.props.onCancel();
          } else {
            message.error(res.response.resultMessage);
            this.props.doSearch()
            this.props.onCancel();
          }
        })
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        sm: { span: 6 },
      },
      wrapperCol: {
        sm: { span: 8 },
      },
    };
    return(<Form>
      <FormItem {...formItemLayout} label="审批意见：">
        <div className="u-select-user-input" style={{width: '300px'}}>
          {getFieldDecorator('input')(
            <Input size='large'/>
          )}
        </div>
      </FormItem>
      <Row>
        <Col span={23} style={{textAlign: 'right'}}>
          <Button onClick={this.reject}>驳回</Button>&emsp;&emsp;
          <Button type="primary" onClick={this.approve}>确认</Button>
        </Col>
      </Row>
    </Form>)
  }
}

export default Form.create()(Root)
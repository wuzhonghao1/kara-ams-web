import React from 'react'
import { Card, Row, Col, Form, Radio, Input, AutoComplete, Icon, Select, Table, Button, Modal } from 'antd'
import StaffFinder from '../../common/staffFinder/staffFinder'
import './role.less'
import message from '../../common/Notice/notification'
const FormItem = Form.Item
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const Option = Select.Option
const { TextArea } = Input;


class Root extends React.Component {
  state = {
  }

  onSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const  {roleDesc,userRole} = values
        const params = {roleDesc,userRole}
        this.props.addCustomRole(params).then(res => {
          if(res.response && res.response.resultCode === '000000') {
            message.success('添加成功')
            this.props.refresh()
          } else {
            message.error(res.response.resultMessage)
            return
          }
        })
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {labelCol: { span: 8 }, wrapperCol: { span: 14 }};

    return <div>
      <Form className="m-system-role">
        <Card className="m-card border-bottom" title="添加角色" bordered={false} noHovering>
          <Row>
            <Col span={8}>
              <FormItem {...formItemLayout} label="角色名称">
                {getFieldDecorator('roleDesc')(
                  <Input/>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="角色标示">
                {getFieldDecorator('userRole')(
                  <Input placeholder="大写英文" />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem>
                <Button type="primary" size="default" onClick={this.onSubmit}>添加</Button>
              </FormItem>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  }

}

export default Form.create()(Root)
import React from 'react'
import './Search.less'
import StaffFinder from '../common/staffFinder/staffFinder'
import message from '../common/Notice/notification'
import {Form, Input, Row, Col, Modal, Icon, Checkbox, Button } from 'antd';
const FormItem = Form.Item;

class ChangeApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      isAll: false
    }
  }
  // staffFiner
  searchStaff = () => {
    this.setState({ visible: true })
  }
  closeStaff = () => {
    this.setState({ visible: false })
  }
  selectStaff = (staff)=> {
    // 被代理人
    const { personId, accountName } = staff[0]
    this.props.form.setFieldsValue({ newPersonId: personId , newPersonName: accountName })
    this.closeStaff()
  }
  handleSubmit = (e) => {
    // 转移 taskApprovePersonId 当前责任人personId
    if(e) { e.preventDefault() }
    const {isAll} = this.state
    const {changeApprover, batchChangeApprover, dispatch, info} = this.props
    this.props.form.validateFields((err, values) => {
      if(!err) {
        if(isAll) {
          // 批量
          const params = {
            originalPersonId: info.taskApprovePersonId,
            newPersonId: values.newPersonId
          }
          dispatch(batchChangeApprover(params)).then(res => {
            if(res && res.response && res.response.resultCode === '000000') {
              message.success('转移成功')
              this.props.doSearch()
              this.props.onCancel()
            } else {
              message.error(res.response.resultMessage)
              return
            }
          })
        } else {
          // 单个
          const params = {
            approveId: info.approveId,
            newPersonId: values.newPersonId
          }
          changeApprover(params).then(res => {
            if(res && res.response && res.response.resultCode === '000000') {
              message.success('转移成功')
              this.props.doSearch()
              this.props.onCancel()
            } else {
              message.error(res.response.resultMessage)
              return
            }
          })
        }
      }
    })
  }
  render() {
    const {info} = this.props
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {labelCol: { span: 10 }, wrapperCol: { span: 10 }};
    return(<Form onSubmit={this.handleSubmit}>
      <Row>
        <Col span={23}>
          <FormItem {...formItemLayout} label="原审批人员工编号：">
            <span>{info.taskApproveStaffCode}</span>
          </FormItem>
        </Col>
        <Col span={23}>
          <FormItem {...formItemLayout} label="原审批人姓名：">
            <span>{info.taskApproveName}</span>
          </FormItem>
        </Col>
        <Col span={23}>
          <FormItem style={{display: 'none'}} {...formItemLayout} label="当前审批人姓名：">
            {getFieldDecorator('newPersonId')(
              <Input style={{display: 'none'}} disabled />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="当前审批人姓名：">
            <div className="u-select-user-input" style={{ width: 200 }} onClick={this.searchStaff}>
              {getFieldDecorator('newPersonName', {
                rules: [{required: true,  message: '请选择当前审批人'}],
              })(
                <Input disabled suffix={<Icon type="search"/>} />
              )}
            </div>
          </FormItem>
        </Col>
        <Col span={23}>
          <FormItem {...formItemLayout} label="让当前审批人审批全部单据：">
            <Checkbox onChange={(e) => {this.setState({ isAll: e.target.checked })}}/>
          </FormItem>
        </Col>
        <Col span={23} style={{textAlign: 'right'}}>
          <Button type="primary" onClick={this.props.onCancel}>取消</Button>
          <Button type="primary" htmlType="submit">保存</Button>
        </Col>
      </Row>
      <Modal
        visible={this.state.visible}
        title="员工查询"
        width="1000px"
        footer={null}
        onCancel={this.closeStaff}
      >
        <StaffFinder
          dispatch={this.props.dispatch}
          multiple={false}
          valid="no"
          useAmsPai
          bgCode={this.props.bgCode}
          keywords={''}
          selectStaff={this.selectStaff}
          companyData={this.props.companyData}
          regionData={this.props.regionData}
          buData={this.props.buData}
          ccData={this.props.ccData}
        />
      </Modal>
    </Form>)
  }
}

export default Form.create()(ChangeApp)
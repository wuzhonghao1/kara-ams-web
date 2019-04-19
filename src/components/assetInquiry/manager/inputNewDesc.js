/**
 * 只有当前用户角色是roleInfos.userRole === SUPER_ASSET_MANAGER, 才允许修改
 */
import React from 'react'
import { Form, Input, Button } from 'antd';
const { TextArea } = Input;
const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 17 },
};

class InputNewDesc extends React.Component {
  state = {
    loading: false,
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
      // console.log('新描述： values', values)
      this.setState({ loading: true })
      this.props.updateAssetDesc({
        assetIds: this.props.selectedRows,
        description: values.newDesc,
      }).then((result) => {
        if (result && result.response && result.response.resultCode === '000000') {
          this.setState({loading: false})
          // 刷新列表
          this.props.handleSearch(e);
          this.props.form.resetFields();
          this.props.onCancel();
          } else {
          this.setState({ loading: false })
          this.props.form.resetFields();
          this.props.onCancel();
          throw new Error(result)
        }
      })
    });
  }
  
  cancel = () => {
    this.props.form.resetFields();
    this.props.onCancel();
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem {...formItemLayout} label="新的资产描述">
          {getFieldDecorator('newDesc', {
            rules: [{
              required: true,
              message: '请输入新的资产描述',
            }],
          })(
            <TextArea rows={4} />
            )}
        </FormItem>
        <div style={{textAlign: 'right'}}>
          <Button style={{marginTop: '12px'}} onClick={this.cancel}>
            取消
          </Button>
          <Button loading={this.state.loading} type="primary" htmlType="submit">
            确定
          </Button>
        </div>
      </Form>
    );
  }
}

export default Form.create()(InputNewDesc)
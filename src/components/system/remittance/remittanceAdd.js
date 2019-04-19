import React from 'react';
import './remittanceAccount.css'
import { Form, Row, Col, Select, Input, Button } from 'antd';
import message from '../../common/Notice/notification'
const FormItem = Form.Item;
const Option = Select.Option;
/**
 * 汇款账号维护添加组件
 */
class RemittanceAddForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      regionId: [],
    }
  }
  componentDidMount() {
    const { regionInfos } = this.props.selectedRemit
    const { regionList } = this.props
    let ids = []
    let names = []
    if(regionInfos && regionInfos.length > 0) {
      if (regionList[0].flexValue !== 'allReg') {
        if (regionList.length === regionInfos.length) {
          ids.push('allReg');
          names.push('全部')
        } else {
          regionInfos.map(item => {
            ids.push(item.regionId);
            names.push(item.regionName)
          })
        }
      } else {
        if (Number(regionList.length) - 1 === regionInfos.length) {
          ids.push('allReg');
          names.push('全部')
        } else {
          regionInfos.map(item => {
            ids.push(item.regionId);
            names.push(item.regionName)
          })
        }
      }
      this.setState({ regionId: ids, regionName: names })
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const {remittanceAccountId} = this.props.selectedRemit;
        const {regionIds = []} = values
        let allRegArr = [];
        let region = []
        this.props.regionList.map(k => {
          if(k.flexValue !== 'allReg') {
            allRegArr.push(k.flexValue);
          }
        })
        let isAll = false;
        regionIds && regionIds.map(item => {
          if(item === 'allReg') {
            isAll = true;
          }
        })
          if(regionIds && regionIds.length > 0) {
            if(isAll) {
              region=allRegArr
            } else {
              region=regionIds
            }
          }
          const updateParams = {
            ...values,
            regionIds: region,
            remittanceAccountId,
          };
        if (remittanceAccountId) {
          this.props.remitAccountUpdate(updateParams).then(res => {
            if (res.response && res.response.resultCode === '000000') {
              message.success('保存成功')
              this.props.handleSearch()
              this.props.handleCancel()
            } else {
              message.error(res.response.resultMessage)
              this.props.handleSearch()
              return
            }
          });
        } else {
          this.props.remitAccountAdd(updateParams).then(res => {
            if (res.response && res.response.resultCode === '000000') {
              message.success('保存成功')
              this.props.handleSearch()
              this.props.handleCancel()
            } else {
              message.error(res.response.resultMessage)
              this.props.handleSearch()
              return
            }
          })
        }
      };
    })
  }

  // 获取地区option
  getRegionOption = (regionList) => {
    if (regionList[0].flexValue !== 'allReg') {
      regionList.unshift({
        description: "全部", flexValue: "allReg"
      })
    }
    return regionList.map(v=><Option key={v.flexValue} value={v.flexValue}>{v.description}</Option>)
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { companyList, regionList, selectedRemit } = this.props;
    const formItemLayout = {
      labelCol: {
        sm: { span: 6 },
      },
      wrapperCol: {
        sm: { span: 12 },
      },
    };
    return(
      <Form onSubmit={this.handleSubmit}>
        <Row>
          <Col span={24}>
            <FormItem
                {...formItemLayout}
                label="公司"
                hasFeedback
            >
                {getFieldDecorator('companyId', {
                  rules: [{required: true, message: '请选择公司!',}],
                  initialValue: selectedRemit.companyId})(
                    <Select
                        style={{ width: 300 }}
                    >
                        {
                            companyList.map(company =>
                                <Option key={company.flexValue} value={company.flexValue}>{company.description}</Option>
                            )
                        }
                    </Select>
                )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
                {...formItemLayout}
                label="地区"
                hasFeedbacks
            >
                {getFieldDecorator('regionIds', {
                    rules: [{required: true, message: '请选择地区!'}],
                    initialValue: this.state.regionId.length !== 0 ? this.state.regionId : []
                })(
                    <Select
                        style={{ width: 300 }}
                        mode="multiple"
                        showSearch
                        allowClear
                    >
                        {this.getRegionOption(regionList)}
                    </Select>
                )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
                {...formItemLayout}
                label="公司全称"
                hasFeedback
            >
                {getFieldDecorator('companyFullName', {rules: [{required: true, message: '请输入公司全称!',}], initialValue: selectedRemit.companyFullName})(
                    <Input placeholder="公司全称" style={{ width: 300 }}/>
                )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
                {...formItemLayout}
                label="银行开户行名称"
                hasFeedback
            >
                {getFieldDecorator('accountBankName', {rules: [{required: true, message: '请输入银行开户名称!',}], initialValue: selectedRemit.accountBankName})(
                    <Input placeholder="银行开户名称" style={{ width: 300 }}/>
                )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
                {...formItemLayout}
                label="开户行账号"
                hasFeedback
            >
                {getFieldDecorator('accountBankcard', {rules: [{required: true, message: '请输入开户行账号!',}], initialValue: selectedRemit.accountBankcard})(
                    <Input placeholder="开户行账号" style={{ width: 300 }}/>
                )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem>
              <div className="footer">
                <Button type="primary" onClick={() => this.props.handleCancel()}>取消</Button>
                <Button className="save" type="primary" htmlType="submit">保存</Button>
              </div>
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
}

const RemittanceAdd = Form.create()(RemittanceAddForm);

export default RemittanceAdd;
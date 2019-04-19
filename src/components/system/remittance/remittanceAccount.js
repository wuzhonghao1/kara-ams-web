import React from 'react';
import './remittanceAccount.css';
import RemittanceAdd from './remittanceAdd';
import { Form, Row, Col, Input, Button, Select, Table, Modal } from 'antd'
import message from '../../common/Notice/notification'
const FormItem = Form.Item;
const Option = Select.Option;
/**
 * 汇款账号维护
 */

class RemittanceAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      deleteVisible: false,
      remitId: '',
      selectedRemit: {},
    };
    this.columns = [{
      title: '序号',
      key: 'number',
      render: (text, records, index) => (
          <span>{index + 1}</span>
        )
      }
      ,{
        title: '公司',
        dataIndex: 'companyName',
        key: 'companyName',
      },{
        title: '地区',
        dataIndex: 'region',
        key: 'region',
      },{
        title: '公司全称',
        dataIndex: 'companyFullName',
        key: 'companyFullName',
      },{
        title: '银行开户行名称',
        dataIndex: 'accountBankName',
        key: 'accountBankName',
      },{
        title: '开户行账号',
        dataIndex: 'accountBankcard',
        key: 'accountBankcard',
      },{
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
      },{
        title: '操作',
        width: 100,
        key: 'operation',
        render: (text, record) => (
          <span>
            <a href="#" onClick={() => this.handleUpdate(record)}>修改</a><span className="ant-divider" />
            <a href="#" onClick={() => this.showDeleteModal(record.remittanceAccountId)}>删除</a>
          </span>
        )
      }];
  }

  componentWillMount() {
    const {remit} = this.props
    this.props.getRemitAccount({
      companyFullName: remit.initParam.companyFullName,
      companyId: remit.initParam.companyId,
      pageNo: 1,
      pageSize: 10,
      regionId: remit.initParam.regionId,
    });
  }

  componentWillReceiveProps = (nextProps) => {
    const { addSuccess, delSuccess, updateSuccess, initParam } = this.props;
    if(addSuccess !== nextProps.addSuccess && nextProps.addSuccess){
      this.setState({visible: false});
      this.props.getRemitAccount(initParam);
    }
    if(updateSuccess !== nextProps.updateSuccess && nextProps.updateSuccess) {
      //message.success('账号修改成功');
      this.setState({visible: false});
      this.props.getRemitAccount(initParam);
    }
    if(delSuccess !== nextProps.delSuccess && nextProps.delSuccess) {
      //message.success('账号删除成功');
      this.props.getRemitAccount(initParam);
    }
  }

  handleSearch = (e) => {
    if(e) { e.preventDefault(); }
    this.props.form.validateFields((err, values) => {
      const params = {
        companyId: values.companyId || '',
        regionId: values.regionId || '',
        companyFullName: values.companyFullName || '',
        pageSize: 10,
        pageNo: 1,
      };
      this.props.getRemitAccount(params);
    });
  };

  handleCancel = () => {
    this.setState({visible: false})
  };

  handleAdd = (e) => {
    this.setState({visible: true, selectedRemit: {}})
  };
  showDeleteModal = (configId) => {
    this.setState({
      deleteVisible: true,
      remitId: configId,
    });
  }

  hideDeleteModal = () => {
    this.setState({
      deleteVisible: false,
      remitId: '',
    });
  }

  handleUpdate = (record) => {
    this.setState({
      visible: true,
      selectedRemit: record,
    })
  };

  handleReset = () => {
    this.props.form.resetFields();
  };
  // 获取表数据
  getTableData = (tableData) => {
    /*
     accountId:"U5A716KHO"
     assetCategory:null
     assetCategoryName:null
     companyId:null
     companyName:null
     configId:"91CC0C27DC5849689C5F054D3BB4B23A"
     regionId:null
     regionName:null
     roleName:"系统管理员"
     userName:"任金强"
     userRole:"SYSTEM_MANAGER"
     */
    if(tableData) {
      return tableData.map((v, i) => {
        if (v.regionInfos) {
          let region = []
          if (this.props.regionList[0].flexValue !== 'allReg') {
            if (v.regionInfos.length === this.props.regionList.length) {
              region.push('全部')
            } else {
              v.regionInfos.map(item => {
                region.push(`${item.regionName} `)
              })
            }
          } else {
            if (Number(v.regionInfos.length + 1) === this.props.regionList.length) {
              region.push('全部')
            } else {
              v.regionInfos.map(item => {
                region.push(`${item.regionName} `)
              })
            }
          }
          return {...v, key: i, region: region}
        } else {
          return {...v, key: i}
        }
      })
    }
  }

  handleDelete = () => {
    this.props.remitAccountDel(this.state.remitId).then(res => {
      if(res.response && res.response.resultCode === '000000') {
        message.success('删除成功')
        this.handleSearch()
        this.hideDeleteModal()
      } else {
        message.success(res.response.resultMessage)
        return
      }
    });
  }

  render() {
    const { remit, companyList, regionList, remitAccountAdd, remitAccountUpdate } = this.props;
    const { isLoading, remitPage, initParam } = remit;
    const { count, pageSize, result } = remitPage;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
    };
    const pagination = {
      showQuickJumper: true,
      total: count,
      pageSize: pageSize,
      onChange: (current) => {
        const param = {
          ...initParam,
          pageNo: current,
        };
        this.props.getRemitAccount(param);
      }
    }
    return (
      <div>
        <Form className="ant-advanced-search-form" onSubmit={this.handleSearch}>
          <h1>查询条件</h1>
          <Row gutter={40}>
            <Col span={8}>
              <FormItem {...formItemLayout} label="公司">
                {getFieldDecorator('companyId')(
                  <Select style={{ width: 240 }}>
                    {
                      companyList.map(company =>
                        <Option key={company.flexValue} value={company.flexValue}>{company.description}</Option>
                      )
                    }
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="地区">
                {getFieldDecorator('regionId')(
                  <Select style={{ width: 240 }}>
                    {
                      regionList.map(region =>
                        <Option key={region.flexValue} value={region.flexValue}>{region.description}</Option>
                      )
                    }
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="公司全称">
                {getFieldDecorator('companyFullName')(
                  <Input placeholder="公司全称" style={{ width: 240 }}/>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right', padding: '5px 10px 0 0' }}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button type="primary" onClick={this.handleReset}>
                清空
              </Button>
            </Col>
          </Row>
        </Form>
        <div className="table-content">
          <h1>查询结果<Button type="primary" size="default" onClick={this.handleAdd}>新增</Button></h1>
          <Table
            loading={isLoading}
            rowKey={record => record.remittanceAccountId}
            columns={this.columns}
            dataSource={this.getTableData(result)}
            pagination={pagination}
          />
        </div>
        <Modal
          title="删除汇款账号"
          visible={this.state.deleteVisible}
          onOk={this.handleDelete}
          onCancel={this.hideDeleteModal}
        >
          <p>你确定要删除吗？</p>
        </Modal>
        {
          this.state.visible ?
            <Modal
              title={this.state.selectedRemit.remittanceAccountId ? '汇款账号修改' : '汇款账号新增'}
              width={800}
              visible={this.state.visible}
              onCancel={this.handleCancel}
              footer={false}
            >
              <RemittanceAdd
                companyList={companyList}
                regionList={regionList}
                remitAccountAdd={remitAccountAdd}
                remitAccountUpdate={remitAccountUpdate}
                selectedRemit={this.state.selectedRemit}
                handleCancel={this.handleCancel}
                handleSearch={this.handleSearch}
              />
            </Modal> : null
        }
      </div>
    )
  }
}

const RemittanceAccountForm = Form.create()(RemittanceAccount);
export default RemittanceAccountForm


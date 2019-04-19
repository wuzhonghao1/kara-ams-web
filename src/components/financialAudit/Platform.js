import React from 'react'
import moment from 'moment'
import { Form, Button, Tabs, Row, Col, Input, Select, DatePicker, Table, Icon, Card, Pagination, Modal, Spin, Tooltip, Checkbox } from 'antd';
import message from '../common/Notice/notification'
import StaffFinder from '../common/staffFinder/staffFinder'
import debounce from 'lodash/debounce'
import { saveAs } from '../../util/FileSaver'
import './platform.less'

const { Option, OptGroup } = Select;
const { MonthPicker, RangePicker } = DatePicker
const FormItem = Form.Item;

// 资产变更审核begin
class Platform extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      expand: false, // 展开or收起
      unfold: false, // tab1 fal展开or收起
      visible: false,
      voucherIds: [], // 资产转移 批量审核
      curPageTab1No: 1, // 资产转移查询当前页
      curPageTab1Size: 10, // 资产转移查询页码容量
      selectedRowKeys: [], // 批量审核选中行
      changeIdList: [],
      batchStatus: false, // 批量按钮默认不可操作
      value: [],
      tab1loading: false,
      loading: false, // 资产变更审核查询loading
      curPageTab2No: 1, // 资产变更审核查询当前页
      curPageTab2Size: 10, // 资产变更审核查询页码容量
      showError: false,
      errorInfo: "",
      isTransType: false, // 是否转移类型被选择
      columns2: [
        {
          title: "批次号",
          dataIndex: "changeBatch",
          key: "changeBatch",
          width: 100,
          fixed: "left"
        },
        {
          title: "员工姓名",
          dataIndex: "assignedOwnerName",
          key: "assignedOwnerName",
          width: 100,
          fixed: "left"
        },
        {
          title: "员工编号",
          dataIndex: "assignedOwnerNumber",
          key: "assignedOwnerNumber",
          width: 100,
          fixed: "left"
        },
        {
          title: "资产编号",
          dataIndex: "serialNumber",
          key: "serialNumber",
          width: 140,
          fixed: "left"
        },
        {
          title: "资产关键字",
          dataIndex: "assetKeyName",
          key: "assetKeyName",
          width: 100
        },
        {
          title: "资产描述",
          dataIndex: "description",
          key: "description",
          width: 240
        },
        {
          title: "变更前",
          children: [
            {
              title: "所属公司",
              dataIndex: "frontCompany",
              key: "frontCompany",
              width: 100
            },
            {
              title: "所属BU",
              dataIndex: "frontBu",
              key: "frontBu",
              width: 100
            },
            {
              title: "所属CC",
              dataIndex: "frontCc",
              key: "frontCc",
              width: 100,
              render: (text, record) => <span>{record.frontCCId}</span>
            },
            {
              title: "所属地区",
              dataIndex: "frontRegion",
              key: "frontRegion",
              width: 100
            }
          ]
        },
        {
          title: "变更后",
          children: [
            {
              title: "所属公司",
              dataIndex: "backCompany",
              key: "backCompany",
              width: 100
            },
            {
              title: "所属BU",
              dataIndex: "backBu",
              key: "backBu",
              width: 100
            },
            {
              title: "所属CC",
              dataIndex: "backCc",
              key: "backCc",
              width: 100,
              render: (text, record) => <span>{record.backCCId}</span>
            },
            {
              title: "所属地区",
              dataIndex: "backRegion",
              key: "backRegion",
              width: 100
            }
          ]
        },
        {
          title: "确认结果",
          dataIndex: "changeStatusName",
          key: "changeStatusName",
          width: 100
        },
        {
          title: "确认说明",
          dataIndex: "remark",
          key: "remark",
          width: 100
        },
        {
          title: "CCOwner",
          dataIndex: "ccOwnerName",
          key: "ccOwnerName",
          width: 100
        },
        {
          title: "确认时间",
          dataIndex: "changeTime",
          key: "changeTime",
          width: 90
        },
        {
          title: "审核状态",
          dataIndex: "auditStatus",
          key: "auditStatus",
          width: 100
        },
        {
          title: "审核人",
          dataIndex: "auditAccountName",
          key: "auditAccountName",
          width: 90
        },
        {
          title: "审核时间",
          dataIndex: "auditTime",
          key: "auditTime",
          width: 90
        },
        {
          title: "操作",
          dataIndex: "operate",
          key: "operate",
          width: 120,
          render: (text, record) =>{
            return <div className="table-action">
              {record.erpError === "yes" ? (
              <Tooltip overlayClassName="ant-tooltip-icon" title="错误信息">
                <a
                  onClick={() => {
                    this.setState({
                      showError: true,
                      errorInfo: record.erpRemark
                    });
                  }}
                >
                  <Icon type="exclamation-circle-o" style={{color: '#f4a034'}} />
                </a>
              </Tooltip>
            ) : (
              ""
            )}
            </div>
        }}
      ],
      columns3: [
        {
          title: "资产编号",
          dataIndex: "serialNumber",
          key: "serialNumber",
          width: 100,
          className: "tHeader",
          fixed: "center"
        },
        {
          title: "错误信息",
          dataIndex: "erpRemark",
          key: "erpRemark",
          width: 600,
          className: "tHeader",
          fixed: "center"
        }
      ],
      columns4: [
        {
          title: "错误信息",
          dataIndex: "erpRemark",
          key: "erpRemark",
          width: 600,
          className: "tHeader",
          fixed: "center"
        }
      ] //错误详情
    };
  }

  componentDidMount() {
    this.props.form.setFieldsValue({
      voucherStatus: "03"
    });
    this.handleSearch();
  }

  getNowFormatDate = () => {
    //当前时间
    let date = new Date();
    let month = date.getMonth() + 1;
    let strDate = date.getDate();
    let hours = date.getHours();
    let mins = date.getMinutes();
    let sed = date.getSeconds();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    if (hours >= 0 && hours <= 9) {
      hours = "0" + hours;
    }
    if (mins >= 0 && mins <= 9) {
      mins = "0" + mins;
    }
    if (sed >= 0 && sed <= 9) {
      sed = "0" + sed;
    }
    const currentdate = `${date.getFullYear()}${month}${strDate}${hours}${mins}${sed}`;
    return currentdate;
  }

  toggleTab = key => {
    // toggleTab 重置所有组件
    this.props.form.resetFields();
    this.setState({
      selectedRowKeys: [],
      changeIdList: [],
      voucherIds: [],
      batchStatus: false,
    });
    this.tab1Checked = false;
    this.tab2Checked = false;
    if (key === "1") {
      this.props.form.setFieldsValue({
        voucherStatus: "03"
      });
      this.handleSearch();
    }
    if (key === "2") {
      this.props.form.setFieldsValue({
        auditStatus: "60"
      });
      this.handleChangeSearch();
    }
  };

  resetBtn = () => {
    this.props.form.resetFields();
    this.setState({
      selectedRowKeys: [],
      batchStatus: false,
      loading: false,
      data: [],
      changeIdList: []
    });
  };
  // 勾选员工信息

  handleOk = () => {
    this.setState({ visible: false });
  };

  handleCancel = () => {
    this.setState({ visible: false });
  };

  selectStaff = staff => {
    const { personId, employeeNumber, lastName } = staff[0];
    this.props.form.setFieldsValue({
      personId,
      accountName: `${lastName} / ${employeeNumber}`
    });
    this.handleCancel();
  };

  // 所属CC 模糊查询
  handleCcChange = debounce(value => {
    if (value.trim() === "") {
      return;
    }
    // this.setState({ value });
    const { bgId } = this.props.user;
    this.props.getOrgCostCenterInfo(bgId, value).then(d => {
      if (d && d.response && d.response.resultCode === "000000") {
        const result = d.response.result;
        const data = [];
        result.forEach(r => {
          data.push({
            value: r.costcenterId,
            text: r.costcenterName
          });
        });
        this.setState({ data });
      }
    });
    fetch(value, data => this.setState({ data }));
  }, 200);

  // 资产变更审核 变更前，变更后函数对比
  handleModifyChange = value => {
    if (value.length === 2) {
      if (
        (value[0].indexOf("_") === 0 && value[1].indexOf("_") === 0) ||
        (value[0].indexOf("_") !== 0 && value[1].indexOf("_") !== 0) // 2元素同为1组
      ) {
        value.shift();
        this.setState({ value: value });
      } else if (value[0].indexOf("_") === 0 && value[1].indexOf("_") !== 0) {
        value.reverse();
        this.setState({ value: value });
      }
    } else if (value.length === 3) {
      if (value[2].indexOf("_") === 0 && value[0].indexOf("_") === 0) {
        value.shift();
        this.setState({ value: value });
      } else if (value[2].indexOf("_") !== 0 && value[0].indexOf("_") !== 0) {
        value.shift();
        value.reverse();
        this.setState({ value: value });
      } else if (value[2].indexOf("_") === 0 && value[1].indexOf("_") === 0) {
        value.splice(1, 1);
        this.setState({ value: value });
      } else if (value[2].indexOf("_") !== 0 && value[1].indexOf("_") !== 0) {
        value.splice(1, 1);
        value.reverse();
        this.setState({ value: value });
      }
    } else {
      this.setState({ value: value });
    }
  };

  // 资产转移表单值集合
  getTab1FormValues = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
      }
      // 对于空的或undefined值，过滤
      const newValues = Object.keys(values).reduce((x, y) => {
        if (
          y === "startEnd" &&
          values["startEnd"] &&
          values["startEnd"].length
        ) {
          x.beginDate = moment(values.startEnd[0]).format("YYYYMMDD");
          x.endDate = moment(values.startEnd[1]).format("YYYYMMDD");
        } else if (
          y.slice(0, 5) !== "audit" &&
          y !== "changeBatch" &&
          y !== "accountName" &&
          y !== "startEnd" &&
          values[y]
        ) {
          x[y] = values[y];
        }
        return x;
      }, {});
      this.tab1FormValues = newValues;
    });
  };

  // 资产变更审核表单值集合

  getTab2FormValues = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
      }
      // 对于空的或undefined值，过滤
      const newValues = Object.keys(values).reduce((x, y) => {
        if (y === "changeBatch" && values[y]) {
          // 变更批次
          x.changeBatch = moment(values[y]).format("YYYYMM");
          // } else if (y ==='ccId0' && values['ccId0']) { // 变更前ccId
          //   x.frontCcId = values['ccId0']
          // } else if (y ==='ccId1' && values['ccId1']) { // 变更后ccId
          //   x.backCcId = values['ccId1']
        } else if (y === "auditStatus" && values[y]) {
          x.auditStatus = values[y];
        } else if (
          y.slice(0, 5) !== "audit" &&
          y !== "accountName" &&
          y !== "startEnd" &&
          y !== "changeBatch" &&
          values[y]
        ) {
          x[y] = values[y];
        } else if (y === "auditCompanyId" && values[y].length) {
          // 变更前公司ID 变更后公司ID
          if (values[y].length === 1) {
            if (values[y][0].slice(0, 1) !== "_" && values[y][0] !== "0") {
              x["frontCompanyId"] = values[y][0];
            }
            if (values[y][0].slice(0, 1) === "_" && values[y][0] !== "_0") {
              x["backCompanyId"] = values[y][0].slice(1);
            }
          } else if (values[y].length === 2) {
            values[y].forEach(item => {
              if (item !== "0" && item !== "_0" && item) {
                if (item.slice(0, 1) === "_") {
                  x["backCompanyId"] = item.slice(1);
                } else if (item.slice(0, 1) !== "_") {
                  x["frontCompanyId"] = item;
                }
              }
            });
          }
        } else if (y === "auditSbuId" && values[y].length) {
          //变更前sbuId 变更后sbuId
          if (values[y].length === 1) {
            if (values[y][0].slice(0, 1) !== "_" && values[y][0] !== "0") {
              x["frontSbuId"] = values[y][0];
            }
            if (values[y][0].slice(0, 1) === "_" && values[y][0] !== "_0") {
              x["backSbuId"] = values[y][0].slice(1);
            }
          } else if (values[y].length === 2) {
            values[y].forEach(item => {
              if (item !== "0" && item !== "_0" && item) {
                if (item.slice(0, 1) === "_") {
                  x["backSbuId"] = item.slice(1);
                } else if (item.slice(0, 1) !== "_") {
                  x["frontSbuId"] = item;
                }
              }
            });
          }
        } else if (y === "auditRegionId" && values[y].length) {
          //变更前 后RegionId
          if (values[y].length === 1) {
            if (values[y][0].slice(0, 2) !== "_1" && values[y][0] !== "1") {
              x["frontRegionId"] = values[y][0];
            }
            if (values[y][0].slice(0, 1) === "_" && values[y][0] !== "_1") {
              x["backRegionId"] = values[y][0].slice(1);
            }
          } else if (values[y].length === 2) {
            values[y].forEach(item => {
              if (item !== "1" && item !== "_1" && item) {
                if (item.slice(0, 1) === "_") {
                  x["backRegionId"] = item.slice(1);
                } else if (item.slice(0, 1) !== "_") {
                  x["frontRegionId"] = item;
                }
              }
            });
          }
        }
        return x;
      }, {});
      this.tab2FormValues = newValues;
    });
  };

  // 资产转移查询
  handleSearch = (e = "", curPageTab1No = "", curPageTab1Size = "") => {
    if (e) {
      e.preventDefault();
    }
    if (curPageTab1No && curPageTab1Size) {
      this.setState({ tab1loading: true, curPageTab1No, curPageTab1Size });
    } else {
      this.setState({ tab1loading: true });
    }
    this.getTab1FormValues();
    this.props
      .getAssetInquiry({
        pageNo: this.state.curPageTab1No,
        pageSize: this.state.curPageTab1Size,
        erpStatus: this.tab1Checked ? '30' : '',  // tab1 仅查询审核失败的申请单
        ...this.tab1FormValues
      })
      .then(result => {
        this.setState({ tab1loading: false });
      });
  };

  // 资产转移导出excel
  exportVoucher = () => {
    this.setState({tab1loading: true})
    this.props.voucherExcel({
      pageNo: 1,
      pageSize: 99999,
      erpStatus: this.tab1Checked ? '30' : '',  // tab1 仅查询审核失败的申请单
      ...this.tab1FormValues
    }).then(result => {
      this.setState({tab1loading: false})
      if(result && result.response && !result.response.resultCode) {
        saveAs(result.response, `资产转移、报废、赔偿审核_${this.getNowFormatDate()}.xls`);
      } else if (result && result.response &&result.response.resultCode === '666666') {
        message.warning(result.response.resultMessage);
      } else if (result && result.response &&result.response.resultCode === '000000') {
        message.warning('无数据')
      } else{
        message.error('导出审核单失败!');
      }
    })
  }

  pageSizeTab1Change = size => {
    this.setState({ curPageTab1No: 1, curPageTab1Size: size });
    this.getTab1FormValues();
    this.props
      .getAssetInquiry({
        pageNo: 1,
        pageSize: size,
        ...this.tab1FormValues
      })
      .then(result => {
        if (result.response.resultCode !== "000000") {
          message.error(result.response.resultMessage);
        }
      });
  };

  pageNoTab1Change = page => {
    this.setState({ curPageTab1No: page });
    this.getTab1FormValues();
    this.props
      .getAssetInquiry({
        pageNo: page,
        pageSize: this.state.curPageTab1Size,
        ...this.tab1FormValues
      })
      .then(result => {
        if (result.response.resultCode !== "000000") {
          message.error(result.response.resultMessage);
        }
      });
  };

  // 资产转移批量审核
  batchApprove = e => {
    this.setState({ batchStatus: true });
    // ajax request after empty completing
    this.props
      .getAssetConfirm({ voucherIds: this.state.voucherIds })
      .then(result => {
        this.setState({
          selectedRowKeys: [],
          batchStatus: false,
          voucherIds: []
        });
        if (
          result &&
          result.response &&
          result.response.resultCode === "000000"
        ) {
          message.success("申请单已经提交到ERP系统，请稍后返回查看处理情况");
          this.handleSearch(); // 需后期修改校验
        } else {
          try {
            message.error(result.response.resultMessage);
          } catch (error) {
            throw error;
          }
        }
      });
  };

  // 批量审核选中行
  onSelectFirstChange = (selectedRowKeys, selectedRows) => {
    let voucherIds = selectedRows.reduce((sum, cur) => {
      return sum.concat(cur.voucherId);
    }, []);
    this.setState({ selectedRowKeys, voucherIds });
  };

  // 批量审核选中行
  onSelectChange = (selectedRowKeys, selectedRows) => {
    let changeIdList = selectedRows.reduce((sum, cur) => {
      return sum.concat(cur.changeId);
    }, []);
    this.setState({ selectedRowKeys, changeIdList: changeIdList });
  };

  // 资产变更审核
  batchAuditApprove = () => {
    this.setState({ batchStatus: true });
    // body参数修改
    this.props
      .getAssetChangeConfirm({ changeIdList: this.state.changeIdList })
      .then(result => {
        if (result.response && result.response.resultCode === "000000") {
          this.handleChangeSearch();
          message.success("申请单已经提交到ERP系统，请稍后返回查看处理情况");
        } else {
          message.error(result.response.resultMessage);
        }
        this.setState({
          selectedRowKeys: [],
          batchStatus: false,
          changeIdList: []
        });
      });
  };

  // 资产变更审核查询
  handleChangeSearch = (e = "", curPageTab2No = "", curPageTab2Size = "") => {
    if (curPageTab2No && curPageTab2Size) {
      this.setState({ loading: true, curPageTab2No, curPageTab2Size });
    } else {
      this.setState({ loading: true });
    }
    if (e) {
      e.preventDefault();
    }
    this.getTab2FormValues();
    this.props
      .getAssetChangeSearch({
        pageNo: this.state.curPageTab2No,
        pageSize: this.state.curPageTab2Size,
        erpStatus: this.tab2Checked ? '30' : '',
        ...this.tab2FormValues
      })
      .then(result => {
        this.setState({ loading: false });
        if (result.response.resultCode !== "000000") {
          message.error(result.response.resultMessage);
        }
      });
  };

  // 资产变更导出excel
  exportAsset = () => {
    this.setState({loading: true})
    this.props.assetExcel({
      pageNo: 1,
      pageSize: 99999,
      erpStatus: this.tab2Checked ? '30' : '',
      ...this.tab2FormValues
    }).then(result => {
      this.setState({loading: false})
      if(result && result.response && !result.response.resultCode) {
        saveAs(result.response, `资产变更审核_${this.getNowFormatDate()}.xls`);
      } else if (result && result.response &&result.response.resultCode === '666666') {
        message.warning(result.response.resultMessage);
      } else if (result && result.response &&result.response.resultCode === '000000') {
        message.warning('无数据')
      } else{
        message.error('导出审核单失败!');
      }
    })
  }

  pageSizeTab2Change = size => {
    this.setState({ curPageTab2No: 1, curPageTab2Size: size, loading: true });
    this.getTab2FormValues();
    this.props
      .getAssetChangeSearch({
        pageNo: 1,
        pageSize: size,
        ...this.tab2FormValues
      })
      .then(result => {
        this.setState({ loading: false });
        if (result.response.resultCode !== "000000") {
          message.error(result.response.resultMessage);
        }
      });
  };

  pageNoTab2Change = page => {
    this.setState({ curPageTab2No: page, loading: true });
    this.getTab2FormValues();
    this.props
      .getAssetChangeSearch({
        pageNo: page,
        pageSize: this.state.curPageTab2Size,
        ...this.tab2FormValues
      })
      .then(result => {
        this.setState({ loading: false });
        if (result.response.resultCode !== "000000") {
          message.error(result.response.resultMessage);
        }
      });
  };

  handleHideError = () => {
    this.setState({ showError: false });
  };
  // tab2展开or收起
  expand = () => {
    this.setState({ expand: !this.state.expand })
  };

  // tab1展开or收起
  unfold = () => {
    this.setState({ unfold: !this.state.unfold })
  };

  // tab1
  onTab1Change = e => {
    if (e.target.checked) {
      this.tab1Checked = true
      this.handleSearch()
    } else {
      this.tab1Checked = false;
      this.handleSearch();
    }
  };

  // tab2
  onTab2Change = e => {
    if (e.target.checked) {
      this.tab2Checked = true;
      this.handleChangeSearch();
    } else {
      this.tab2Checked = false;
      this.handleChangeSearch();
    }
  };

  // 改变转移类型
  changeTrans = (value) => {
    if(value === '') {
      this.setState({ isTransType: false })
      this.props.form.setFieldsValue({voucherType: ''})
    } else {
      this.setState({ isTransType: true })
      this.props.form.setFieldsValue({voucherType: '10'})
    }
  }

  // 改变申请单类型
  changeVoucherType = (value) => {
    if(value !== '10') {
      this.setState({ isTransType: false })
      this.props.form.setFieldsValue({transferType: ''})
    }
  }

  render() {
    const {
      columns,
      inquiryListPageInfo = {},
      assetChangePageInfo = {}
    } = this.props;
    const { columns2 } = this.state;
    const TabPane = Tabs.TabPane;
    const data = Object.keys(inquiryListPageInfo).length
      ? inquiryListPageInfo.result
      : [];
    const data2 = Object.keys(assetChangePageInfo).length
      ? assetChangePageInfo.result
      : [];
    const { getFieldDecorator } = this.props.form;
    const { dictionary } = this.props; // 通过接口获得的公司
    const {
      companyList,
      sbuList,
      regionList,
      voucherType,
      assetKey,
      changeOption
    } = dictionary;
    const { batchStatus, selectedRowKeys } = this.state;
    const layoutProps = {
      labelCol: {
        span: 7
      },
      wrapperCol: {
        span: 17
      }
    };
    // Tab1
    const rowFirstSelection = {
      selectedRowKeys,
      onChange: this.onSelectFirstChange,
      getCheckboxProps: record => ({
        disabled: record.voucherStatus !== "03" // 已审核不能勾选再次审核
      })
    };
    // Tab2
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: record => ({
        disabled: record.isFinanceConfirm !== "no" // 已审核不能勾选再次审核
      })
    };
    const hasSelected = selectedRowKeys.length > 0; // 批量审核大于2条
    const options = this.state.data.map(d => (
      <Option key={d.value}>{d.text}</Option>
    ));
    return <Tabs className="platform" type="card" onChange={this.toggleTab}>
        <TabPane tab="资产转移、报废、赔偿申请审核" key="1">
          <Spin spinning={this.state.batchStatus}>
            <Card className="m-card condition" title="查询条件" bordered={false} noHovering>
              <Form onSubmit={e => this.handleSearch(e, 1, 10)}>
                <Row>
                  <Col span={8}>
                    <FormItem style={{ display: "none" }} {...layoutProps} label="员工信息：">
                      {getFieldDecorator("personId")(<Input style={{ display: "none" }} disabled />)}
                    </FormItem>
                    <FormItem {...layoutProps} label="员工信息：">
                      <div className="u-select-user-input" onClick={() => {
                          this.setState({ visible: true });
                        }}>
                        {getFieldDecorator("accountName")(<Input disabled suffix={<Icon type="search" />} />)}
                      </div>
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem label="流水号" {...layoutProps}>
                      {getFieldDecorator("voucherNo")(<Input />)}
                    </FormItem>
                  </Col>
                  <Col span={7}>
                    <FormItem label="申请单类型" {...layoutProps}>
                      {getFieldDecorator("voucherType", {
                        initialValue: ""
                      })(<Select onSelect={v => {this.changeVoucherType(v)}}>
                          <Option value="">--请选择--</Option>
                          {voucherType.map(item => (
                            <Option
                              key={item.paramValue}
                              value={item.paramValue}
                            >
                              {item.paramValueDesc}
                            </Option>
                          ))}
                        </Select>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem label="资产编号" {...layoutProps}>
                      {getFieldDecorator("serialNumber")(<Input />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem label="审核状态" {...layoutProps}>
                      {getFieldDecorator("voucherStatus", {
                        initialValue: ""
                      })(<Select>
                          <Option value="">--请选择--</Option>
                          <Option value="10">审核中</Option>
                          <Option value="06">已审核</Option>
                          <Option value="03">未审核</Option>
                        </Select>)}
                    </FormItem>
                  </Col>
                  <Col span={7}>
                    <FormItem label="审核起止时间" {...layoutProps}>
                      {getFieldDecorator("startEnd", {
                        initialValue: null
                      })(<RangePicker style={{ width: "100%" }} />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={this.state.unfold ? {display: 'block'} : {display: 'none'}}>
                  <Col span={8}>
                    <FormItem label="所属公司" {...layoutProps}>
                      {getFieldDecorator("companyId", {
                        initialValue: ""
                      })(<Select>
                          <Option value="">--请选择--</Option>
                          {companyList.map(item => (
                            <Option
                              key={item.flexValue}
                              value={item.flexValue}
                            >
                              {item.description}
                            </Option>
                          ))}
                        </Select>)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem label="所属BU" {...layoutProps}>
                      {getFieldDecorator("sbuId", {
                        initialValue: ""
                      })(<Select>
                          <Option value="">--请选择--</Option>
                          {sbuList.map(item => (
                            <Option
                              key={item.flexValue}
                              value={item.flexValue}
                            >
                              {item.description}
                            </Option>
                          ))}
                        </Select>)}
                    </FormItem>
                  </Col>
                  <Col span={7}>
                    <FormItem label="所属地区" {...layoutProps}>
                      {getFieldDecorator("regionId", {
                        initialValue: ""
                      })(<Select>
                          <Option value="">--请选择--</Option>
                          {regionList.map(item => (
                            <Option
                              key={item.flexValue}
                              value={item.flexValue}
                            >
                              {item.description}
                            </Option>
                          ))}
                        </Select>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={this.state.unfold ? {display: 'block'} : {display: 'none'}}>
                  <Col span={8} style={{ display: "none" }}>
                    <FormItem label="所属CC" {...layoutProps}>
                      {getFieldDecorator("ccId")(<Select mode="combobox" placeholder={"请输入costCenterId"} defaultActiveFirstOption={false} showArrow={false} filterOption={false} onChange={this.handleCcChange}>
                          {options}
                        </Select>)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem label="转移类型" {...layoutProps}>
                      {getFieldDecorator("transferType", {initialValue: ""})(
                        <Select onSelect={(value) => {this.changeTrans(value)}}>
                          <Option value="">--请选择--</Option>
                          <Option value="01">公司间转移</Option>
                          <Option value="02">公司内转移</Option>
                          <Option value="03">跨BG转移</Option>
                        </Select>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col className="taRight" style={{ float: "right", marginRight: "5%" }} offset={8} span={7}>
                    <Button type="primary" htmlType="submit">
                      查询
                    </Button>
                    <Button type="primary" onClick={this.resetBtn}>
                      清空
                    </Button>
                    <Button disabled={this.state.tab1loading} type="primary" onClick={this.exportVoucher}>
                      导出
                    </Button>
                    {this.state.unfold ?
                      <span className="expand up" onClick={this.unfold}>
                        收起
                      </span> :
                      <span className="expand down" onClick={this.unfold}>
                        展开
                      </span>}
                  </Col>
                </Row>
              </Form>
            </Card>
            <div className="result">
              <h3>
                查询结果&emsp;
                <Button type="primary" disabled={!hasSelected} onClick={this.batchApprove} loading={batchStatus}>
                  批量审核
                </Button>
                <p style={{ float: "right" }}>
                  <Checkbox checked={this.tab1Checked} onChange={this.onTab1Change}>
                    仅查询审核失败的申请单
                  </Checkbox>
                </p>
              </h3>
              <Table rowKey={item => item.voucherId} rowSelection={rowFirstSelection} columns={columns} dataSource={data} pagination={false} scroll={{ x: 1300 }} loading={this.state.tab1loading} />
              <Modal visible={this.state.visible} title="员工查询" width="1000px" footer={null} onOk={this.handleOk} onCancel={this.handleCancel}>
                <StaffFinder dispatch={this.props.dispatch} multiple={false} bgCode={sessionStorage.getItem("bgCode")} keywords={this.state.keywords} selectStaff={this.selectStaff} companyData={this.props.dictionary.companyList} regionData={this.props.dictionary.regionList} buData={this.props.dictionary.sbuList} ccData={this.props.dictionary.ccList ? this.props.dictionary.ccList : []} />
              </Modal>
              <br />
              <div style={{ paddingRight: "20px" }}>
                <Pagination showSizeChanger current={this.state.curPageTab1No} pageSize={this.state.curPageTab1Size} onShowSizeChange={(current, size) => this.pageSizeTab1Change(size)} total={inquiryListPageInfo.count} showTotal={t => `共${t}条`} onChange={page => this.pageNoTab1Change(page)} pageSizeOptions={["10", "20", "50", "100"]} showQuickJumper />
              </div>
              <br />
            </div>
            <Modal visible={this.props.showError} title="错误详情" className="errorModal" footer={null} onCancel={this.props.handleHideError} width="1000px">
              <Table columns={this.state.columns3} dataSource={this.props.errorInfo} pagination={false} loading={this.state.loading} className="special" rowKey={row => row.serialNumber} />
            </Modal>
          </Spin>
        </TabPane>
        <TabPane tab="资产变更审核" key="2">
          <Spin spinning={this.state.batchStatus}>
            <Card className="m-card condition" title="查询条件" bordered={false} noHovering>
              <Form onSubmit={e => this.handleChangeSearch(e, 1, 10)}>
                <Row>
                  <Col span={8}>
                    <FormItem style={{ display: "none" }} {...layoutProps} label="员工信息：">
                      {getFieldDecorator("personId")(<Input style={{ display: "none" }} disabled />)}
                    </FormItem>
                    <FormItem {...layoutProps} label="员工信息：">
                      <div className="u-select-user-input" onClick={() => {
                          this.setState({ visible: true });
                        }}>
                        {getFieldDecorator("accountName")(<Input disabled suffix={<Icon type="search" />} />)}
                      </div>
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem label="资产编号" {...layoutProps}>
                      {getFieldDecorator("assetId")(<Input />)}
                    </FormItem>
                  </Col>
                  <Col span={7}>
                    <FormItem label="资产关键字" {...layoutProps}>
                      {getFieldDecorator("assetKey", {
                        initialValue: ""
                      })(<Select>
                          <Option value="">--请选择--</Option>
                          {assetKey.map(item => (
                            <Option
                              key={item.paramValue}
                              value={item.paramValue}
                            >
                              {item.paramValueDesc}
                            </Option>
                          ))}
                        </Select>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <FormItem label="变更批次" {...layoutProps}>
                      {getFieldDecorator("changeBatch", {
                        initialValue: moment(new Date(), "YYYYMM")
                      })(<MonthPicker format="YYYYMM" style={{ width: "100%" }} />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem label="变更项" {...layoutProps}>
                      {getFieldDecorator("changeOption", {
                        initialValue: ""
                      })(<Select>
                          <Option value="">--请选择--</Option>
                          {changeOption.map(item => (
                            <Option
                              key={item.paramValue}
                              value={item.paramValue}
                            >
                              {item.paramValueDesc}
                            </Option>
                          ))}
                        </Select>)}
                    </FormItem>
                  </Col>
                  <Col span={7}>
                    <FormItem label="审核状态" {...layoutProps}>
                      {getFieldDecorator("auditStatus", {
                        initialValue: ""
                      })(<Select>
                          <Option value="">--请选择--</Option>
                          <Option value="10">审核中</Option>
                          <Option value="50">已审核</Option>
                          <Option value="60">未审核</Option>
                        </Select>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={this.state.expand ? {display: 'block'} : {display: 'none'}}>
                  <Col span={8}>
                    <FormItem label="所属公司" {...layoutProps}>
                      {getFieldDecorator("auditCompanyId", {
                        initialValue: ["0", "_0"]
                      })(<Select mode="multiple" onChange={this.handleModifyChange}>
                          <OptGroup label="变更前">
                            <Option value="0">--请选择--</Option>
                            {companyList.map(item => (
                              <Option
                                key={item.flexValue}
                                value={item.flexValue}
                              >
                                {item.description}
                              </Option>
                            ))}
                          </OptGroup>
                          <OptGroup label="变更后">
                            <Option value="_0">--请选择--</Option>
                            {companyList.map(item => (
                              <Option
                                key={item.flexValue}
                                value={"_" + item.flexValue}
                              >
                                {item.description}
                              </Option>
                            ))}
                          </OptGroup>
                        </Select>)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem label="所属BU" {...layoutProps}>
                      {getFieldDecorator("auditSbuId", {
                        initialValue: ["0", "_0"]
                      })(<Select mode="multiple" onChange={this.handleModifyChange}>
                          <OptGroup label="变更前">
                            <Option value="0">--请选择--</Option>
                            {sbuList.map(item => (
                              <Option
                                key={item.flexValue}
                                value={item.flexValue}
                              >
                                {item.description}
                              </Option>
                            ))}
                          </OptGroup>
                          <OptGroup label="变更后">
                            <Option value="_0">--请选择--</Option>
                            {sbuList.map(item => (
                              <Option
                                key={item.flexValue}
                                value={"_" + item.flexValue}
                              >
                                {item.description}
                              </Option>
                            ))}
                          </OptGroup>
                        </Select>)}
                    </FormItem>
                  </Col>
                  {<Col span={7}>
                      <FormItem label="所属CC" {...layoutProps}>
                        {getFieldDecorator("frontCcId")(<Select mode="combobox" placeholder={"变更前ccId"} defaultActiveFirstOption={false} showArrow={false} filterOption={false} onChange={this.handleCcChange} style={{ width: "50%" }}>
                            {options}
                          </Select>)}
                        {getFieldDecorator("backCcId")(<Select mode="combobox" placeholder={"变更后ccId"} defaultActiveFirstOption={false} showArrow={false} filterOption={false} onChange={this.handleCcChange} style={{ width: "50%" }}>
                            {options}
                          </Select>)}
                      </FormItem>
                    </Col>}
                </Row>
                <Row style={this.state.expand ? {display: 'block'} : {display: 'none'}}>
                  <Col span={8} style={{ display: "none" }}>
                    <FormItem label="所属地区" {...layoutProps}>
                      {getFieldDecorator("auditRegionId", {
                        initialValue: ["1", "_1"]
                      })(<Select mode="multiple" onChange={this.handleModifyChange}>
                          <OptGroup label="变更前">
                            <Option value="1">--请选择--</Option>
                            {regionList.map(item => (
                              <Option
                                key={item.flexValue}
                                value={item.flexValue}
                              >
                                {item.description}
                              </Option>
                            ))}
                          </OptGroup>
                          <OptGroup label="变更后">
                            <Option value="_1">--请选择--</Option>
                            {regionList.map(item => (
                              <Option
                                key={item.flexValue}
                                value={"_" + item.flexValue}
                              >
                                {item.description}
                              </Option>
                            ))}
                          </OptGroup>
                        </Select>)}
                    </FormItem>
                  </Col>
                </Row>
                {/*<Row style={this.state.expand ? {display: 'block'} : {display: 'none'}}>*/}
                  {/*<Col span={8}>*/}
                    {/*<FormItem label="转移类型" {...layoutProps}>*/}
                      {/*{getFieldDecorator("transferType", {initialValue: ""})(*/}
                        {/*<Select>*/}
                          {/*<Option value="">--请选择--</Option>*/}
                          {/*<Option value="01">公司间转移</Option>*/}
                          {/*<Option value="02">公司内转移</Option>*/}
                          {/*<Option value="03">跨BG转移</Option>*/}
                        {/*</Select>)}*/}
                    {/*</FormItem>*/}
                  {/*</Col>*/}
                {/*</Row>*/}
                <Row>
                  <Col className="taRight" style={{ float: "right", marginRight: "5%" }} offset={8} span={7}>
                    <Button type="primary" htmlType="submit">
                      查询
                    </Button>
                    <Button type="primary" onClick={this.resetBtn}>
                      清空
                    </Button>
                    <Button disabled={this.state.loading} type="primary" onClick={this.exportAsset}>
                      导出
                    </Button>
                    {this.state.expand ?
                      <span className="expand up" onClick={this.expand}>
                        收起
                      </span> :
                      <span className="expand down" onClick={this.expand}>
                        展开
                      </span>}
                  </Col>
                </Row>
              </Form>
            </Card>
            <div className="result">
              <h3>
                查询结果&emsp;
                <Button type="primary" disabled={!hasSelected} onClick={this.batchAuditApprove} loading={batchStatus}>
                  审核(支持批量审核)
                </Button>
                <p style={{ float: "right" }}>
                  <Checkbox checked={this.tab2Checked} onChange={this.onTab2Change}>
                    仅查询审核失败的资产
                  </Checkbox>
                </p>
              </h3>
              <Table rowSelection={rowSelection} columns={columns2} dataSource={data2} pagination={false} scroll={{ x: 2400, y: 300 }} loading={this.state.loading} className="special" rowKey={row => row.changeId} />
              <br />
              <div style={{ paddingRight: "20px" }}>
                <Pagination current={this.state.curPageTab2No} pageSize={this.state.curPageTab2Size} showSizeChanger onShowSizeChange={(current, size) => this.pageSizeTab2Change(size)} showTotal={t => `共${t}条`} onChange={page => this.pageNoTab2Change(page)} total={assetChangePageInfo.count} pageSizeOptions={["10", "20", "50", "100"]} showQuickJumper />
              </div>
              <br />
            </div>
          </Spin>
          <Modal visible={this.state.showError} title="错误详情" className="errorModal" footer={null} onCancel={this.handleHideError} width="1000px">
            <Table columns={this.state.columns4} dataSource={[{ erpRemark: this.state.errorInfo }]} pagination={false} loading={this.state.loading} className="special" rowKey={row => row.serialNumber} />
          </Modal>
        </TabPane>
      </Tabs>;
  }
}

export default Form.create()(Platform)

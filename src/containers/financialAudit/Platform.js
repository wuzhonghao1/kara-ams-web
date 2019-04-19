import React from 'react'
import { Icon, Tooltip } from 'antd'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import FinancialAudit from '../../components/financialAudit/Platform'
import { getAssetChangeSearch, getAssetChangeConfirm, assetExcel } from '../../actions/financialAudit/assetChange'
import { getAssetInquiry, getAssetConfirm, voucherExcel } from '../../actions/financialAudit/assetInquiry'
import { getOrgCostCenterInfo } from '../../actions/dictionary/dictionary'
import './financialAudit.less'

const mapStateToProps = state=>({
  user: state.user,
  dictionary: state.dictionary,
  inquiryListPageInfo: state.financeAudit.inquiryListPageInfo,
  assetChangePageInfo: state.financeAudit.assetChangePageInfo,
})

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators({
    getAssetChangeSearch,
    getAssetChangeConfirm,
    getAssetInquiry,
    getAssetConfirm,
    getOrgCostCenterInfo,
    assetExcel,
    voucherExcel
  }, dispatch),
  dispatch
})

const titles = ['流水号', '申请人', '员工编号', '代理人',
                '申请单类型', '资产编号', '所属公司', '所属BU',
                '所属CC', '所属地区', '申请时间', '审核状态',
                '审核人', '审核时间', '操作'
              ];

const keys = ['voucherNo', 'applyName', 'applyStaffCode', 'createName',
              'voucherTypeName', 'assetIds', 'ownerCompany', 'ownerSbu',
              'ownerCC', 'ownerRegion', 'applyTime', 'financeStatus',
              'financeApprover', 'financeApproveTime', ''];


class Container extends React.Component {
  constructor(props) {
    super(props)
    // 资产转移、报废、赔偿申请
    const columns = titles.map((item, index)=>{
      let key = keys[index];
      let column = {
        title: item,
        className:'tHeader',
        dataIndex: key,
        key: key,
      };
      if (key === 'voucherNo') {
        column.width = 160;
        column.render = (text, record, index) => <a className="link"
        onClick={() => this.linkFunc(record)}>{text}</a>
      } else if (key === 'voucherTypeName') {
        column.width = 100;
      } else if (key === 'ownerSbu') {
        column.width = 80
      } else if (key === 'ownerCC') {
        column.render = (text, record) => <div>{record.ownerCCId}</div>
      } else if(item === '申请单类型') {
        column.width = 80;
      } else if(item === '申请时间') {
        column.width = 120
      } else if(item === '申请时间' || item === '申请单类型') {
        column.sorter = (a, b)=>{
          if(a[key] > b[key]){
            return 1;
          }else if(a[key] === b[key]){
            return 0;
          }else{
            return -1;
          }
        }
      } else if (key === 'assetIds') {
        column.width = 90
        column.render = (text, record, index) => {
          let node = []
          if (record.assetIds && record.assetIds.length > 0) {
            record.assetIds.map((i, k) => {
              node.push(<p key={k}>{i}</p>)
            })
          }
          return <div>{node}</div>
        }
      } else if (item === '操作') {
        column.fixed = 'right'
        column.width = 120
        column.render = (text, record, index) => {
          return (<div className="table-action">
            {record.voucherStatus === '03' ?
              (<Tooltip overlayClassName="ant-tooltip-icon" title="审核">
                <a onClick={() => this.GoToApprove(record.voucherId, record.voucherType)}>
                  <Icon type="ams-finance"/>
                </a>
              </Tooltip>) : null
            }
            <Tooltip overlayClassName="ant-tooltip-icon" title="查看">
              <a onClick={() => this.GoToDetail(record.voucherId, record.voucherType)}>
                <Icon type="eye-o"/>
              </a>
            </Tooltip>
              {record.erpError === 'yes' ?
                  (<Tooltip overlayClassName="ant-tooltip-icon" title="错误信息">
                    <a onClick={() => {this.setState({showError: true,errorInfo: record.erpRemarkInfos})}}>
                      <Icon type="exclamation-circle-o" style={{color: '#f4a034'}}/>
                    </a>
                  </Tooltip>) : ''
              }
          </div>)
        }
      }
      return column;
    });

    this.state = {
      columns,
      showError: false,
      errorInfo: []
    }
  }

  linkFunc = (r) => {
    if(r.voucherStatus === '03') {
      this.GoToApprove(r.voucherId, r.voucherType)
    } else {
      this.GoToDetail(r.voucherId, r.voucherType)
    }
  }
  handleShowError = () => {
    this.setState({showError: true})
  }
  handleHideError = () => {
      this.setState({showError: false})
  }
  GoToDetail = (voucherId, voucherType) => {
    // 详情页
    if (voucherType === '10') {
      this.props.history.push(`/apply/transferDetail/${voucherId}`)
    }
    if (voucherType === '20') {
      this.props.history.push(`/apply/invalidateDetail/${voucherId}`)
    }
    if (voucherType === '30') {
      this.props.history.push(`/apply/compensateDetail/${voucherId}`)
    }
  }
  GoToApprove = (voucherId, voucherType) => {
    // 审批页面 financialAudit/platform
    if (voucherType === '10') {
      this.props.history.push(`/financialAudit/platform/transfer/${voucherId}?complete`)
    }
    if (voucherType === '20') {
      this.props.history.push(`/financialAudit/platform/invalidate/${voucherId}?complete`)
    }
    if (voucherType === '30') {
      this.props.history.push(`/financialAudit/platform/compensate/${voucherId}?complete`)
    }
  }

  render() {
    const { columns,errorInfo,showError } = this.state
    const props = { columns,errorInfo,showError,handleShowError: this.handleShowError,handleHideError: this.handleHideError }
    return <FinancialAudit {...this.props} {...props} />
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Container)

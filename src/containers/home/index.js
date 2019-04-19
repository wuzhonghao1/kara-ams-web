import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Icon, Tooltip } from 'antd';
import message from '../../components/common/Notice/notification'
import React from 'react'
import Home from '../../components/home/index'
import './index.less'
import { getMyTodos } from '../../actions/home/todoTask'
import { getMyAssets } from '../../actions/home/myAssets'
import { getMyApplicationInquiry } from '../../actions/home/myApplicationInquiry'

const titles = ['序号', '流水号', '申请人', '代理人', '申请时间', '申请单类型', '操作'];
const assetsTitles = ['资产编号', '资产类别', '资产关键字', '资产描述'];
const appliTitles = ['序号', '流水号', '申请人', '申请时间', '申请单类型', '操作'];

const mapStateToProps = state => ({
  roleInfos: state.user.roleInfos,
  personId: state.user.personId,
  myTodos: state.home.myTodos,
  myAssets: state.home.myAssets,
  myApplicationInquiry: state.home.myApplicationInquiry,
})

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    getMyTodos,
    getMyAssets,
    getMyApplicationInquiry,
  }, dispatch)
);

class Container extends React.Component {
  constructor(props) {
    super(props)
    let columns = titles.map((item, index) => { // 我的待办任务
      const column = {
        title: item,
        className: 'tHeader',
        width: 120,
        key: `todo${index}`
      };
      if (item === '序号') {
        column.dataIndex = 'serialNum'
        column.width = 60
      } else if (item === '流水号') {
        column.dataIndex = 'voucherNo'
        column.width = 200
      } else if (item === '申请时间') {
        column.dataIndex = 'applyTime'
        column.width = 140
      } else if (item === '申请人') {
        column.dataIndex = 'applyName'
      } else if (item === '代理人') {
        column.dataIndex = 'createName'
      } else if (item === '申请单类型') {
        column.dataIndex = 'voucherTypeName'
        column.width = 140
      } else if (item === '操作') {
        column.dataIndex = ''
        column.render = (text, item) =>
          <div className="table-action">
            <Tooltip overlayClassName="ant-tooltip-icon" title="审批">
              <a onClick={() => this.GoToApprove(item.voucherNo, item.voucherTypeName)}>
                <Icon type="ams-finance"/>
              </a>
            </Tooltip>
          </div>
      }
      return column;
    });

    const assetsCol = assetsTitles.map((item, index) => { // 我的资产
      const column = {
        title: item,
        className: 'tHeader',
        width: 80,
        key: `asset${index}`
      };
      if (item === '资产编号') {
        column.dataIndex = 'serialNumber'
        column.width = 100
      } else if (item === '资产类别') {
        column.dataIndex = 'assetTypeName'
      } else if (item === '资产关键字') {
        column.dataIndex = 'assetKeyName'
      } else if (item === '资产描述') {
        column.dataIndex = 'description'
        column.width = 220
      }
      return column;
    })

    let appliCol = appliTitles.map((item, index) => { // 我的申请单
      const column = {
        title: item,
        className: 'tHeader',
        width: 120,
        key: `app${index}`
      };
      if (item === '序号') {
        column.dataIndex = 'serialNum'
        column.width = 60
      } else if (item === '流水号') {
        column.dataIndex = 'voucherNo'
        column.width = 200
      } else if (item === '申请人') {
        column.dataIndex = 'applyName'
      } else if (item === '申请时间') {
        column.dataIndex = 'applyTime'
        column.width = 140
      } else if (item === '申请单类型') {
        column.dataIndex = 'voucherTypeName'
        column.width = 140
      } else if (item === '操作') {
        column.dataIndex = ''
        column.render = (text, item) =>
          <div className="table-action">
            <Tooltip overlayClassName="ant-tooltip-icon" title="详情">
              <a onClick={() => this.GoToDetail(item.voucherNo, item.voucherTypeName)}>
                <Icon type="eye-o"/>
              </a>
            </Tooltip>
          </div>}
      return column;
    })

    this.state = {
      columns,
      assetsCol,
      appliCol
    };
  }

  clickTodosSearch= () => {
    // 待办任务 > 查看更多
    this.props.history.push(`/businessApproval/search?more`)
  }

  clickAssetsSearch= () => {
    // 我的资产 > 查看更多
    this.props.history.push(`/assetInquiry/myAsset`)
  }

  clickApplicationsSearch=() => {
    // 申请单查询 > 查看更多
    this.props.history.push(`/applicationSearch/search?more`)
  }

  componentWillMount() {
    this.props.getMyTodos({
      pageNo: 1,
      pageSize: 10,
      approveStatus: 'undo',
    }).then(result => {
      if (!result || (result && !result.response) || (result && result.response && result.response.resultCode !== '000000')) {
        message.error('获取待办任务出错')
      }
    })
    this.props.getMyAssets({
      pageNo: 1,
      pageSize: 10,
    }).then(result => {
      if (!result || (result && !result.response) || (result && result.response && result.response.resultCode !== '000000')) {
        message.error('获取资产出错')
      }
    })
    this.props.getMyApplicationInquiry({
      pageNo: 1,
      pageSize: 10,
    }).then(result => {if (!result || (result && !result.response) || (result && result.response && result.response.resultCode !== '000000')) {
      message.error('获取申请单出错')
    }})
  }

  GoToApprove = (voucherId, voucherType) => {
    // 审批页面
    if (voucherType === '资产转移申请') {
      this.props.history.push(`/apply/transfer/${voucherId}?approve`)
    }
    if (voucherType === '资产报废申请') {
      this.props.history.push(`/apply/invalidate/${voucherId}?approve`)
    }
    if (voucherType === '资产赔偿申请') {
      this.props.history.push(`/apply/compensate/${voucherId}?approve`)
    }
  }

  GoToDetail = (voucherId, voucherType)=> {
    // 详情
    if(voucherType === '资产转移申请') {
      this.props.history.push(`/apply/transferDetail/${voucherId}`)
    }
    if(voucherType === '资产报废申请') {
      this.props.history.push(`/apply/invalidateDetail/${voucherId}`)
    }
    if(voucherType === '资产赔偿申请') {
      this.props.history.push(`/apply/compensateDetail/${voucherId}`)
    }
  }

  render() {
    const { roleInfos, myAssets, myTodos, myApplicationInquiry } = this.props
    // 我的申请单 || 我的待办任务 || 我的资产
    if (!roleInfos.length) {
      return null;
    }

    let links = [
      {
        iconType: 'ams-change-asset',
        iconCont: '资产转移',
        url: '/apply/transfer'
      }, {
        iconType: 'ams-pay-asset',
        iconCont: '资产赔偿',
        url: '/apply/compensate',
      }, {
        iconType: 'ams-delete-asset',
        iconCont: '资产报废',
        url: '/apply/invalidate',
      }, {
        iconType: 'ams-modify-asset',
        iconCont: '资产变更',
        url: '/transfer/ccOwnerConfirm'
      }, {
        iconType: 'ams-check-asset',
        iconCont: '资产盘点',
        url: '/assetsCheck/ownerConfirm'
      }, {
        iconType: 'ams-search-asset',
        iconCont: '资产查询',
        url: this.props.roleInfos && this.props.roleInfos.some(item => item.userRole === 'FINANCIAL_ACCOUNT') ? '/assetInquiry/ccManage' : (this.props.roleInfos.some(item => item.userRole === 'SUPER_ASSET') ? './assetInquiry/manager' : '/assetInquiry/myAsset')
      }
    ]

    // 取得人物角色, 根据人物角色roleInfos.userRole 判断 非'SYSTEM_MANAGER' or 'CCOwner' 不显示资产盘点
    if (roleInfos.some(item => item.role !== 'SYSTEM_MANAGER') && roleInfos.some(item => item.role !== 'CCOwner')) {
      links = links.filter(x => x['iconType'] !=='ams-modify-asset');
    }

    // 我的待办任务原始第一页数据
    const myTodosData = myTodos.result || []
    // 我的待办任务添加序号，然后截取slice(0, 5)
    const newTodosData = myTodosData.reduce((prev, cur, index) => {
      cur['serialNum'] = index+1
      return prev.concat(cur)
    }, []).slice(0, 5)

    // 我的申请查询原始第一页数据
    const applicationData = myApplicationInquiry.result || []
    // 我的申请查询添加序号，然后截取slice(0, 5)
    const newAppliData = applicationData.reduce((prev, cur, index) => {
      cur['serialNum'] = index+1
      return prev.concat(cur)
    }, []).slice(0, 5)

    // 我的资产
    let myAssetsData
    if (myAssets.result) {
      myAssetsData = myAssets.result
    } else {
      myAssetsData = []
    }
    const applicationCount = myApplicationInquiry.count
    const {columns, assetsCol, appliCol} = this.state
    const { clickTodosSearch, clickAssetsSearch, clickApplicationsSearch } = this
    const props = { columns, assetsCol, appliCol, newTodosData, newAppliData, myAssetsData, links, applicationCount, clickTodosSearch, clickAssetsSearch, clickApplicationsSearch}

    return <Home {...this.props} {...props} />
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Container)

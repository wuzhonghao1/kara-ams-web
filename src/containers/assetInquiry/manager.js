import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React from 'react'
import Manager from '../../components/assetInquiry/manager/manager'
import { getAssetsType, getAdminAssetsType } from '../../actions/dictionary/dictionary'
import {
  getModifyLogs,
  updateAssetDesc,
  getManagerSearch,
  exportManagerAsset,
  clearManagerAssetsTable,
} from "../../actions/assetInquiry/assetInquiry";
import { getOrgCostCenterInfo } from '../../actions/dictionary/dictionary'

const mapStateToProps = state=>({
    user: state.user,
    dictionary: state.dictionary,
    managerListPageInfo: state.assetInquiry.managerListPageInfo,
    serialNumber: state.assetInquiry.serialNumber,
})

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      getModifyLogs,
      updateAssetDesc,
      getManagerSearch,
      getAssetsType,
      getAdminAssetsType,
      exportManagerAsset,
      getOrgCostCenterInfo,
      clearManagerAssetsTable
    },
    dispatch
  ),
  dispatch
});

class Container extends React.Component {
    constructor(props) {
        super(props)
        // CcManger begin
        const columns = [
          {
            title: '序号',
            dataIndex: 'serialNo',
            key: 'serialNo',
            width: 40,
            fixed: 'left',
          },
          {
            title: '员工姓名',
            dataIndex: 'assignedName',
            key: 'assignedName',
            width: 80,
            fixed: 'left',
          },
          {
            title: '员工编号',
            dataIndex: 'staffCode',
            key: 'staffCode',
            width: 80,
            fixed: 'left',
          },
          {
            title: '资产编号',
            dataIndex: 'serialNumber',
            key: 'serialNumber',
            width: 120,
            fixed: 'left',
          },
          { // 自定义资产类别
            title: '资产类别',
            dataIndex: 'assetTypeName',
            key: 'assetTypeName',
            width: 100,
          },
          {
            title: '资产关键字',
            dataIndex: 'assetKeyName',
            key: 'assetKeyName',
            width: 100,
          },
          {
            title: '资产描述',
            dataIndex: 'description',
            key: 'description',
            width: 220,
          },
          {
            title: '当前成本(元)',
            dataIndex: 'cost',
            key: 'cost',
            width: 100,
            render: (text) => text ? text / 100 : 0.00
          },
          {
            title: '所属公司',
            dataIndex: 'assignedCompanyName',
            key: 'assignedCompanyName',
            width: 100,
          },
          {
            title: '所属BU',
            dataIndex: 'assignedSbuName',
            key: 'assignedSbuName',
            width: 100,
          },
          {
            title: '所属CC',
            dataIndex: 'assignedCostCenterName',
            key: 'assignedCostCenterName',
            width: 100,
            render: (text, record) => <div>{record.assignedCcId}</div>
          },
          {
            title: '所属地区',
            dataIndex: 'assignedRegionName',
            key: 'assignedRegionName',
            width: 100,
          },
          {
            title: '启用时间',
            dataIndex: 'serviceDateFormat',
            key: 'serviceDateFormat',
            width: 100,
          },
          {
            title: '使用年限',
            dataIndex: 'lifeInMonths',
            key: 'lifeInMonths',
            width: 80,
          },
          {
            title: '已折旧年限',
            dataIndex: 'depreciatedMonths',
            key: 'depreciatedMonths',
            width: 80,
          },
          {
            title: '变更日志',
            dataIndex: '',
            key: '',
            width: 100,
            render: (text, record, index) => { return (<a onClick={() => this.showModal(record.assetId, record.serialNumber, record.assignedCcId)}>查看日志</a>)}
          },
        ]

        this.state = {
          columns,
          visible: false,
          isBuManger: false,
          buMangerId: '', //BU管理员所属bg
        }
    }

    componentWillMount() {
        this.props.getAssetsType()
        this.props.getAdminAssetsType()
        const roleInfo = this.props.user.roleInfos;
        roleInfo.map(item => {
          if(item.userRole === 'BU_MANAGER') {
            // BU 管理员
            this.setState({ isBuManger: true, buMangerId: this.props.user.sbuId })
          }
        })
    }

// 日志弹窗
  showModal = (id, serialNumber) => {
    this.props.getModifyLogs(id, serialNumber).then((result) => {
        if (result.response.resultCode === '000000') {
          this.setState({ visible: true });
        }
      })
    }

  hideModal = () => {
    this.setState({
      visible: false,
    });
  }

  render() {
    const { columns, visible, isBuManger, buMangerId } = this.state
    const { managerListPageInfo } = this.props
    const { showModal, hideModal } = this
    // 表格数据 myAssetsListData 加入序号一栏
    const managerListData = (Object.keys(managerListPageInfo).length && managerListPageInfo.result.reduce((prev, cur, index) => {
      cur['serialNo'] = index + 1
      return prev.concat(cur)
    }, [])) || []
    const props = { columns, visible, isBuManger, buMangerId, managerListData, managerListPageInfo, showModal, hideModal }
      return <Manager {...this.props} {...props} />
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Container)

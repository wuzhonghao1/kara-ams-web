import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React from 'react'
import CcManger from '../../components/assetInquiry/ccManage/ccManage'
import { getAssetsType, getAdminAssetsType } from '../../actions/dictionary/dictionary'
import {
  getModifyLogs,
  getCcOwnerManageSearch,
  exportCCOwnerAsset,
  clearCCAssetsTable,
} from "../../actions/assetInquiry/assetInquiry";
import { getOrgCostCenterInfo } from '../../actions/dictionary/dictionary'

const mapStateToProps = state=>({
    user: state.user,
    dictionary: state.dictionary,
    ccOwnerManageListPageInfo: state.assetInquiry.ccOwnerManageListPageInfo,
    serialNumber: state.assetInquiry.serialNumber,
})

const mapDispatchToProps = dispatch => ({
        ...bindActionCreators({
        exportCCOwnerAsset,
        clearCCAssetsTable,
        getModifyLogs,
            getAssetsType,
            getAdminAssetsType,
            getCcOwnerManageSearch,
            getOrgCostCenterInfo
        }, dispatch),
        dispatch
    }
);

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
                width: 140,
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
                title: '当前成本',
                dataIndex: 'cost',
                key: 'cost',
                width: 100,
                render: (text) => text ? text / 100 : 0.00
            },
            {
              title: '累计折旧',
              dataIndex: 'deprnReserv',
              key: 'deprnReserv',
              width: 100,
              render: (text) => text ? text : 0.00
            },
            {
              title: '本月折旧',
              dataIndex: 'monthDeprn',
              key: 'monthDeprn',
              width: 100,
              render: (text) => text ? text : 0.00
            },
            {
              title: '本年折旧',
              dataIndex: 'yearDeprn',
              key: 'yearDeprn',
              width: 100,
              render: (text) => text ? text : 0.00
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
                title: '变更日志',
                dataIndex: '',
                key: '',
                width: 100,
                render: (text, record, index) => { return (<a onClick={() => this.showModal(record.assetId, record.serialNumber)}>查看日志</a>) }
            },
        ]

        this.state = {
            columns,
            visible: false,
        }
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

    componentWillMount() {
        this.props.getAssetsType()
        this.props.getAdminAssetsType()
    }

    render() {
        const { columns, visible } = this.state
        // 表格数据 myAssetsListData 加入序号一栏
        const ccOwnerManageListData = (Object.keys(this.props.ccOwnerManageListPageInfo).length && this.props.ccOwnerManageListPageInfo.result.reduce((prev, cur, index) => {
            cur['serialNo'] = index + 1
            return prev.concat(cur)
        }, [])) || []
        const { showModal, hideModal } = this
        const props = { columns, visible, ccOwnerManageListData, showModal, hideModal }
        return <CcManger {...this.props} {...props} />
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Container)

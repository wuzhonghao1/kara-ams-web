import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React from 'react'
import MyAsset from '../../components/assetInquiry/myAsset/myAsset'
import { getMyAssetSearch, exportMyAsset } from '../../actions/assetInquiry/assetInquiry'
import { getAssetsType, getAdminAssetsType } from '../../actions/dictionary/dictionary'
import { getOrgCostCenterInfo } from '../../actions/dictionary/dictionary'

const mapStateToProps = state=>({
    user: state.user,
    dictionary: state.dictionary,
    myAssetsListPageInfo: state.assetInquiry.myAssetsListPageInfo,
})

const mapDispatchToProps = dispatch => ({
        ...bindActionCreators({
            getAssetsType,
            getAdminAssetsType,
            getMyAssetSearch,
            getOrgCostCenterInfo,
        exportMyAsset,
        }, dispatch),
        dispatch
    }
);

class Container extends React.Component {
    constructor(props) {
        super(props)
        // MyAsset begin
        const columns = [
            {
                title: '资产编号',
                dataIndex: 'serialNumber',
                key: 'serialNumber',
            },
            {
                title: '资产类别',
                dataIndex: 'assetTypeName',
                key: 'assetTypeName',
            },
            {
                title: '资产关键字',
                dataIndex: 'assetKeyName',
                key: 'assetKeyName',
            },
            {
                title: '资产描述',
                dataIndex: 'description',
                key: 'description',
                width: 220,
            },
            {
                title: '所属公司',
                dataIndex: 'assignedCompanyName',
                key: 'assignedCompanyName',
            },
            {
                title: '所属BU',
                dataIndex: 'assignedSbuName',
                key: 'assignedSbuName',
            },
            {
                title: '所属CC',
                dataIndex: 'assignedCostCenterName',
                key: 'assignedCostCenterName',
                render: (text, record) => <div>{record.assignedCcId}</div>
            },
            {
                title: '所属地区',
                dataIndex: 'assignedRegionName',
                key: 'assignedRegionName',
            },
            {
                title: '启用时间',
                dataIndex: 'serviceDateFormat',
                key: 'serviceDateFormat',
            },
        ]

        this.state = {
            columns
        }
    }

    componentWillMount() {
        this.props.getAssetsType()
        this.props.getAdminAssetsType()
    }

    render() {
        const { columns } = this.state
        const props = { columns }
        return <MyAsset {...this.props} {...props} />
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Container)

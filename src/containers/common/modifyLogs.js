import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React from 'react'
import ModifyLogs from '../../components/common/ModifyLogs/modifyLogs'
import { getModifyLogs } from '../../actions/assetInquiry/assetInquiry'

const mapStateToProps = state=>({
    user: state.user,
  modifyLogs: state.assetInquiry.modifyLogs,
})

const mapDispatchToProps = dispatch => (
    bindActionCreators({
    getModifyLogs
    }, dispatch)
);

class Container extends React.Component {
    constructor(props) {
        super(props)
        const columns = [
          {
            title: '员工姓名',
            dataIndex: 'assignedOwnerName',
            key: 'assignedOwnerName',
            width: 100,
          },
          {
            title: '员工编号',
            dataIndex: 'assignedOwnerStaffCode',
            key: 'assignedOwnerStaffCode',
            width: 100,
          },
          {
            title: '资产类别',
            dataIndex: 'assetType',
            key: 'assetType',
            width: 100,
          },
          {
            title: '资产关键字',
            dataIndex: 'assetKey',
            key: 'assetKey',
            width: 100,
          },
          {
            title: '资产描述',
            dataIndex: 'description',
            key: 'description',
            width: 100,
          },
          {
            title: '所属公司',
            dataIndex: 'assignedCompany',
            key: 'assignedCompany',
            width: 100,
          },
          {
            title: '所属BU',
            dataIndex: 'assignedSbu',
            key: 'assignedSbu',
            width: 100,
          },
          {
            title: '所属CC',
            dataIndex: 'assignedCostCenter',
            key: 'assignedCostCenter',
            width: 100,
            render: (text, record) => <span>{`${text}`}</span>
          },
          {
            title: '所属地区',
            dataIndex: 'assignedRegion',
            key: 'assignedRegion',
            width: 100,
          },
          {
            title: '变更类型',
            dataIndex: 'changeType',
            key: 'changeType',
            width: 100,
          },
          {
            title: '变更时间',
            dataIndex: 'changeDate',
            key: 'changeDate',
            width: 100,
          },
        ]

        this.state = {
          columns
        }
    }

    render() {
      const { columns } = this.state;
      const { modifyLogs } = this.props;
      const props = { columns, modifyLogs }
      return <ModifyLogs {...this.props} {...props} />
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Container)

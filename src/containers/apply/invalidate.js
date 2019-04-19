import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Alert, message } from 'antd'
import Invalidate from '../../components/apply/invalidate/invalidate'
import { assetSave, assetSubmit, getApplyInfo, addAsset, deleteAsset, updateAsset } from '../../actions/apply/apply'
import { upLoadFile, downLoadFile } from '../../actions/Files/files';
const mapStateToProps = state => ({
  user: state.user,
  companyList: state.dictionary.companyList,
  regionList: state.dictionary.regionList,
  sbuList: state.dictionary.sbuList,
  assetCategory: state.dictionary.assetCategory,
  assets: state.ownerConfirm.assets,
  assetKey: state.ownerConfirm.assetKey,
})

const actions = {
  assetSave,
  assetSubmit,
  getApplyInfo,
  addAsset,
  deleteAsset,
  updateAsset,
  upLoadFile,
  downLoadFile
}

const mapDispatchToProps = dispatch=>({
  ...bindActionCreators(actions, dispatch),
  dispatch: dispatch
})

class Container extends React.Component{

  constructor(props) {
    super(props)
    this.state = {
      applyInfo:{},
      getApplyInfoStatus: true
    }
  }


  componentWillMount(){
    const { match, getApplyInfo } = this.props
    const { params } = match
    if(params.id) {
      getApplyInfo(params.id).then((res)=>{
        if(res && res.response && res.response.resultCode === '000000') {
          this.setState({applyInfo:res.response.result})
        }else{
          this.setState({getApplyInfoStatus:false})
        }
      })
    }
  }
  render(){
    const { companyList=[], regionList=[], assetCategory=[], match, location } = this.props
    const { getApplyInfoStatus, applyInfo } = this.state
    // 判断是否审批
    const isApprove = location.search === '?approve';
    const isComplete = location.search === '?complete';

    if(companyList.length === 0 || regionList.length === 0 || assetCategory.length === 0) {
      return null
    }

    if(!getApplyInfoStatus) {
      return <Alert message="获取申请单详情错误" type="error" showIcon />
    }

    const props = {...this.props, applyInfo, isApprove, isComplete}

    return <Invalidate {...props}/>
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Container)

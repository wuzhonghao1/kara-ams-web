import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import message from '../../components/common/Notice/notification'
import Asset from '../../components/apply/asset/asset'
import { getAsset } from '../../actions/apply/apply'
import { getOrgCostCenterInfo } from '../../actions/dictionary/dictionary'

const mapStateToProps = state => ({
  user: state.user,
  companyList: state.dictionary.companyList,
  regionList: state.dictionary.regionList,
  sbuList: state.dictionary.sbuList
})

const actions = {
  getAsset,
  getOrgCostCenterInfo,
}

const mapDispatchToProps = dispatch=>({
  ...bindActionCreators(actions, dispatch),
  dispatch: dispatch
})

class Container extends React.Component{

  constructor(props) {
    super(props)
    this.state = {
      assetInfo: [],
      data: [],
      setNewArr: (list) => {
        this.setState({ assetInfo: list })
      },
      loading: false
    }
  }

  componentWillMount(){
    const {userInfo, assetCategoryCheck} = this.props
    const { personId } = userInfo
    this.setState({ loading: true })
    this.props.getAsset({pageNo:1, pageSize:10, personId, assetCategory:assetCategoryCheck, assetStatus: 'PROCESSED'}).then((res)=>{
      if(res && res.response && res.response.resultCode === '000000') {
        this.setState({assetInfo:res.response.pageInfo})
        if(res.response.pageInfo.result.length === 0) {
          message.warning('该用户名下无可操作的资产')
        }
        this.setState({ loading: false })
      }else if(res && res.response && res.response.resultMessage){
        message.error(res.response.resultMessage)
        this.setState({ loading: false })
      }else{
        message.error('获取资产接口错误')
        this.setState({ loading: false })
      }
    })
  }

  render(){
    const { assetInfo, data, setNewArr, loading } = this.state
    const props = {...this.props, assetInfo, data, setNewArr, loading }
    return <Asset {...props}/>
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Container)

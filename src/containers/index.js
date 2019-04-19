import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom'
import { Spin, Alert } from 'antd';
import { getUserInfo } from '../actions/user'
import route from '../config/indexRoute'
import Main from './main'

const mapStateToProps = state => ({
  user: state.user
});

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    getUserInfo,
  }, dispatch)
);

// eslint-disable-next-line react/prefer-stateless-function
class RootContainer extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      alertMessage: null,
    }
  }

  componentWillMount(){
    sessionStorage.setItem('menu', 'apply')
    this.props.getUserInfo().then(res=>{
      if(res && res.response && res.response.resultCode === '000000') {
        const bgCode = res.response.result.companyId
        sessionStorage.setItem('bgId', res.response.result.bgId)
        sessionStorage.setItem('bgCode', bgCode.substr(0,1))
      } else if(res && res.response && res.response.resultCode === '101002') {
        // 跳转老系统
        window.location.href='http://homecloud.asiainfo.com/aifsm/SubmitApplication/CanSubmitBusinessClassBrowse.aspx'
      } else if(res && res.response && res.response.resultMessage){
        this.setState({alertMessage:res.response.resultMessage})
      }else{
        this.setState({alertMessage:'获取用户信息接口错误'})
      }
    })
  }

  render() {
    const rootPath = process.env.REACT_APP_ROOT_PATH
    const { user } = this.props
    const { alertMessage } = this.state
    const { accountId, accountName } = user
    if(alertMessage) {
      return <Alert message={alertMessage} type="error" />
    }
    if(!accountId || !accountName) {
      return <Spin className="center" />;
    }
    return (
      <Router basename={rootPath}>
        <Switch>
          {route.map((route, i) => {
            if(route.type === 'redirect') {
              return <Redirect key={i} exact={route.exact} from={route.from} to={route.to} />
            }else if(route.path !== undefined){
              return <Route
                key={i}
                exact={!!route.exact}
                path={`/${route.path}`}
                component={(props)=><Main Child={route.component} {...props} />}
              />
            }else{
              return <Route key={i} component={(props)=><Main Child={route.component} {...props} />} />
            }
          })}
        </Switch>
      </Router>)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RootContainer)

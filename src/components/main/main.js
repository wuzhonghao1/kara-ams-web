import React from 'react'
import { Layout } from 'antd'
import Header from '../../containers/header/header'
import Slider from '../slider/slider'
import Breadcrumb from '../common/breadcrumb/breadcrumb'
import Scroll from '../common/scroll/scroll'
import './main.less'
const { Content } = Layout;


//  eslint-disable-next-line react/prefer-stateless-function
export default class Root extends React.Component {
  toggle = () => {
    this.props.menuCollapsed()
  }
  render() {
    const { Child, location, history, match, collapsed } = this.props
    return (
      <Layout className="m-main">
        <Slider collapsed={collapsed} history={history} match={match} />
        <Layout style={{overflow:'hidden'}}>
          <Header collapsed={collapsed} toggle={this.toggle} />
          <Breadcrumb location={location} history={history} match={match} />
          <Content style={{height: 'calc(100vh - 121px)', padding: '0 16px 16px' }}>
            <Scroll className="main">
              <div style={{minWidth: '1080px'}} >
                <Child location={location} history={history} match={match} />
              </div>
            </Scroll>
          </Content>
        </Layout>
      </Layout>
    );
  }

}

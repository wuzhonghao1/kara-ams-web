import React from 'react'
import { Layout } from 'antd'
import './slider.less'
import Logo from './logo'
import Menu from '../../containers/slider/menu'
import Scroll from '../common/scroll/scroll'

const { Sider } = Layout;

//  eslint-disable-next-line react/prefer-stateless-function
export default class Root extends React.Component {
  render() {
    const { collapsed, history, match } = this.props
    return (
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="m-slider"
        width="210"
      >
        <Logo collapsed={collapsed} />
        {collapsed ? <Menu history={history} match={match} collapsed={collapsed} /> : <Scroll className="scroll">
          <Menu history={history} match={match} collapsed={collapsed} />
        </Scroll>}
      </Sider>
    );
  }

}

import React from 'react'
import { Layout, Icon, Menu, Tooltip } from 'antd'

import './header.less'

const { Header } = Layout;

const menu = (
  <Menu>
    <Menu.Item key="0">
      <a href="http://www.alipay.com/">1st menu item</a>
    </Menu.Item>
    <Menu.Item key="1">
      <a href="http://www.taobao.com/">2nd menu item</a>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="3">3rd menu item</Menu.Item>
  </Menu>
);

//  eslint-disable-next-line react/prefer-stateless-function
export default class Root extends React.Component {
    goCallCenter = () => {
        window.open('https://xin.asiainfo.com/channeljoin/GF67DDE95FD6459895E78302BB42EFA3')
    }
    goAddOrder = () => {
        window.open('https://itsm.asiainfo.com/customer.pl?Action=CustomerTicketMessage')
    }
    openTips = () => {
        window.open('https://kara-file.asiainfo.com/channel/0243d6fc-8d0d-42f2-8cbb-bb62341ba93c.pdf')
    }
    render() {
    const { collapsed, toggle, user={} } = this.props
    const defaultIcon = require('../../assets/images/logomini.png')
    return (
      <Header className="m-header">
        <div className="collapsed">
          <Icon
            type={collapsed ? 'menu-unfold' : 'menu-fold'}
            onClick={toggle}
          />
        </div>
        <div className="title">
          亚信资产管理系统
        </div>
        <div className="details">
          <div className="user">
              <div className="more">
                  <Icon type="question-circle-o" className="ellipsis" />
                  <ul className="barMenu">
                      <li onClick={this.goCallCenter}>
                          <div>在线客服</div>
                          <Icon type="customer-service" />
                      </li>
                      <li>
                          <Tooltip placement="left" overlayClassName="ant-tooltip-icon" title='010-82166666'>
                              <div>热线电话</div>
                              <Icon type="phone" />
                          </Tooltip>
                      </li>
                      <li onClick={this.goAddOrder}>
                          <div>提交工单</div>
                          <Icon type="file-text" />
                      </li>
                      <li onClick={this.openTips}>
                        <div>用户手册</div>
                        <Icon type="book" />
                      </li>
                  </ul>
              </div>
            <img src={user.headIcon ? user.headIcon : defaultIcon} alt={user.accountName ? user.accountName : ''} />
            <p>欢迎您，<span>{user.accountName ? user.accountName : ''}</span><span>{user.orgName ? user.orgName : ''}</span></p>
          </div>
        </div>
      </Header>
    );
  }

}

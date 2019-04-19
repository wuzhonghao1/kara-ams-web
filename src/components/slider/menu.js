import React from 'react'
import { Menu, Icon } from 'antd';
import _ from 'lodash'
import menu from '../../config/menu'
const { SubMenu } = Menu;

//  eslint-disable-next-line react/prefer-stateless-function
export default class Root extends React.Component {

  go = (t) => {
    const { history } = this.props
    history.push(t.key)
  }

  menuToggle = (t) => {
    // 记录手动展开的菜单
    const { menuToggle } = this.props
    menuToggle(t.key)
  }

  isAble = (path) => {
    const p = path.replace(/\//g,'')
    const { menuKeys } = this.props
    return _.indexOf(menuKeys,p)
  }

  getSubMenu = (subMenu) => {
    return subMenu.map((v)=>{
      if(v.hidden || this.isAble(v.link) === -1) {
        return null
      }else{
        return <Menu.Item key={v.link}>{v.name}</Menu.Item>
      }
    })
  }

  getMenu = () => {
    return menu.map((v)=>{
      if(v.link) {
        return <Menu.Item key={v.link}>
          <Icon type={v.icon} />
          <span>{v.name}</span>
        </Menu.Item>
      }else{
        if(this.isAble(v.path) !== -1) {
          return <SubMenu
            key={v.path}
            title={<span><Icon type={v.icon} /><span>{v.name}</span></span>}
            onTitleClick={this.menuToggle}
          >
            {this.getSubMenu(v.subMenu)}
          </SubMenu>
        }else{
          return null
        }
      }
    })
  }

  getMenuOpen = (menu) => {
    const open = []
    for(let key in menu.open) {
      if(menu.open[key]) {
        open.push(key)
      }
    }
    return open
  }

  getDefaultSelectedKey = (path) => {
    if(path.indexOf('/:') !== -1) {
      return path.slice(0,path.indexOf('/:'))
    }else{
      return path
    }
  }

  render() {
    const { match, menu, collapsed } = this.props
    const { path } = match
    const defaultKey = this.getDefaultSelectedKey(path)
    const menuOpen = this.getMenuOpen(menu)
    let menuProps = {}
    if(!collapsed) {
      menuProps.openKeys = menuOpen
    }
    const isFirst = sessionStorage.getItem('menu')
    return (
        isFirst && isFirst === 'apply' && path === '/' ?
          <Menu
            {...menuProps}
            mode="inline"
            defaultSelectedKeys={[defaultKey]}
            defaultOpenKeys={['apply']}
            onClick={this.go}
            className="m-menu clearfix"
          >
            {this.getMenu()}
          </Menu> :
          <Menu
            {...menuProps}
            mode="inline"
            defaultSelectedKeys={[defaultKey]}
            onClick={this.go}
            className="m-menu clearfix"
          >
            {this.getMenu()}
          </Menu>

    );
  }

}

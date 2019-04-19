import React from 'react'
import { Breadcrumb } from 'antd';
import menu from  '../../../config/menu'
import './breadcrumb.less'

export default class Root extends React.Component {

  render() {
    const { match } = this.props
    const { path, params } = match
    //path = path.indexOf('/:') !== -1 ? path.slice(0,path.indexOf('/:')) : path
    const paths = path.split('/').slice(1)
    let item = <Breadcrumb.Item>首页</Breadcrumb.Item>

    if(paths.length >= 2) {
      const items = []
      for(let v of menu) {
        if(v.path && v.path === paths[0]) {
          items[0] = v
          break
        }
      }
      for(let v of items[0].subMenu) {
        if(v.link === path) {
          items[1] = v
        }
      }
      if(params.id && (items[0].name !== '资产盘点')) {
        items.push({name: params.id})
      }
      item = items.map((v,i)=>{
        return <Breadcrumb.Item key={i}>{v.name}</Breadcrumb.Item>
      })
    }

    return <Breadcrumb className="m-breadcurmb" separator=">">
      {item}
    </Breadcrumb>
  }

}

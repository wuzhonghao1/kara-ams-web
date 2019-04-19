import React from 'react'
import { Link } from 'react-router-dom'

export default class Component extends React.Component {

  render() {
    const { collapsed } = this.props
    const logo = collapsed ? require('../../assets/images/logomini.png') : require('../../assets/images/logo.png')
    return (
      <div className={`logo ${collapsed ? 'mini' : ''}`} >
        <Link to="/" className="home">
          <img src={logo} alr="资产管理系统" />
        </Link>
      </div>
    );
  }

}

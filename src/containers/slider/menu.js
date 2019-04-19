import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Menu from '../../components/slider/menu'
import { menuToggle } from '../../actions/menu'


const mapStateToProps = state => ({
  menu: state.menu,
  menuKeys:state.user.menuKeys,
});

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    menuToggle,
  }, dispatch)
);

class RootContainer extends React.Component {

  componentWillMount(){
    // 记录默认展开的菜单
    const { match, menuToggle } = this.props
    const { path } = match
    const firstPath = path.split('/')[1]
    // 一级菜单是不需要展开的
    // TODO
    // 目前只有首页是一级菜单 排除了首页 如果后期有更多其它一级菜单 需要引人 config/menu 进行 遍历判断 对一级菜单排除
    if(firstPath) {
      menuToggle(firstPath, true)
    }
  }

  render() {
    return <Menu {...this.props} />
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RootContainer)

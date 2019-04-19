import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Header from '../../components/header/header'

const mapStateToProps = state => ({
  user: state.user
})

const mapDispatchToProps = dispatch => (
  bindActionCreators({

  },dispatch)
)

class Container extends React.Component{
  render(){
    return <Header {...this.props}/>
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Container)

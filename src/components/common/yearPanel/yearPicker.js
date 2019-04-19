import React from 'react'
import YearPanel from './yearPanel'
import { Input, Icon } from 'antd'

//  eslint-disable-next-line react/prefer-stateless-function
export default class Root extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showPanel: false,
            value: this.props.parentValue? this.props.parentValue:null,
            bodyRef: parseInt(new Date())
        }
    }
    componentWillReceiveProps(nextProps) {
        if(this.props.parentValue != nextProps.parentValue) {
            this.setState({value: nextProps.parentValue})
        }
    }
    show = ()=> {
        this.setState({showPanel: true})
        document.addEventListener('click',this.hide, false)
    }
    hide = (e)=> {
        if(document.getElementsByClassName(this.state.bodyRef)[0].contains(e.target)){

        }else {
            this.setState({showPanel: false})
            document.removeEventListener('click',this.hide)
        }

    }
    selectYear = (value)=> {
        this.setState({value: value, showPanel: false})
        this.props.onSelect(value)
        document.removeEventListener('click',this.hide)
    }
    render() {
        return (
            <div>
                <Input value={this.state.value} style={this.props.Inputstyle} onClick={this.show} placeholder="选择日期" onChange={()=>{}} suffix={<Icon type="calendar" />}/>
                {this.state.showPanel ?　<YearPanel defaultYear={this.state.value ? this.state.value : undefined } bodyRef={this.state.bodyRef} onSelect={this.selectYear} /> : null}
            </div>
        );
    }

}

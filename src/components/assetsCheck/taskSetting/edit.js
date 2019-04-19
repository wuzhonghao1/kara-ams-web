import React from 'react'
import moment from 'moment';
import { Card, Row, Col, Form, Button, Modal, Icon, Select, Table, DatePicker, Pagination, Input } from 'antd'
import './taskSetting.less'
import debounce from 'lodash/debounce'
import message from '../../common/Notice/notification'
const RangePicker = DatePicker.RangePicker;
const FormItem = Form.Item
const Option = Select.Option

class Root extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selectYear: this.props.editData.year,
            cc: this.props.editData?this.props.editData.inventoryScope:'',
            scopeData: [],
            isSelectCC: false,
            taskBeginDate: moment(this.props.editData.taskBeginDate).format('YYYY-MM-DD'),
            taskEndDate: moment(this.props.editData.taskEndDate).format('YYYY-MM-DD'),
            ownerTaskBeginDate: moment(this.props.editData.assetOwnerBeginDate).format('YYYY-MM-DD'),
            ownerTaskEndDate: moment(this.props.editData.assetOwnerEndDate).format('YYYY-MM-DD'),
            CCOwnerTaskBeginDate: moment(this.props.editData.ccOwnerBeginDate).format('YYYY-MM-DD'),
            CCOwnerTaskEndDate: moment(this.props.editData.ccOwnerEndDate).format('YYYY-MM-DD'),
        }
    }
    handleCcChange = debounce((value) => {
        // 所属CC 模糊查询
        if (value.trim() === '') {
            return;
        }
        // this.setState({ value });
        const bgId = sessionStorage.getItem('bgId')
        this.props.getOrgCostCenterInfo(bgId, value).then((d) => {
            if (d.response.resultCode === '000000') {
                const result = d.response.result
                const data = []
                result.forEach((r) => {
                    data.push({
                        key: r.costcenterId,
                        value: r.costcenterName,
                    })
                })
                this.setState({ scopeData: data, cc: value })
            }
        })
        fetch(value, data => this.setState({ cc: data.value }));
    }, 200)
    componentWillMount() {
        if(this.props.editData.inventoryType === '10') {
            let temp = []
            let bgList = this.props.dictionary.bgList
            let bgName = bgList.find((value,index,bgList)=>{
                return value.businessGroupId === parseInt(this.props.user.bgId)})
            temp.push({key:this.props.user.bgId,value: bgName.businessGroupName})
            this.setState({scopeData: temp,selectScope: this.props.editData.inventoryScope})
        }else if(this.props.editData.inventoryType === '20') {
            let temp = []
            this.props.dictionary.companyList.map((i, k)=> {
                temp.push({key: i.flexValue, value:i.description})
            })
            this.setState({scopeData: temp,selectScope: this.props.editData.inventoryScope})
        }else if(this.props.editData.inventoryType === '30') {
            let temp = []
            this.props.dictionary.sbuList.map((i, k)=> {
                temp.push({key: i.flexValue, value:i.description})
            })
            this.setState({scopeData: temp,selectScope: this.props.editData.inventoryScope})
        }else if(this.props.editData.inventoryType === '40') {
            this.setState({isSelectCC: true})
        }
    }
    inputChange = (p, v)=>{
        this.setState(prevState=>({
            [p]: v
        }))
    }
    onTaskTypeChange = (value) => {
        this.setState({scopeData: [],selectScope: '', isSelectCC: false})
        this.props.form.setFieldsValue({taskScope: ''})
        if(value === '10') {
            let temp = []
            let bgList = this.props.dictionary.bgList
            let bgName = bgList.find((value,index,bgList)=>{
                return value.businessGroupId === parseInt(this.props.user.bgId)})
            temp.push({key:this.props.user.bgId,value: bgName.businessGroupName})
            this.setState({scopeData: temp,selectScope: this.props.user.bgId})
        }else if(value === '20') {
            let temp = []
            this.props.dictionary.companyList.map((i, k)=> {
                temp.push({key: i.flexValue, value:i.description})
            })
            this.setState({scopeData: temp})
        }else if(value === '30') {
            let temp = []
            this.props.dictionary.sbuList.map((i, k)=> {
                temp.push({key: i.flexValue, value:i.description})
            })
            this.setState({scopeData: temp})
        }else if(value === '40') {
            this.setState({isSelectCC: true})
        }
    }
    saveEdit = () => {
        this.props.form.validateFields((err, values) => {
            let body = { }
            if(!values.assetCategory){
                message.error('请选择资产种类')
                return false
            }
            if(!values.taskType){
                message.error('请选择任务分类')
                return false
            }
            if(!values.inventoryType){
                message.error('请选择任务类型')
                return false
            }
            if(this.state.isSelectCC && this.state.cc === '') {
                message.error('请选择任务范围')
                return false
            }
            if(!this.state.isSelectCC && !values.taskScope) {
                message.error('请选择任务范围')
                return false
            }
            body.inventoryType = values.inventoryType
            body.taskType = values.taskType
            body.inventoryTaskId = this.props.editData.inventoryTaskId
            body.assetCategory = values.assetCategory
            body.inventoryScope = this.state.isSelectCC ? this.state.cc : values.taskScope
            body.year = this.state.selectYear
            body.taskBeginDate = moment(this.state.taskBeginDate).format('YYYY-MM-DD')
            body.taskEndDate = moment(this.state.taskEndDate).format('YYYY-MM-DD')
            body.assetOwnerBeginDate = moment(this.state.ownerTaskBeginDate).format('YYYY-MM-DD')
            body.assetOwnerEndDate = moment(this.state.ownerTaskEndDate).format('YYYY-MM-DD')
            body.ccOwnerBeginDate = moment(this.state.CCOwnerTaskBeginDate).format('YYYY-MM-DD')
            body.ccOwnerEndDate = moment(this.state.CCOwnerTaskEndDate).format('YYYY-MM-DD')
            this.props.handleEditOk(body)
        });
    }
    taskBeginDateDisable = (current) => {
        return current < moment().endOf('day');
    }
    taskEndDateDisable = (current) => {
        return current < moment(new Date(this.state.taskBeginDate)).add(-1,'days').endOf('day')
        || current < moment().add(-1,'days').endOf('day')
    }
    assetsBeginDateDisable = (current) => {
        return current < moment(new Date(this.state.taskBeginDate)).add(-1, 'days').endOf('day')
            || current > moment(new Date(this.state.taskEndDate)).endOf('day')
            || current < moment().add(-1,'days').endOf('day')
    }
    assetsEndDateDisable = (current) => {
        return current < moment(new Date(this.state.taskBeginDate)).add(-1, 'days').endOf('day')
            || current > moment(new Date(this.state.taskEndDate)).endOf('day')
            || current < moment(new Date(this.state.ownerTaskBeginDate)).add(-1, 'days').endOf('day')
            || current < moment().add(-1,'days').endOf('day')
    }
    ccBeginDateDisable = (current) => {
        return current < moment(new Date(this.state.taskBeginDate)).add(-1, 'days').endOf('day')
            || current > moment(new Date(this.state.taskEndDate)).endOf('day')
            || current < moment(new Date(this.state.ownerTaskEndDate)).endOf('day')
            || current < moment().add(-1,'days').endOf('day')
    }
    ccEndDateDisable = (current) => {
        return current < moment(new Date(this.state.taskBeginDate)).add(-1, 'days').endOf('day')
            || current > moment(new Date(this.state.taskEndDate)).endOf('day')
            || current < moment(new Date(this.state.CCOwnerTaskBeginDate)).add(-1, 'days').endOf('day')
            || current < moment().add(-1,'days').endOf('day')
    }
    render() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 14},
        };
        const formItemLayoutTime = {
            labelCol: { span: 14 },
            wrapperCol: { span: 8 },
        };
        const ic = this.inputChange;
        if(!this.props.editData){
            return null
        }
        let editData = this.props.editData
        const {assetCategory} = this.props.dictionary
        return <Form className="m-ccowner">
            <Card className="m-card" title="" bordered={false} noHovering>
                <Row>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="年度：">
                            <Input disabled addonAfter={<Icon type="calendar" />} value={editData.year} />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="任务名称：">
                            <Input disabled value={editData.taskName} />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="资产种类：">
                            {getFieldDecorator('assetCategory', {initialValue: editData.assetCategory})(
                                <Select disabled={(this.props.isEdit && editData.taskStatus === '00') ? false : true}>
                                    <Option value="">--请选择--</Option>
                                    {assetCategory.map((i,k) => {
                                        return <Option key={k} value={i.paramValue}>{i.paramValueDesc}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="任务分类：">
                            {getFieldDecorator('taskType', {initialValue: editData.taskType})(
                                <Select disabled={(this.props.isEdit && editData.taskStatus === '00') ? false : true}>
                                    <Option value="">--请选择--</Option>
                                    <Option value="10">年度盘点</Option>
                                    <Option value="20">临时盘点</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="任务类型：">
                            {getFieldDecorator('inventoryType', {initialValue: editData.inventoryType})(
                                <Select  disabled={(this.props.isEdit && editData.taskStatus === '00') ? false : true} onChange={this.onTaskTypeChange}>
                                    <Option value="">--请选择--</Option>
                                    <Option value="10">BG级盘点</Option>
                                    <Option value="20">公司级盘点</Option>
                                    <Option value="30">BU级盘点</Option>
                                    <Option value="40">CC级盘点</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        {this.state.isSelectCC ? null :<FormItem {...formItemLayout} label="盘点范围">
                            {getFieldDecorator('taskScope', {initialValue: this.state.selectScope})(
                                <Select disabled={(this.props.isEdit && editData.taskStatus === '00') ? false : true}>
                                    <Option value="">--请选择--</Option>
                                    {
                                        this.state.scopeData.map(region =>
                                            <Option key={region.key} value={region.key}>{region.value}</Option>
                                        )
                                    }
                                </Select>
                            )}
                        </FormItem>}
                        {this.state.isSelectCC ? <FormItem {...formItemLayout} label="盘点范围">
                            <Select disabled={(this.props.isEdit && editData.taskStatus === '00') ? false : true}
                                mode="combobox"
                                placeholder={'请输入costCenterId'}
                                defaultValue={this.state.cc}
                                defaultActiveFirstOption={false}
                                showArrow={false}
                                filterOption={false}
                                onChange={this.handleCcChange}
                            >
                                {
                                    this.state.scopeData.map(d =>
                                        <Option key={d.key}>
                                            {d.value}
                                        </Option>)
                                }
                            </Select>
                        </FormItem> : null}
                    </Col>
                </Row>
            </Card>
            <Card className="m-card" style={{paddingTop: '20px',borderTop: '1px dotted #bebebe'}} title="任务时间窗口" bordered={false} noHovering>
                <Row>
                    <Col span={8}>
                        <FormItem {...formItemLayoutTime} label="任务开始时间：">
                            <DatePicker allowClear={false} disabledDate={this.taskBeginDateDisable} disabled={((this.props.isEdit && editData.taskStatus === '00') || (this.props.isEdit && editData.taskStatus !== '00' && moment(this.state.taskBeginDate)) > moment()) ? false : true} defaultValue={moment(this.state.taskBeginDate)} onChange={(date)=>{this.setState({taskBeginDate: date.format('YYYY-MM-DD')})}} />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayoutTime} label="任务结束时间：">
                            <DatePicker allowClear={false} disabledDate={this.taskEndDateDisable} disabled={(this.props.isEdit && editData.taskStatus === '00') ||(this.props.isEdit && moment(this.state.taskEndDate) > moment()) ? false : true} defaultValue={moment(this.state.taskEndDate)} onChange={(date)=>{this.setState({taskEndDate: date.format('YYYY-MM-DD')})}} />
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={8}>
                        <FormItem {...formItemLayoutTime} label="资产Owner确认开始时间：">
                            <DatePicker allowClear={false} disabledDate={this.assetsBeginDateDisable} disabled={(this.props.isEdit && editData.taskStatus === '00') ||(this.props.isEdit && moment(this.state.ownerTaskBeginDate) > moment()) ? false : true} defaultValue={moment(this.state.ownerTaskBeginDate)} onChange={(date)=>{this.setState({ownerTaskBeginDate: date.format('YYYY-MM-DD')})}} />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayoutTime} label="资产Owner确认结束时间：">
                            <DatePicker allowClear={false} disabledDate={this.assetsEndDateDisable} disabled={(this.props.isEdit && editData.taskStatus === '00') ||(this.props.isEdit && moment(this.state.ownerTaskEndDate) > moment()) ? false : true} defaultValue={moment(this.state.ownerTaskEndDate)} onChange={(date)=>{this.setState({ownerTaskEndDate: date.format('YYYY-MM-DD')})}}/>
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={8}>
                        <FormItem {...formItemLayoutTime} label="CCOwner确认开始时间：">
                            <DatePicker allowClear={false} disabledDate={this.ccBeginDateDisable} disabled={(this.props.isEdit && editData.taskStatus === '00') ||(this.props.isEdit && moment(this.state.CCOwnerTaskBeginDate) > moment()) ? false : true} defaultValue={moment(this.state.CCOwnerTaskBeginDate)} onChange={(date)=>{this.setState({CCOwnerTaskBeginDate: date.format('YYYY-MM-DD')})}} />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayoutTime} label="CCOwner确认结束时间：">
                            <DatePicker allowClear={false} disabledDate={this.ccEndDateDisable}  disabled={(this.props.isEdit && editData.taskStatus === '00') ||(this.props.isEdit && moment(this.state.CCOwnerTaskEndDate) > moment()) ? false : true} defaultValue={moment(this.state.CCOwnerTaskEndDate)} onChange={(date)=>{this.setState({CCOwnerTaskEndDate: date.format('YYYY-MM-DD')})}} />
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    {this.props.isEdit ?<Col span={23} style={{textAlign: 'right'}}>
                        <Button type="primary" onClick={this.props.onCancel}>取消</Button>&emsp;&emsp;
                        <Button type="primary" onClick={this.saveEdit} >保存</Button>&emsp;&emsp;
                    </Col>:null}
                </Row>
            </Card>
        </Form>
    }

}

export default Form.create()(Root)
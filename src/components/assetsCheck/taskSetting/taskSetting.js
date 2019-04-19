import React from 'react'
import moment from 'moment';
import { Card, Row, Col, Form, Button, Modal, Icon, Select, Spin, Table, DatePicker, Pagination, Input } from 'antd'
import message from '../../common/Notice/notification'
import YearPicker from '../../common/yearPanel/yearPicker'
import './taskSetting.less'
import debounce from 'lodash/debounce'
import Edit from './edit'
const RangePicker = DatePicker.RangePicker;
const FormItem = Form.Item
const Option = Select.Option

class Root extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            columns: [{
                title: '序号 ',
                dataIndex: 'No',
                width: '5%',
            }, {
                title: '盘点年度',
                dataIndex: 'year',
                width: '5%',
            }, {
                title: '任务名称',
                dataIndex: 'name',
                width: '18%',
            }, {
                title: '资产种类',
                dataIndex: 'assetsType',
                width: '5%',
            }, {
                title: '任务分类',
                dataIndex: 'taskType',
                width: '5%',
            }, {
                title: '任务类型',
                dataIndex: 'taskCategory',
                width: '5%',
            }, {
                title: '任务状态',
                dataIndex: 'status',
                width: '5%',
            }, {
                title: '创建人',
                dataIndex: 'createAccountName',
                width: '8%',
            }, {
                title: '创建时间',
                dataIndex: 'createTime',
                width: '10%',
            }, {
                title: '操作',
                dataIndex: 'handle',
                width: '12%',
            }],
            selectYear: '',
            taskName: [],
            keywords: '',
            tableData: [],
            selectYearM: '2018',
            taskNameM: [],
            keywordsM: '',
            visible: false,
            selectRange: '',
            startEnd:[moment().add(-30, 'days'), moment()],
            ownerStartEnd:[moment().add(-30, 'days'), moment()],
            CCOwnerstartEnd:[moment().add(-30, 'days'), moment()],
            assetsType: '',
            taskCategory: '',
            taskType: '',
            taskStatus: '',
            scopeData: [],
            selectScope: '',
            isSelectCC: false,
            cc: '',
            showConfirm: false,
            closeTaskId: '',
            closeAssetCategory: '',
            showEdit: false,
            editData: {},
            isEdit: false,
            confirmTitle: '',
            subing: false,
            taskBeginDate: moment().add(1,'days').format('YYYY-MM-DD'),
            taskEndDate: moment().add(1,'days').format('YYYY-MM-DD'),
            ownerTaskBeginDate: moment().add(1,'days').format('YYYY-MM-DD'),
            ownerTaskEndDate: moment().add(1,'days').format('YYYY-MM-DD'),
            CCOwnerTaskBeginDate: moment().add(1,'days').format('YYYY-MM-DD'),
            CCOwnerTaskEndDate: moment().add(1,'days').format('YYYY-MM-DD'),
        }
    }
    handleNameChange = debounce((value) => {
        // 所属CC 模糊查询
        if (value.trim() === '') {
            return;
        }
        let temp = this.props.getTaskNameList({
            pageNo: 1,
            pageSize: 10000,
            assetCategory: 10,
            taskName: value
        }).then((d) => {
            if (d.response.resultCode === '000000') {
                const result = d.response.data
                const data = []
                result ? result.forEach((r) => {
                    data.push({
                        value: r.taskName,
                        text: r.taskName,
                    })
                }) : null
                this.setState({ taskName: data, keywords: value })
            }
        })
        fetch(value, data => this.setState({ keywords: data.value }));
    }, 200)

    inputChange = (p, v)=>{
        this.setState(prevState=>({
            [p]: v
        }))
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.taskSetting != nextProps.taskSetting) {
            let data = []
            nextProps.taskSetting.result ? nextProps.taskSetting.result.map((i, k) => {
                data.push({
                    key: k,
                    No: k+1,
                    year: i.year,
                    name: i.taskName,
                    assetsType: i.assetCategoryDesc,
                    taskType: i.taskTypeDesc,
                    taskCategory: i.inventoryTypeDesc,
                    status: i.taskStatusDesc,
                    createAccountName: i.createAccountName,
                    createTime: i.createTime,
                    handle: <div className="operate">
                        <Icon className="handleIcon"
                              type='eye-o'
                              onClick={()=>{this.showEdit(false,i)}}><span>查看</span></Icon>
                        {i.taskStatus === '00' || i.taskStatus === '10' ?<Icon className="handleIcon"
                                                                               type='edit'
                                                                               onClick={()=>{this.showEdit(true,i)}}><span>修改</span></Icon>:null}
                        {i.taskStatus === '00' ? <Icon className="handleIcon"
                                                       type='poweroff'
                                                       onClick={()=>{this.handleConfirm(i.inventoryTaskId, i.assetCategory)}}><span>启动</span></Icon>: null}
                        {i.taskStatus === '00' ? <Icon className="handleIcon"
                                                       type='close-square-o'
                                                       onClick={()=>{this.handleCancelTask(i.inventoryTaskId, i.assetCategory)}}><span>取消</span></Icon> : null}
                    </div>,
                })
            }):null
            this.setState({tableData: data})
        }
    }
    setting = ()=> {
        this.clearAddQueryParams()
        this.setState({
            visible: true,
        });
    }
    clearAddQueryParams =() =>{
        this.props.form.setFieldsValue({assetCategoryM:'', taskTypeM: '', inventoryTypeM: '', taskScopeM: ''})
        this.setState({
            taskBeginDate: moment().add(1, 'days').format('YYYY-MM-DD'),
            taskEndDate: moment().add(1, 'days').format('YYYY-MM-DD'),
            ownerTaskBeginDate: moment().add(1, 'days').format('YYYY-MM-DD'),
            ownerTaskEndDate: moment().add(1, 'days').format('YYYY-MM-DD'),
            CCOwnerTaskBeginDate: moment().add(1, 'days').format('YYYY-MM-DD'),
            CCOwnerTaskEndDate: moment().add(1, 'days').format('YYYY-MM-DD')
        })
    }
    clearQueryParams =() =>{
        this.props.form.setFieldsValue({taskStatus: '', taskType: '', inventoryType: '', assetCategory: ''})
        this.setState({
            selectYear: '',
            keywords: ''})
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
    handleOk = () => {
        this.props.form.validateFields((err, values) => {
            let body = { }
            if(!values.assetCategoryM){
                message.error('请选择资产种类')
                return false
            }
            if(!values.taskTypeM){
                message.error('请选择任务分类')
                return false
            }
            if(!values.inventoryTypeM){
                message.error('请选择任务类型')
                return false
            }
            if(this.state.isSelectCC && this.state.cc === '') {
                message.error('请选择任务范围')
                return false
            }
            if(!this.state.isSelectCC && !values.taskScopeM) {
                message.error('请选择任务范围')
                return false
            }

            body.inventoryType = values.inventoryTypeM
            body.taskType = values.taskTypeM
            body.assetCategory = values.assetCategoryM
            body.inventoryScope = this.state.isSelectCC ? this.state.cc : values.taskScopeM
            body.year = this.state.selectYearM
            body.taskBeginDate = moment(this.state.taskBeginDate).format('YYYY-MM-DD')
            body.taskEndDate = moment(this.state.taskEndDate).format('YYYY-MM-DD')
            body.assetOwnerBeginDate = moment(this.state.ownerTaskBeginDate).format('YYYY-MM-DD')
            body.assetOwnerEndDate = moment(this.state.ownerTaskEndDate).format('YYYY-MM-DD')
            body.ccOwnerBeginDate = moment(this.state.CCOwnerTaskBeginDate).format('YYYY-MM-DD')
            body.ccOwnerEndDate = moment(this.state.CCOwnerTaskEndDate).format('YYYY-MM-DD')
            this.setState({ subing: true })
            this.props.addTask(body).then((result)=> {
                this.setState({ subing: false })
                if(result.response.resultCode === '000000') {
                    message.success('新增成功')
                    this.setState({ loading: false, visible: false });
                    this.queryList()
                }
                else {
                    message.error(result.response.resultMessage)
                }
            })
        });
    }
    handleCancel = () => {
        this.setState({ visible: false });
    }
    selectYear = (value)=> {
        this.setState({selectYear:value})
    }
    onTaskTypeChange = (value) => {
        this.setState({scopeData: [],selectScope: '', isSelectCC: false})
        this.props.form.setFieldsValue({taskScopeM: ''})
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
    selectYearM = (value)=> {
        this.setState({selectYearM:value})
    }
    queryList = (e) => {
        if (e) { e.preventDefault(); }
        this.props.form.validateFields((err, values) => {
            let body = {
                pageNo: 1,
                pageSize: 10
            }
            if(this.state.selectYear !== '') {
                body.year = this.state.selectYear
            }
            if(this.state.keywords !== ''){
                body.taskName = this.state.keywords
            }
            if(values.taskType){
                body.taskType = values.taskType
            }
            if(values.assetCategory){
                body.assetCategory = values.assetCategory
            }
            if(values.inventoryType){
                body.inventoryType = values.inventoryType
            }
            if(values.taskStatus){
                body.taskStatus = values.taskStatus
            }
            this.props.getTaskSettingQueryList(body)
        });
    }
    handleConfirm = (taskId,assetsId) => {
        this.setState({showConfirm: true,closeTaskId: taskId,closeAssetCategory: assetsId, confirmTitle: '确认启动吗'})
    }
    handleClose = () => {
        if(this.state.confirmTitle === '确认启动吗') {
          this.setState({ subing: true })
            this.props.closeTask(this.state.closeTaskId,this.state.closeAssetCategory).then((result)=> {
              this.setState({ subing: false })
                if(result.response.resultCode === '000000') {
                    message.success('启动成功')
                    this.queryList()
                    this.setState({ showConfirm: false });
                }
                else {
                    message.error(result.response.resultMessage)
                }
            })
        }else  {
          this.setState({ subing: true })
            this.props.cancelTask(this.state.closeTaskId,this.state.closeAssetCategory).then((result)=> {
              this.setState({ subing: false })
                if(result.response.resultCode === '000000') {
                    message.success('取消成功')
                    this.queryList()
                    this.setState({ showConfirm: false });
                }
                else {
                    message.error(result.response.resultMessage)
                }
            })
        }
    }
    changePage = (current, size) => {
        // 翻页
        this.props.form.validateFields((err, values) => {
            let body = {
                pageNo: current,
                pageSize: size
            }
            if(this.state.selectYear !== '') {
                body.year = this.state.selectYear
            }
            if(this.state.keywords != ''){
                body.taskName = this.state.keywords
            }
            if(values.taskType){
                body.taskType = values.taskType
            }
            if(values.assetCategory){
                body.assetCategory = values.assetCategory
            }
            if(values.inventoryType){
                body.inventoryType = values.inventoryType
            }
            if(values.taskStatus){
                body.taskStatus = values.taskStatus
            }
            this.props.getTaskSettingQueryList(body)
        });
    }
    showEdit = (type,data) => {
        this.setState({editData: data,showEdit: true, isEdit: type})
    }
    handleEditCancel = ()=> {
        this.setState({showEdit: false})
    }
    handleCancelTask = (taskId,assetsId) => {
        this.setState({showConfirm: true,closeTaskId: taskId,closeAssetCategory: assetsId, confirmTitle: '确认取消吗'})
    }
    handleEditOk =(body)=>{
        this.props.editTask(body).then((result)=> {
            if(result.response.resultCode === '000000') {
                message.success('修改成功')
                this.setState({ showEdit: false });
                this.queryList()
            }
            else {
                message.error(result.response.resultMessage)
            }
        })
    }
    //
    // disabledBeginDate=(current)=> {
    //     // Can not select days before today and today
    //     return current < moment().endOf('day');
    //
    // }
    // disabledDate=(current)=> {
    // // Can not select days before today and today
    // return current < moment(new Date(this.state.taskBeginDate)).add(-1,'days').endOf('day');
    //
    // }
    // disabledRangeDate=(current)=> {
    //     // Can not select days before today and today
    //     return current < moment(new Date(this.state.taskBeginDate)).add(-1,'days').endOf('day')||
    //         current > moment(new Date(this.state.taskEndDate)).endOf('day');
    //
    // }

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
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 14 },
        };
        const formItemLayoutTime = {
            labelCol: { span: 14 },
            wrapperCol: { span: 8 },
        };
        const ic = this.inputChange;
        const {assetCategory} = this.props.dictionary
        return <Form className="m-taskSetting">
          <Spin spinning={this.state.subing}>
            <Card className="m-card" title="查询条件" bordered={false} noHovering>
                <Row>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="年度：">
                            <YearPicker parentValue={this.state.selectYear} disabled onSelect={this.selectYear}></YearPicker>
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="任务名称：">
                            <Select
                                mode="combobox"
                                placeholder={'请输入任务名称'}
                                defaultActiveFirstOption={false}
                                showArrow={false}
                                value={this.state.keywords}
                                filterOption={false}
                                onChange={this.handleNameChange}
                            >
                                {
                                    this.state.taskName.map(d =>
                                        <Option key={d.value}>
                                            {d.text}
                                        </Option>)
                                }
                            </Select>
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="资产种类：">
                            {getFieldDecorator('assetCategory', {initialValue: ''})(
                                <Select>
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
                        <FormItem {...formItemLayout} label="任务状态：">
                            {getFieldDecorator('taskStatus', {initialValue: ''})(
                                <Select>
                                    <Option value="">--请选择--</Option>
                                    <Option value="00">未启动</Option>
                                    <Option value="10">进行中</Option>
                                    <Option value="20">已完成</Option>
                                    <Option value="30">已取消</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="任务分类：">
                            {getFieldDecorator('taskType', {initialValue: ''})(
                                <Select>
                                    <Option value="">--请选择--</Option>
                                    <Option value="10">年度盘点</Option>
                                    <Option value="20">临时盘点</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="任务类型：">
                            {getFieldDecorator('inventoryType', {initialValue: ''})(
                                <Select>
                                    <Option value="">--请选择--</Option>
                                    <Option value="10">BG级盘点</Option>
                                    <Option value="20">公司级盘点</Option>
                                    <Option value="30">BU级盘点</Option>
                                    <Option value="40">CC级盘点</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col className="taRight" span={24}>
                        <FormItem>
                            <Button type="primary" onClick={this.queryList}>查询</Button>
                            <Button type="primary" onClick={this.clearQueryParams}>清空</Button>
                        </FormItem>
                    </Col>
                </Row>
            </Card>
            <Card className="m-card" style={{marginTop: '20px'}} title="查询结果" extra={<Button type="primary" onClick={this.setting}>新增</Button>} bordered={false} noHovering>
                <Row style={{marginTop: '12px'}}>
                    <Col span={24}>
                        <Table
                            columns={this.state.columns}
                            dataSource={this.state.tableData}
                            pagination={false}></Table>
                        <br/>
                        <div className="paginationPanel">
                            <Pagination
                                className="pagination"
                                showSizeChanger
                                onShowSizeChange={this.changePage}
                                showTotal={t=>`共${t}条`}
                                onChange={this.changePage}
                                showQuickJumper
                                total={this.props.taskSetting.count}></Pagination>
                        </div>
                    </Col>
                </Row>
            </Card>
            <Modal
                visible={this.state.visible}
                title="盘点任务"
                width="1000px"
                className="m-taskSetting-modal"
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                footer={[
                    <Button key="back" size="large" onClick={this.handleCancel}>取消</Button>,
                    <Button key="submit" type="primary" size="large" onClick={this.handleOk}>
                        提交
                    </Button>,
                ]}>
                <Card className="m-card" title="" bordered={false} noHovering>
                    <Row>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="年度：">
                                <Input disabled addonAfter={<Icon type="calendar" />} value={this.state.selectYearM} />
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="任务名称：">
                                <Input disabled value={this.state.keywordsM} />
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="资产种类：">
                                {getFieldDecorator('assetCategoryM', {initialValue: ''})(
                                    <Select>
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
                                {getFieldDecorator('taskTypeM', {initialValue: ''})(
                                    <Select onChange={this.onTaskCategoryChange}>
                                        <Option value="">--请选择--</Option>
                                        <Option value="10">年度盘点</Option>
                                        <Option value="20">临时盘点</Option>
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="任务类型：">
                                {getFieldDecorator('inventoryTypeM', {initialValue: ''})(
                                    <Select onChange={this.onTaskTypeChange}>
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
                                {getFieldDecorator('taskScopeM', {initialValue: this.state.selectScope})(
                                    <Select>
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
                                <Select
                                    mode="combobox"
                                    placeholder={'请输入costCenterId'}
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
                                <DatePicker allowClear={false}  disabledDate={this.taskBeginDateDisable} value={moment(this.state.taskBeginDate)} onChange={(date)=>{this.setState({taskBeginDate: date.format('YYYY-MM-DD')})}} />
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayoutTime} label="任务结束时间：">
                                <DatePicker allowClear={false} disabledDate={this.taskEndDateDisable}
                                            value={moment(this.state.taskEndDate)} onChange={(date)=>{this.setState({taskEndDate: date.format('YYYY-MM-DD')})}} />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={8}>
                            <FormItem {...formItemLayoutTime} label="资产Owner确认开始时间：">
                                <DatePicker allowClear={false} disabledDate={this.assetsBeginDateDisable} value={moment(this.state.ownerTaskBeginDate)} onChange={(date)=>{this.setState({ownerTaskBeginDate: date.format('YYYY-MM-DD')})}} />
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayoutTime} label="资产Owner确认结束时间：">
                                <DatePicker allowClear={false} disabledDate={this.assetsEndDateDisable} value={moment(this.state.ownerTaskEndDate)} onChange={(date)=>{this.setState({ownerTaskEndDate: date.format('YYYY-MM-DD')})}}/>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={8}>
                            <FormItem {...formItemLayoutTime} label="CCOwner确认开始时间：">
                                <DatePicker allowClear={false} disabledDate={this.ccBeginDateDisable} value={moment(this.state.CCOwnerTaskBeginDate)} onChange={(date)=>{this.setState({CCOwnerTaskBeginDate: date.format('YYYY-MM-DD')})}} />
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayoutTime} label="CCOwner确认结束时间：">
                                <DatePicker allowClear={false} disabledDate={this.ccEndDateDisable} value={moment(this.state.CCOwnerTaskEndDate)} onChange={(date)=>{this.setState({CCOwnerTaskEndDate: date.format('YYYY-MM-DD')})}} />
                            </FormItem>
                        </Col>
                    </Row>
                </Card>
            </Modal>
            <Modal
                   title="请您确认"
                   className="m-confirm-modal"
                   visible={this.state.showConfirm}
                   onOk={this.handleClose}
                   onCancel={()=>{this.setState({showConfirm: false})}}
            >
                <p className="confirmContent">{this.state.confirmTitle}？</p>
            </Modal>
            {this.state.showEdit?<Modal visible={this.state.showEdit}
                                        title="盘点任务"
                   footer={null}
                   onCancel={this.handleEditCancel}
                   width="1000px">
                <Edit editData={this.state.editData}
                      user={this.props.user}
                      handleEditOk={this.handleEditOk}
                      onCancel={this.handleEditCancel}
                      isEdit={this.state.isEdit}
                      dictionary = {this.props.dictionary}
                      getOrgCostCenterInfo = {this.props.getOrgCostCenterInfo}
                      getTaskSettingDetail = {this.props.getTaskSettingDetail}
                      taskSettingDetail = {this.props.taskDetail}
                ></Edit>
            </Modal>:null}
          </Spin>
        </Form>
    }

}

export default Form.create()(Root)
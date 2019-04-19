import React from 'react'
import { Card, Row, Col, Form, Button, Select, Table, Spin } from 'antd'
import YearPicker from '../../common/yearPanel/yearPicker'
import { saveAs } from '../../../util/FileSaver';
import './taskQuery.less'
import debounce from 'lodash/debounce'
import message from '../../common/Notice/notification'
const FormItem = Form.Item
const { Option } = Select

const columns = [{
    title: '资产总数',
    dataIndex: 'assetsTotal',
}, {
    title: '资产Owner总数',
    dataIndex: 'assetsOwnerTotal',
}, {
    title: '确认同意资产数',
    dataIndex: 'agreeTotal',
}, {
    title: '报废资产数',
    dataIndex: 'scrapTotal',
}, {
    title: '转移资产数',
    dataIndex: 'trasformTotal',
}, {
    title: '赔偿资产数',
    dataIndex: 'compensateTotal',
}, {
    title: '系统确认资产数',
    dataIndex: 'confirmTotal',
}, {
    title: '未完成确认资产数',
    dataIndex: 'unConfirmTotal',
}, {
    title: '完成率',
    dataIndex: 'complete',
}];

class Root extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selectYear: '',
            taskName: [],
            keywords: '',
            loading: false,
            exportLoading: false
        }
    }
    selectYear = (year)=> {
        this.setState({selectYear: year})
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
            this.setState({loading: true})
            this.props.getTaskList(body).then(res => { this.setState({loading: false}) })
        });
    }
    componentDidMount() {
        this.queryList()
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
                const result = d.response.results.result
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
    exportDetail = (id,name) => {
        this.setState({exportLoading: true})
        this.props.exportTaskDeail({taskName:name,inventoryTaskId:id}).then((result)=>{
          this.setState({exportLoading: false})
            if(result.response.resultCode === '000000') {
                message.error('无导出数据')
                return false
            }
            saveAs(result.response, `盘点查询明细表_${Date.parse(new Date())}.xls`);
        })
    }
    clearQueryParams = () => {
        this.props.form.setFieldsValue({taskStatus: '', taskType: '', inventoryType: '', assetCategory: ''})
        this.setState({
            selectYear: '',
            keywords: ''})
    }
    getTaskList=()=>{
        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 14 }
        };
        let dom = []
        this.props.taskQuery.taskList ? this.props.taskQuery.taskList.map((i,k) => {
            dom.push(
                <Card className="m-card" key={k} bordered={false} noHovering>
                    <Card className="m-task" title={`任务${k+1}`} bordered={true} style={{paddingBottom: '12px'}} noHovering>
                        <Row className="m-color">
                            <Col span={10}>
                                <FormItem {...formItemLayout} label={<span className="colorFull">任务名称</span>}>
                                    <label className="colorFull">{i.taskName}</label>
                                </FormItem>
                            </Col>
                            <Col span={6}>
                                <FormItem {...formItemLayout} label={<span className="colorFull">开始时间</span>}>
                                    <label className="colorFull">{i.taskBeginDate}</label>
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label={<span className="colorFull">结束时间</span>}>
                                    <label className="colorFull">{i.taskEndDate}</label>
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={10}>
                                <FormItem {...formItemLayout} label="任务类型">
                                    <label>{i.inventoryTypeDesc}</label>
                                </FormItem>
                            </Col>
                            <Col span={6}>
                                <FormItem {...formItemLayout} label="任务状态">
                                    <label>{i.taskStatusDesc}</label>
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label="剩余天数">
                                    <label>{i.remainDays}</label>
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={23}>
                                <FormItem>
                                    <h3>盘点任务执行情况</h3>
                                    <Button type="primary" onClick={()=>{this.exportDetail(i.inventoryTaskId,i.taskName)}} className="exportDetail">导出盘点明细</Button>
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Table
                                    style={{marginTop: '12px'}}
                                    pagination={false}
                                    loading={this.state.loading}
                                    columns={columns}
                                    dataSource={[{key: k,
                                        assetsTotal: <a href={`taskDetailQuery/${i.inventoryTaskId}/${i.taskName}/all`}>{i.assetCount}</a>,
                                        assetsOwnerTotal: <a href={`taskDetailQuery/${i.inventoryTaskId}/${i.taskName}/all`}>{i.assetOwnerCount}</a>,
                                        agreeTotal: <a href={`taskDetailQuery/${i.inventoryTaskId}/${i.taskName}/10`}>{i.awnerAgreeCount}</a>,
                                        scrapTotal: <a href={`taskDetailQuery/${i.inventoryTaskId}/${i.taskName}/30`}>{i.retirementCount}</a>,
                                        trasformTotal: <a href={`taskDetailQuery/${i.inventoryTaskId}/${i.taskName}/20`}>{i.transferCount}</a>,
                                        compensateTotal: <a href={`taskDetailQuery/${i.inventoryTaskId}/${i.taskName}/40`}>{i.payForCount}</a>,
                                        confirmTotal: <a href={`taskDetailQuery/${i.inventoryTaskId}/${i.taskName}/50`}>{i.autoCount}</a>,
                                        unConfirmTotal: <a href={`taskDetailQuery/${i.inventoryTaskId}/${i.taskName}/00`}>{i.undoneCount}</a>,
                                        complete: i.completionRate,
                                }]} />
                            </Col>
                        </Row>
                    </Card>
                </Card>)
        }): null
        return dom
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 14 }
        };
        const {assetCategory } = this.props.dictionary
        return <Form className="m-taskQuery">
            <Spin spinning={this.state.exportLoading}>
            <Card className="m-card" title="查询条件" bordered={false} noHovering>
                <Row>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="年度：">
                            {getFieldDecorator('year')(
                                <YearPicker parentValue={this.state.selectYear} onSelect={this.selectYear}></YearPicker>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="任务名称：">

                            <Select
                                mode="combobox"
                                placeholder={'请输入任务名称'}
                                defaultActiveFirstOption={false}
                                showArrow={false}
                                filterOption={false}
                                value={this.state.keywords}
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
                            {getFieldDecorator('taskStatus', {initialValue: '10'})(
                            <Select onChange={this.onTaskStatusChange}>
                                <Option value="">--请选择--</Option>
                                <Option value="10">进行中</Option>
                                <Option value="20">已完成</Option>
                            </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="任务分类：">
                            {getFieldDecorator('taskType', {initialValue: ''})(
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
                            {getFieldDecorator('inventoryType', {initialValue: ''})(
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
            <Card className="m-card" style={{paddingBottom: '0'}} bordered={false} noHovering>
                {this.getTaskList()}
            </Card>
            </Spin>
        </Form>
    }

}

export default Form.create()(Root)
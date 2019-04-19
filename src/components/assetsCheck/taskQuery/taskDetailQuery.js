import React from 'react'
import { Card, Row, Col, Form, Button, Select,Icon,Modal, Table, Input, Pagination, Spin } from 'antd'
import './taskDetailQuery.less'
import debounce from 'lodash/debounce'
import StaffFinder from '../../common/staffFinder/staffFinder'
import message from '../../common/Notice/notification'
import { saveAs } from '../../../util/FileSaver';
const FormItem = Form.Item
const { Option, OptGroup } = Select

const columns =
    [
        {
    title: '序号',
    dataIndex: 'No',
    width: 50,
    fixed: 'left'
}, {
    title: '盘点任务名称',
    dataIndex: 'taskName',
        width: 150,
    fixed: 'left'
}, {
    title: '员工姓名',
    dataIndex: 'employeeName',
        width: 80,
    fixed: 'left'
}, {
    title: '员工编号',
    dataIndex: 'employeeNO',
    width: 80,
    fixed: 'left'
}, {
    title: '资产编号',
    dataIndex: 'assetsNO',
    fixed: 'left',
        width: 80,
}, {
    title: '资产类别',
    dataIndex: 'assetsType',
        width: 80,
}, {
    title: '资产关键字',
    dataIndex: 'assetsKeywords',
        width: 80,
}, {
    title: '资产描述',
    dataIndex: 'assetsDesc',
        width: 120,
}, {
    title: '所属公司',
    dataIndex: 'company',
        width: 80,
}, {
    title: '所属BU',
    dataIndex: 'BU',
        width: 80,
}, {
    title: '所属CC',
    dataIndex: 'CC',
        width: 120,
}, {
    title: '所属地区',
    dataIndex: 'city',
        width: 80,
}, {
    title: '启用时间',
    dataIndex: 'startTime',
        width: 80,
}, {
    title: '资产Owner确认情况',
    children: [{
        title: '确认结果',
        dataIndex: 'ownerResult',
        width: 80,
    }, {
        title: '确认说明',
        dataIndex: 'ownerDesc',
        width: 110,
    }, {
        title: '确认人',
        dataIndex: 'owner',
        width: 80,
    }, {
        title: '确认时间',
        dataIndex: 'confirmTime',
        width: 110,
    }],
},{
    title: 'CCOwner确认情况',
    children: [{
        title: '确认结果',
        dataIndex: 'ccOwnerResult',
        width: 80,
    }, {
        title: '确认说明',
        dataIndex: 'ccOwnerDesc',
        width: 110,
    }, {
        title: '确认人',
        dataIndex: 'ccOwner',
        width: 80,
    }, {
        title: '确认时间',
        dataIndex: 'ccConfirmTime',
        width: 110,
    }],
}
    ];

class Root extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selectYear: '',
            keywords: this.props.match.params.taskName === 'null' ? '' : this.props.match.params.taskName,
            cc: '',
            ccData: [],
            employeeId: '',
            assetsType: '',
            assetsKeywords: '',
            assetsNO: '',
            assetsDesc: '',
            company: '',
            BU: '',
            city: '',
            taskName: [],
            taskStatus: '',
            result: '',
            visible: false,
            expand: false,
            accountName: '',
            exportLoading: false
        }
    }

    exportAllDetail = ()=> {
        this.props.form.validateFields((err, values) => {
            this.setState({exportLoading: true})
            let body = {
                pageNo: this.props.taskDetail.pageNo,
                pageSize: 10
            }
            if(this.state.selectYear !== '') {
                body.year = this.state.selectYear
            }
            if(this.state.taskName !== ''){
                body.taskName = this.state.keywords
            }
            if(values.assetCategory){
                body.assetCategory = values.assetCategory
            }
            if(values.taskType){
                body.taskType = values.taskType
            }
            if(values.inventoryType) {
                body.inventoryType = values.inventoryType
            }
            if(values.taskStatus){
                body.taskStatus = values.taskStatus
            }
            if(values.confirmResult){
                body.assetOwnerConfirm = values.confirmResult
            }
            if(values.accountName){
                body.employeeMsg = values.accountName
            }
            if(values.assetsDesc){
                body.description = values.assetsDesc
            }
            if(values.assetsNO){
                body.assetNumber = values.assetsNO
            }
            if(values.assetKeywords){
                body.assetKey = values.assetKeywords
            }
            if(values.bu){
                body.assignedSbuId = values.bu
            }
            if(this.state.cc !== ''){
                body.assignedCcId = this.state.cc
            }
            if(values.company){
                body.assignedCompanyId = values.company
            }
            if(values.region){
                body.assignedRegionId = values.region
            }
            this.props.exportSnapshotDetail(body).then((result)=>{
                if(result.response.resultCode === '000000') {
                    message.error('无导出数据')
                    this.setState({exportLoading: false})
                    return false
                }
                saveAs(result.response, `盘点查询明细表_${Date.parse(new Date())}.xls`);
                this.setState({exportLoading: false})
            })
        });
    }
    queryList = (e) => {
        if (e) { e.preventDefault(); }
        this.props.form.validateFields((err, values) => {
            let body = {
                pageNo: this.props.taskDetail.pageNo,
                pageSize: 10
            }
            if(this.state.selectYear !== '') {
                body.year = this.state.selectYear
            }
            if(this.state.keywords !== ''){
                body.taskName = this.state.keywords
            }else {
                body.taskName = this.props.params
            }
            if(values.assetType){
                body.assetType = values.assetType
            }
            if(values.taskType){
                body.taskType = values.taskType
            }
            if(values.inventoryType) {
                body.inventoryType = values.inventoryType
            }
            if(values.taskStatus){
                body.taskStatus = values.taskStatus
            }
            if(values.confirmResult){
                body.assetOwnerConfirm = values.confirmResult
            }
            if(values.accountName){
                body.employeeMsg = values.accountName
            }

            if(values.assetsDesc){
                body.description = values.assetsDesc
            }
            if(values.assetsNO){
                body.assetNumber = values.assetsNO
            }
            if(values.assetKeywords){
                body.assetKey = values.assetKeywords
            }
            if(values.bu){
                body.assignedSbuId = values.bu
            }
            if(this.state.cc !== ''){
                body.assignedCcId = this.state.cc
            }
            if(values.company){
                body.assignedCompanyId = values.company
            }
            if(values.region){
                body.assignedRegionId = values.region
            }
            this.props.getDetailList(body)
        });
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
            if(this.state.taskName !== ''){
                body.taskName = this.state.keywords
            }
            if(values.assetCategory){
                body.assetCategory = values.assetCategory
            }
            if(values.taskType){
                body.taskType = values.taskType
            }
            if(values.inventoryType) {
                body.inventoryType = values.inventoryType
            }
            if(values.taskStatus){
                body.taskStatus = values.taskStatus
            }
            if(values.confirmResult){
                body.assetOwnerConfirm = values.confirmResult
            }
            if(values.accountName){
                body.employeeMsg = values.accountName
            }
            if(values.assetsDesc){
                body.description = values.assetsDesc
            }
            if(values.assetsNO){
                body.assetNumber = values.assetsNO
            }
            if(values.assetKeywords){
                body.assetKey = values.assetKeywords
            }
            if(values.bu){
                body.assignedSbuId = values.bu
            }
            if(this.state.cc !== ''){
                body.assignedCcId = this.state.cc
            }
            if(values.company){
                body.assignedCompanyId = values.company
            }
            if(values.region){
                body.assignedRegionId = values.region
            }
            this.props.getDetailList(body)
        });
    }
    selectYear = (year)=> {
        this.setState({selectYear: year})
    }
    // 选择用户的回调
    selectStaff = (staff)=> {
        const { accountName } = staff[0]
        this.props.form.setFieldsValue({accountName})
        this.modalClose()
    }
    clearParams = () => {
        this.props.form.setFieldsValue({assetType: '',
            confirmResult: '',accountName: '',taskName: '',assetsDesc: '',assetsNO: '',assetKeywords: '',bu: '',
            company: '',region: ''})
        this.setState({ keywords: '',cc: ''})
    }
    handleNameChange = debounce((value) => {
        // 所属name 模糊查询
        if (value.trim() === '') {
            this.setState({keywords: ''})
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

    componentWillMount () {
        this.props.getAssetsType()
        this.props.getAdminAssetsType()
    }
    componentDidMount() {
        this.props.form.setFieldsValue({confirmResult: this.props.match.params.taskType === 'all' ? '' : this.props.match.params.taskType})
        this.queryList()
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.taskDetail != nextProps.taskDetail) {
            let data = []
            nextProps.taskDetail.result.map((i, k) => {
                data.push({
                    key: k,
                    No: k+1,
                    taskName: i.taskName,
                    employeeName: i.assignedOwnerName,
                    employeeNO: i.assignedOwnerNumber,
                    assetsNO: i.serialNumber,
                    assetsType: i.assetType,
                    assetsKeywords: i.assetKey,
                    assetsDesc: i.description,
                    company: i.assignedCompanyName,
                    BU: i.assignedSbuName,
                    CC: i.assignedCcId,
                    city: i.assignedRegionName,
                    startTime: i.serviceDate,
                    ownerResult: i.ownerConfirmDesc,
                    ownerDesc: i.ownerConfirmRemark,
                    owner: i.assetOwnerConfirmName,
                    confirmTime: i.ownerConfirmTime,
                    ccOwnerResult: i.ccOwnerConfirmDesc,
                    ccOwnerDesc: i.ccOwnerConfirmRemark,
                    ccOwner: i.assetCcOwner,
                    ccConfirmTime: i.ccOwnerConfirmTime,
                })
            })
            this.setState({tableData: data})
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
                        value: r.costcenterId,
                        text: r.costcenterName,
                    })
                })
                this.setState({ ccData: data, cc: value })
            }
        })
        fetch(value, data => this.setState({ cc: data.value }));
    }, 200)
    modalOpen = () => {
        this.setState({ visible: true });
    }
    modalClose = () => {
        this.setState({ visible: false });
    }
    render() {
        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 14 }
        };
        const {assetsType, adminAssetsType } = this.props.dictionary
        const { getFieldDecorator } = this.props.form;
        return <Form className="m-taskQueryDetail">
            <Spin spinning={this.state.exportLoading}>
            <Card className="m-card" title="查询条件" bordered={false} noHovering>
                <Row style={{marginTop: '10px'}}>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="盘点任务名称">
                            {getFieldDecorator('taskName', {initialValue: this.state.keywords})(
                                <Select
                                    mode="combobox"
                                    placeholder={'请输入任务名称'}
                                    defaultActiveFirstOption={false}
                                    showArrow={false}
                                    filterOption={false}
                                    onChange={this.handleNameChange}
                                >
                                    {
                                        this.state.taskName.map(d =>
                                            <Option key={d.value}>
                                                {d.text}
                                            </Option>)
                                    }
                                </Select>)}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="员工信息">
                            <div className="u-select-user-input">
                                {getFieldDecorator('accountName',)(
                                    <Input suffix={<Icon type="search" onClick={this.modalOpen}/>} />
                                )}
                            </div>
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="资产编号">
                            {getFieldDecorator('assetsNO', {initialValue: ''})(
                                <Input />)}
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={8}>
                        <FormItem label="资产类别" {...formItemLayout}>
                            {
                                getFieldDecorator('assetType', {initialValue: ''})(
                                    <Select>
                                        <Option key={'-1'} value=''>--请选择--</Option>
                                        <OptGroup label='IT资产类'>
                                            {assetsType.map((item) => (<Option key={item.paramValue} value={item.paramValue}>{item.paramValueDesc}</Option>))}
                                        </OptGroup>
                                        <OptGroup label='行政资产类'>
                                            {adminAssetsType.map((item) => (<Option key={item.paramValue} value={item.paramValue}>{item.paramValueDesc}</Option>))}
                                        </OptGroup>
                                    </Select>)
                            }
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="资产Owner确认结果">
                            {getFieldDecorator('confirmResult', {initialValue: this.props.match.params.taskType === 'all' ? '' : this.props.match.params.taskType})(
                                <Select>
                                    <Option key="" value="">--请选择--</Option>
                                    <Option key="00" value="00">未确认</Option>
                                    <Option key="10" value="10">同意</Option>
                                    <Option key="20" value="20">转移</Option>
                                    <Option key="30" value="30">报废</Option>
                                    <Option key="40" value="40">赔偿</Option>
                                    <Option key="50" value="50">系统确认</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="所属公司">
                            {getFieldDecorator('company', {initialValue: ''})(
                                <Select>
                                    <Option value="">--请选择--</Option>
                                    {this.props.dictionary.companyList.map((i,k) => {
                                        return <Option key={k} value={i.flexValue}>{i.description}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Row style={!this.state.expand ? {display: 'none'} : {}}>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="所属BU">
                            {getFieldDecorator('bu', {initialValue: ''})(
                                <Select >
                                    <Option value="">--请选择--</Option>
                                    {this.props.dictionary.sbuList.map((i,k) => {
                                        return <Option key={k} value={i.flexValue}>{i.description}</Option>
                                    })}
                                </Select>)}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="所属CC">
                            <Select
                                mode="combobox"
                                placeholder={'请输入costCenterId'}
                                defaultActiveFirstOption={false}
                                showArrow={false}
                                filterOption={false}
                                onChange={this.handleCcChange}
                            >
                                {
                                    this.state.ccData.map(d =>
                                        <Option key={d.value}>
                                            {d.text}
                                        </Option>)
                                }
                            </Select>
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="所属地区">
                            {getFieldDecorator('region', {initialValue: ''})(
                                <Select >
                                    <Option value="">--请选择--</Option>
                                    {this.props.dictionary.regionList.map((i,k) => {
                                        return <Option key={k} value={i.flexValue}>{i.description}</Option>
                                    })}
                                </Select>)}
                        </FormItem>
                    </Col>
                </Row>
                <Row style={!this.state.expand ? {display: 'none'} : {}}>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="资产关键字">
                            {getFieldDecorator('assetKeywords', {initialValue: ''})(
                                <Select>
                                    <Option value="">--请选择--</Option>
                                    <Option value="1054">UPS</Option>
                                    <Option value="1084">笔记本电脑</Option>
                                    <Option value="1085">笔记本电脑类</Option>
                                    <Option value="1055">不间断电源</Option>
                                    <Option value="1083">磁带机</Option>
                                    <Option value="1074">打印机</Option>
                                    <Option value="1082">电脑附属设备</Option>
                                    <Option value="1095">防火墙</Option>
                                    <Option value="1080">服务器</Option>
                                    <Option value="1066">复印机</Option>
                                    <Option value="1097">集线器</Option>
                                    <Option value="1091">路由器</Option>
                                    <Option value="1076">扫描仪</Option>
                                    <Option value="1075">投影仪</Option>
                                    <Option value="1086">网络分析仪</Option>
                                    <Option value="1087">网络设备</Option>
                                    <Option value="1079">显示器</Option>
                                    <Option value="1001">PC机</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="资产描述：">
                            {getFieldDecorator('assetsDesc', {initialValue: ''})(
                                <Input/>)}
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col className="taRight" span={23}>
                        <FormItem>
                            <Button type="primary" onClick={this.queryList}>查询</Button>&nbsp;&nbsp;
                            <Button type="primary" onClick={this.clearParams}>清空</Button>&nbsp;&nbsp;
                            <Button type="primary" onClick={this.exportAllDetail}>导出</Button>
                            <a style={{ marginLeft: 8, fontSize: 12 }} onClick={() => { this.setState({expand: !this.state.expand}) }}>
                                {this.state.expand ? '收起' : '展开'}<Icon type={this.state.expand ? 'up' : 'down'} /></a>
                        </FormItem>
                    </Col>
                </Row>
            </Card>
            <Card className="m-card" title="查询结果" style={{marginTop: '20px', paddingBottom: '10px'}} bordered={false} noHovering>
                <Row style={{marginTop: '10px'}}>
                    <Col span={24}>
                        <Table
                            columns={columns}
                            dataSource={this.state.tableData}
                            pagination={false}
                            scroll={{ x: 1900}}></Table>
                        <br/>
                        <div className="paginationPanel">
                            <Pagination
                                className="pagination"
                                showSizeChanger
                                onShowSizeChange={this.changePage}
                                showTotal={t=>`共${t}条`}
                                onChange={this.changePage}
                                showQuickJumper
                                total={this.props.taskDetail.count}></Pagination>
                        </div>
                    </Col>
                </Row>
            </Card>
            </Spin>
            <Modal
                visible={this.state.visible}
                title="员工查询"
                width="1000px"
                footer={null}
                onOk={this.modalClose}
                onCancel={this.modalClose}>
                <StaffFinder dispatch={this.props.dispatch}
                             multiple={false}
                             keywords={this.state.accountName}
                             selectStaff={this.selectStaff}
                             companyData={this.props.dictionary.companyList}
                             regionData={this.props.dictionary.regionList}
                             buData={this.props.dictionary.sbuList}
                             ccData={this.props.dictionary.ccList}
                             valid="no"
                             useAmsPai
                />
            </Modal>
        </Form>
    }

}

export default Form.create()(Root)
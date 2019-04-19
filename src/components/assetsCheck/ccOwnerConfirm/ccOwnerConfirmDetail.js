import React from 'react'
import {Card, Row, Col, Form, Input, Button, Select, Table, Checkbox, Icon, Modal} from 'antd'
import './ccOwnerConfirmDetail.less'
import _ from 'lodash'
import getQueryString from '../../../util/getQueryString'
import message from '../../common/Notice/notification'
import StaffFinder from '../../common/staffFinder/staffFinder'
const FormItem = Form.Item
const Option = Select.Option

const EditableCell = ({ editable, value, onChange }) => (
    <div>
        {editable
            ? <Input value={value} onChange={e => onChange(e.target.value)} />
            : value
        }
    </div>
);

const SelectCell = ({ editable, value, onChange }) => (
    <div>
        {editable
            ? <Select value={value.toString()} onChange={onChange}>
                <Option key="0" value="00">请选择</Option>
                <Option key="1" value="10">同意</Option>
                <Option key="2" value="20">不同意</Option>
            </Select>
            : value
        }
    </div>
);

class Root extends React.Component {
    constructor(props) {
        super(props)
        const taskStatus = parseInt(getQueryString('taskStatus')) ? parseInt(getQueryString('taskStatus')) : null
        this.state = {
          infoCount: {}, // 统计信息
          taskStatus: taskStatus ? taskStatus : null, // 任务状态 20:已确认；30:未确认 全部不传参
          selectYear: '',
          selectItems: [],
          checkAll: false,
          selectedRowKeys: [], // 勾选
          visible: false,
          personId: '', // 查询员工id
        }
    }

    componentWillMount(){
        const { match={}, location } = this.props;
        const { params={} } = match
        const { id } = params
        const { search } = location
        const taskStatus = parseInt(getQueryString('taskStatus')) ? parseInt(getQueryString('taskStatus')) : null
      if(id) {
          this.getCCConfirmList({inventoryTaskId:id,taskStatus})
        }
        if(/view=true/.test(search)) {
          //  预留的页面
          this.setState({view: true})
        }
    }

  //  查询列表
  getCCConfirmList = (body) => {
    if(!body.pageNo) {
      body.pageNo =1
    }
    if(!body.pageSize) {
      body.pageSize =10
    }
    if(!body.ownerPersonId && body.ownerPersonId !== '') {
      body.ownerPersonId = this.state.personId
    }
    this.props.getCCConfirmList(body).then(res=>{
      if(res && res.response && res.response.resultCode === '000000' && res.response.pageInfo) {
        const { unConfirmCount , confirmCount, count, taskName } = res.response
        const infoCount = { unConfirmCount , confirmCount, count, taskName }
        const { result=[] } = res.response.pageInfo
        const confirmList = result.map((v,k)=>{
          return {...v, key:k+1, ccOwnerConfirm: '10'}
        })
        this.setState({confirmList, infoCount}) // 保存列表数据
      }
    })

    if(body.taskStatus) {
      // 保存点击的按钮的状态
      this.setState({taskStatus: body.taskStatus, selectedRowKeys:[]})
    }else{
      this.setState({taskStatus: null, selectedRowKeys:[]})
    }
  }

  getColumns = () => {
    const columns =  [{
      title: '序号',
      dataIndex: 'key',
    }, {
      title: '员工编号',
      dataIndex: 'assignedOwnerNumber',
    }, {
      title: '员工姓名',
      dataIndex: 'assignedOwnerName',
    }, {
      title: '资产编号',
      dataIndex: 'serialNumber',
      width: 120,
    }, {
      title: '资产关键字',
      dataIndex: 'assetKey',
      width: 120,
    }, {
      title: '资产描述',
      dataIndex: 'description',
      width: '16%',
    }, {
      title: '所属公司',
      dataIndex: 'assignedCompanyName',
    }, {
      title: '所属BU',
      dataIndex: 'assignedSbuName',
      width: 120,
    }, {
      title: '所属CC',
      dataIndex: 'assignedCcName',
    }, {
      title: '所属地区',
      dataIndex: 'assignedRegionName',
    }, {
      title: '启用时间',
      dataIndex: 'serviceDate',
      width: 100,
    }, {
      title: '资产Owner确认结果',
      dataIndex: 'ownerConfirmDesc'
    }, {
      title: '资产Owner确认说明',
      dataIndex: 'ownerConfirmRemark'
    }]

    if(this.state.view) {
      return columns.concat([
        {
          title: '确认结果',
          dataIndex: 'ccOwnerConfirmDesc',
        }, {
          title: '确认说明',
          dataIndex: 'ccOwnerConfirmRemark',
        }
      ])
    }else{
      return columns.concat([
        {
          title: '确认结果',
          fixed: 'right',
          width: 100,
          render: (text, record) => this.renderSelectColumns(text, record, 'ccOwnerConfirm'),
        }, {
          title: '确认说明',
          fixed: 'right',
          width: 200,
          render: (text, record) => this.renderColumns(text, record, 'ccOwnerConfirmRemark'),
        }
      ])
    }
  }

    renderColumns(text, record, column) {
        return (
            <EditableCell
                editable={true}
                value={text.ccOwnerConfirmRemark ? text.ccOwnerConfirmRemark : ''}
                onChange={value => this.handleChange(value, record.key, column)}
            />
        );
    }

    renderSelectColumns(text, record, column) {
        return (
            <SelectCell
                editable={true}
                value={text.ccOwnerConfirm ? text.ccOwnerConfirm : '10'}
                onChange={value => this.confirm(value, record.key, column)}
            />
        );
    }


    handleChange(value, key, column) {
        const newData = [...this.state.confirmList];
        const target = newData.filter(item => key === item.key)[0];
        if (target) {
            target[column] = value;
            this.setState({ confirmList: newData });
        }
    }
    confirm = (value, key, column) => {
      const newData = [...this.state.confirmList];
        const target = newData.filter(item => key === item.key)[0];
        // if (value === '20') {
        //   this.setState({ focus: true })
        // }
        if (target) {
            target[column] = value;
            this.setState({ confirmList: newData });
        }
    }
    handleCancel = () => {
      this.setState({ visible: false })
    }
    selectStaff = (staff)=> {
      // 选择的回调
      const { match={}, form } = this.props;
      const { params={} } = match
      const { id:inventoryTaskId } = params
      const { personId, lastName } = staff[0]
      this.props.form.setFieldsValue({personId:personId , lastName})
      this.setState({ personId: personId})
      this.getCCConfirmList({inventoryTaskId, taskStatus: this.state.taskStatus, ownerPersonId: personId})
      this.handleCancel()
    }
    cleanPerson = (e) => {
      // 清空搜索的员工
      e.stopPropagation()
      const { match={} } = this.props;
      const { params={} } = match
      const { id:inventoryTaskId } = params
      this.props.form.setFieldsValue({personId:'' , lastName: ''})
      this.setState({ personId: ''})
      this.getCCConfirmList({inventoryTaskId, taskStatus: this.state.taskStatus, ownerPersonId: ''})
    }
    rowSelection = () =>  {
      const self = this
      return {
        onChange: (selectedRowKeys, selectedRows) => {
          this.setState({selectedRowKeys})
        },
        onSelect: (record, selected, selectedRows) => {
          const newData = [...this.state.confirmList];
          const target = newData.filter(item => record === item)[0];
          if (target) {
            if(selected) {
              target.editable = true;
              this.setState({ confirmList: newData });
            }
            else {
              target.editable = false;
              this.setState({ confirmList: newData });
            }
          }
        },
        onSelectAll: (selected) => {
          const newData = [...this.state.confirmList];
          newData.forEach((i)=>{
            if(selected) {
              i.editable = true;
              this.setState({ confirmList: newData });
            }
            else {
              i.editable = false;
              this.setState({ confirmList: newData });
            }
          })
        },
        selectedRowKeys: self.state.selectedRowKeys
      }
    }

    onCheckAllChange = (e) => {
        this.setState({
            selectItems: e.target.checked ? this.state.data : [],
            checkAll: e.target.checked,
        });
    }
    selectItem = (e) => {
        if(e.target.checked) {
            let temp = this.state.selectItems
            temp.push(e.target.value)
            this.setState({selectItems: temp})
            if(temp.length === this.state.data.length) {
                this.setState({checkAll: true})
            }
        }else {
            let temp = this.state.selectItems
            temp.splice(temp.indexOf(e.target.value),1)
            this.setState({selectItems: temp})
        }
    }

    // 确认提交
    submit = () => {
      const { match={} } = this.props;
      const { params={} } = match
      const { id:inventoryTaskId } = params

      const { confirmList, selectedRowKeys, taskStatus } = this.state

      if(selectedRowKeys.length === 0) {
        message.warning('请选择要确认的资产')
        return
      }

      let hasEmpty = false
      let noSelect = false
      for(let k of selectedRowKeys) {
        for (let item of confirmList) {
          if(item.key === k && item.ccOwnerConfirm === '20') {
            if(!item.ccOwnerConfirmRemark || item.ccOwnerConfirmRemark.length === 0) {
              hasEmpty = true
              break
            }
          }else if(item.key === k && item.ccOwnerConfirm === '00'){
            noSelect = true
            break
          }
        }
        if(hasEmpty || noSelect) {
          break
        }
      }
      if(hasEmpty) {
        message.warning('请对确认结果不同意的资产填写说明')
        return
      }
      if(noSelect) {
        message.warning('请选择确认结果')
        return
      }

      const type = 'cc'
      let confirmMsg = []
      for(let v of confirmList) {
        if(_.indexOf(selectedRowKeys,v.key) !== -1) {
          confirmMsg.push({
            snapshotId: v.snapshotId,
            comfirm: v.ccOwnerConfirm ? v.ccOwnerConfirm : '00',
            remark: v.ccOwnerConfirmRemark ? v.ccOwnerConfirmRemark : '',
          })
        }
      }

      this.props.ownerDelConfirm(confirmMsg,type).then(res=>{
        if(res && res.response && res.response.resultCode === '000000') {
          message.success('确认成功')
          this.setState({selectedRowKeys:[] })
          this.getCCConfirmList({inventoryTaskId,taskStatus})
        }
      })

    }

    render() {
      const {infoCount, taskStatus, confirmList, view, infoCount:{}} = this.state
      // view 预留页面
      const { match={}, form } = this.props;
      const { params={} } = match
      const { id:inventoryTaskId } = params
      const { getFieldDecorator } = form;
      const formItemLayout = {labelCol: { span: 4 }, wrapperCol: { span: 13 }};
      if(Object(infoCount).keys === 0) {
        return null
      }
        return <Form className="m-ccownerDetail">
            <p>任务名称：{infoCount.taskName}</p>
            <p>当前任务您共有<span> {infoCount.count} </span>项参与确认，已确认<span>{infoCount.confirmCount}</span>项，未确认<span>{infoCount.unConfirmCount}</span>项</p>
            <Row style={{margin: '0 0 5px 10px'}}>
              <Col span={8} style={{height: '32px'}}>
                <FormItem style={{display: 'none'}} {...formItemLayout} label="员工姓名：">
                  {getFieldDecorator('personId')(
                    <Input style={{display: 'none'}} disabled />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="员工姓名：">
                  <div className={`u-select-user-input `} onClick={() => {this.setState({ visible: true })}} >
                    {getFieldDecorator('lastName')(
                      <Input disabled suffix={<Icon type="search"/>} />
                    )}
                    <Button style={{float: 'right', top: '-30px', right: '-80px'}} type="primary" onClick={this.cleanPerson}>清空</Button>
                  </div>
                </FormItem>
              </Col>
            </Row>
            <div className="buttonContainer">
                <div>
                    <label>确认状态</label>
                    <Button className="firstButton" type="primary" ghost={!(taskStatus === null)} onClick={()=>{this.getCCConfirmList({inventoryTaskId})}}>全部</Button>
                    <Button type="primary" ghost={!(taskStatus === 20)} onClick={()=>{this.getCCConfirmList({inventoryTaskId, taskStatus:20})}}>已确认</Button>
                    <Button type="primary" ghost={!(taskStatus === 30)} onClick={()=>{this.getCCConfirmList({inventoryTaskId, taskStatus:30})}}>未确认</Button>
                </div>
                <div>
                    <Checkbox onChange={this.agreeAll} style={{display:'none'}}>全部同意</Checkbox>
                  {view ? null : <Button type="primary" onClick={this.submit}>确认</Button>}
                </div>
            </div>
            <Card className="m-card" title="" bordered={false} noHovering>
                <Row>
                    <Col span={24}>
                        <Table
                          className="table-center"
                          pagination={
                            {
                              showSizeChanger:true,
                              showQuickJumper:true,
                              total:infoCount.count,
                              onChange:(pageNo,pageSize)=>{this.getCCConfirmList({inventoryTaskId, pageNo, pageSize})},
                              onShowSizeChange:(pageNo,pageSize)=>{this.getCCConfirmList({inventoryTaskId, pageNo, pageSize})}
                            }
                          }
                          rowSelection={view ? null : this.rowSelection()}
                          columns={this.getColumns()}
                          dataSource={confirmList}
                          scroll={{x: 1360}}
                        />
                    </Col>
                </Row>
            </Card>
          {this.state.visible ? <Modal
              visible={this.state.visible}
              title="员工查询"
              width="1000px"
              footer={null}
              onCancel={this.handleCancel}>
              <StaffFinder dispatch={this.props.dispatch}
                           valid={'Y'}
                           multiple={false}
                           bgCode={sessionStorage.getItem('bgCode')}
                           keywords=''
                           selectStaff={this.selectStaff}
                           companyData={this.props.dictionary.companyList}
                           regionData={this.props.dictionary.regionList}
                           buData={this.props.dictionary.sbuList}
                           ccData={this.props.dictionary.ccList ? this.props.dictionary.ccList : []}
              />
            </Modal> : null}
        </Form>
    }
}

export default Form.create()(Root)
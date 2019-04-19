/**
 * Created by Berlin on 2017/12/1.
 */
import React from 'react'
import './approve.less'
import { Card, Row, Col, Form, Table, Button, Modal, Collapse, Steps, Input, Icon } from 'antd'
import { approveSingle, approveBatch, getWorkFlow } from '../../../actions/apply/apply'
import { getAssetConfirm } from '../../../actions/financialAudit/assetInquiry'
import message from '../../common/Notice/notification'
import Forward from '../../businessApproval/forward'
const { TextArea } = Input;
const FormItem = Form.Item;
const Step = Steps.Step
const Panel = Collapse.Panel
const columns = [
  {
    title: '序号',
    dataIndex: 'no',
    width: '5%',
    className:'tHeader',
  },
  {
    title: '环节名称',
    dataIndex: 'taskName',
    width: '10%',
    className:'tHeader',
  },
  {
    title: '审批人',
    dataIndex: 'approveName',
    width: '10%',
    className:'tHeader',
  },
  {
    title: '审批时间',
    dataIndex: 'approveTime',
    width: '15%',
    className:'tHeader',
  },
  {
    title: '审批意见',
    dataIndex: 'approveRemark',
    width: '30%',
    className:'tHeader',
  },
  {
    title: '审批结果',
    dataIndex: 'approveStatusName',
    width: '15%',
    className:'tHeader',
  }
];

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      taskForward: false, // 转发visible
      approveId: '',
      isBatch: 'yes',
      step: false,
      approveInfos: [],  // 审批列表
      workflowInfos: [], // 流程列表
      reject: false, // 审批驳回
      expand: true, // 展开收起
      fileStream: ''
    }
  }
  componentWillMount() {
    this.props.dispatch(getWorkFlow(this.props.match.params.id)).then(res => {
      if(res && res.response && res.response.resultCode === '000000') {
        this.setState({ fileStream: res.response.fileStream })
      }
    })
  }
  componentWillReceiveProps(nextProps) {
    if(this.props.approveId !== nextProps.approveId && nextProps.approveId !== '') {
      // 审批ids
      this.setState({ approveId: nextProps.approveId })
    }
    if(this.props.isBatch !== nextProps.isBatch && nextProps.isBatch !== '') {
      // 是否批量审批
      this.setState({ isBatch: nextProps.isBatch })
    }
    if(this.props.workflowInfos !== nextProps.workflowInfos && nextProps.workflowInfos) {
      // 流程记录
      this.setState({ workflowInfos: nextProps.workflowInfos.reverse() })
    }
    if(this.props.approveInfos !== nextProps.approveInfos && nextProps.approveInfos) {
      //审批记录
      let arr = [];
      nextProps.approveInfos.map((item, idx) => {
        arr.push({
          ...item,
          no: idx + 1,
        })
      })
      this.setState({ approveInfos: arr })
    }
  }
  handleForward = () => {
    // 取消转发
    this.setState({ taskForward: false });
  }
  approve = () => {
    // 审批
    const { approveId } = this.state;
    const { addCost, addFillbackInfo, assetObj, fileUrl, assetInfo, loadStart, loadEnd } = this.props;
    let approveRemark = '';
    this.props.form.validateFields((err, values) => {
      if(values.advice) {
        approveRemark = values.advice
      } else {
        approveRemark = ''
      }
    })
    if (this.state.isBatch === 'yes') {
      // 批量审批
      const params = {
        approveIds: [approveId], //任务id list
        approveStatus: 'yes',
        approveRemark: approveRemark
      }
      loadStart();
      this.props.dispatch(approveBatch(params)).then(result => {
        loadEnd();
        if(result.response.resultCode === '000000') {
          message.success('审批成功');
          this.setState({ approveId: '', isBatch: 'yes' })
          this.props.history.push('/businessApproval/search')
        } else {
          message.error(result.response.resultMessage)
          return
        }
      })
    } else {
      // 需要回填使用单个审批
      let assetInfos = [];
      if (addCost && addCost === 'yes' || assetObj && Object.keys(assetObj).length > 0) {
        for(let k in assetObj) {
          if (assetObj[k] === '') {
            message.warning('请填写资产原值')
            return false
          } else {
            assetInfos.push({
              itemId: k,
              assetValue: assetObj[k],
            })
          }
        }
      } else if (addFillbackInfo && addFillbackInfo === 'yes') {
        for(let k in assetInfo) {
          if (assetInfo[k] === '') {
            message.warning('请填写资产验机信息')
            return false
          } else {
            assetInfos.push({
              itemId: k,
              backfillContent: assetInfo[k],
            })
          }
        }
      }
      const param = {
        approveId,
        approveStatus: 'yes',
        approveRemark: approveRemark,
        fileUrl,
        assetInfos
      }
      loadStart()
      this.props.dispatch(approveSingle(param)).then(result => {
        loadEnd()
        if(result.response.resultCode === '000000') {
          message.success('审批成功');
          this.setState({ approveId: '', loading: false })
          this.props.history.push('/businessApproval/search')
        } else {
          message.error(result.response.resultMessage)
          this.setState({ loading: false })
          return
        }
      })
    }
  }
  rejectBtn = () => {
    // 确认驳回
    const { fileUrl } = this.props;
    this.props.form.validateFields((err, value) => {
      if(!value.advice) {
        message.warning('请填写驳回原因')
        return false
      }else {
        // 审批
        const { approveId } = this.state;
        if (this.state.isBatch === 'yes') {
          // 批量审批
          const params = {
            approveIds: [approveId], //任务id list
            approveStatus: 'no',
            approveRemark: value.advice,
          }
          this.props.loadStart();
          this.props.dispatch(approveBatch(params)).then(result => {
            this.props.loadEnd();
            if(result.response.resultCode === '000000') {
              message.success('驳回成功');
              this.setState({ approveId: '', isBatch: 'yes', reject: false, loading: false })
              this.props.history.push('/businessApproval/search')
            }
            else {
              message.error(result.response.resultMessage)
              this.setState({ reject: false, loading: false })
              return
            }
          })
        } else {
          // 需要回填使用单个审批
          const param = {
            approveId,
            fileUrl,
            approveStatus: 'no',
            approveRemark: value.advice,
          }
          this.props.loadStart()
          this.props.dispatch(approveSingle(param)).then(result => {
            this.props.loadEnd()
            if(result.response.resultCode === '000000') {
              message.success('驳回成功');
              this.setState({ approveId: '', reject: false, loading: false })
              this.props.history.push('/businessApproval/search')
            }
            else {
              message.error(result.response.resultMessage)
              this.setState({ reject: false, loading: false })
              return
            }
          })
        }
      }
    })
  }
  showStep = (v) => {
    if(v.length !== 0) {
      this.setState({ step: true })
    }else {
      this.setState({ step: false })
    }
  }
  financeConfirm = () => {
    // 财务审批通过
    this.props.loadStart()
    this.props.dispatch(getAssetConfirm({
      voucherIds: [this.props.match.params.id],
    })).then(res => {
      this.props.loadEnd()
      if(res.response.resultCode === '000000') {
        message.success('申请单已经提交到ERP系统，请稍后返回查看处理情况');
        this.props.history.push('/financialAudit/platform')
      } else {
        message.error(res.response.resultMessage);
        return false;
      }
    })
  }
  goBack = () => {
    // 退回上一节点
    const { approveId } = this.state;
    const { addCost, addFillbackInfo, assetObj, fileUrl } = this.props;
    let approveRemark = '';
    this.props.form.validateFields((err, values) => {
      if(values.advice) {
        approveRemark = values.advice
      } else {
        approveRemark = ''
      }
    })
    const params = {
      approveIds: [approveId], //任务id list
      approveStatus: 'return',
      approveRemark: approveRemark
    }
    this.props.loadStart()
    this.props.dispatch(approveBatch(params)).then(result => {
      this.props.loadEnd()
      if(result.response.resultCode === '000000') {
        message.success('审批成功');
        this.setState({ approveId: '' })
        this.props.history.push('/businessApproval/search')
      }
      else {
        message.error(result.response.resultMessage)
        return
      }
    })
  }

  render() {
    const rejectLayout = {labelCol: { sm: { span: 6 },}, wrapperCol: {sm: { span: 8 },},};
    const { getFieldDecorator } = this.props.form;
    const { regionData, companyData, isApprove, isComplete, sbuList, returnNode } = this.props;
    const dictionary = {
      companyData,
      regionData,
      sbuList
    }
    const cardStyle = { marginTop: '16px' }
    const flowArr = this.state.workflowInfos;
    let current;
    const stepDom = flowArr.length !== 0 && flowArr.map((item, idx) => {
      if (item.approveStatusName === '审批通过') {
        current = idx+1;
        return <Step title={item.approveName} description='审批通过' key={idx}/>
      } else if (item.approveStatusName === '待审批') {
        current = idx;
        return <Step title={item.approveName} description='待审批' key={idx}/>
      } else if (item.approveStatusName === '审批不通过') {
        current = idx;
        return <Step title={item.approveName} description='审批不通过' key={idx}/>
      }
    })
    return <div className="approve-contain">
      <Card
        className="m-card border-bottom"
        style={cardStyle}
        title="流程轨迹"
        bordered={false}
        noHovering
        extra={<a style={{ marginLeft: 8, fontSize: 12 }} onClick={() => { this.setState({expand: !this.state.expand}) }}>
          {this.state.expand ? '收起' : '展开'}<Icon type={this.state.expand ? 'up' : 'down'} />
        </a>}
      >
        {
          this.state.expand ?
            <div>
              <ul className='approve-process'>
                <li className='pro-down'>
                  <i/>
                  <span>已完成</span>
                </li>
                <li className='pro-doing'>
                  <i/>
                  <span>进行中</span>
                </li>
                <li className='pro-undo'>
                  <i/>
                  <span>未完成</span>
                </li>
              </ul>
              <img src={`data:image/png;base64,${this.state.fileStream}`}/>
            </div>: null
        }
      </Card>
      <Card className="m-card border-bottom" style={cardStyle} title="审批记录" bordered={false} noHovering>
        <Row>
          <Col span={24}>
            <Table
              style={{ margin: '12px 20px' }}
              pagination={false}
              columns={columns}
              dataSource={this.state.approveInfos}
              rowKey={record => record.taskId}
            />
          </Col>
        </Row>
        {
          isApprove ?
            <Row style={{padding: '0 20px'}} >
              <Col span={24}>
                <FormItem>
                  <label className="text-area-label">审批意见：</label>
                  {getFieldDecorator('advice')(
                    <TextArea className="text-area" rows={2} />
                  )}
                </FormItem>
              </Col>
            </Row> : null
        }
        {
          isApprove ?
            <Row>
              <Col span={24} className='approve-btn'>
                {returnNode === 'yes' ? <Button type="primary" style={{ marginLeft: '10px' }} onClick={this.goBack}>退回</Button> : null}
                <Button type='primary' style={{ marginLeft: '10px' }} onClick={() => {this.setState({ taskForward: true })}}>任务转发</Button>
                <Button type="primary" style={{ marginLeft: '10px' }} onClick={this.approve}>审批通过</Button>
                <Button type="primary" style={{ marginLeft: '10px' }} onClick={this.rejectBtn}>审批驳回</Button>
              </Col>
            </Row> : null
        }
        {
          isComplete ?
            <Row>
              <Col span={24} className='approve-btn'>
                <Button type="primary" onClick={this.financeConfirm}>审核通过</Button>
              </Col>
            </Row> : null
        }
      </Card>
      <Modal
        width='660px'
        visible={this.state.taskForward}
        title="业务审批转发"
        footer={null}
        onCancel={this.handleForward}
      >
        <Forward
          dictionary={dictionary}
          dispatch={this.props.dispatch}
          onCancel={this.handleForward}
          forwardId={[this.state.approveId]}
          history={this.props.history}
        />
      </Modal>
    </div>
  }
}

export default Form.create()(Root)

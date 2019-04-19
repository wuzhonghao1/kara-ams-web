import React from 'react'
import { Card, Collapse, Steps, Row, Col, Form, Radio, Input, AutoComplete, Icon, Select, Table, Button } from 'antd'
import './invalidateInfo.less'
const Panel = Collapse.Panel
const Step = Steps.Step

export default class Component extends React.Component {

  getPanerlHeader = (title) => {
    return <div className="header">
      <span className="title">{title}</span>
      <span className="arrowTip">收起</span>
    </div>
  }

  render() {
    return (
      <div className="m-invalidate-info">
        <Card className="m-card" title="申请人信息" bordered={false} noHovering>
          1
        </Card>
        <Card className="m-card" title="申请详情" bordered={false} noHovering>
          1
        </Card>

        <Collapse bordered={false} defaultActiveKey={['1']}>
          <Panel header={this.getPanerlHeader('流程轨迹')} key="1">
            <Steps className="m-steps" progressDot size="small" current={2}>
              <Step title="Finished" />
              <Step title="Finished" />
              <Step title="In Progress" />
              <Step title="Waiting" />
              <Step title="Waiting" />
              <Step title="Waiting" />
            </Steps>
          </Panel>
        </Collapse>

        <Collapse bordered={false}>
          <Panel header={this.getPanerlHeader('审批信息')} key="2">
            <p>2</p>
          </Panel>
        </Collapse>

      </div>
    );
  }

}

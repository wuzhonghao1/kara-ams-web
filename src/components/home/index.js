import React from 'react'
import {Row, Col, Icon, Table, Button} from 'antd';
import { Link } from 'react-router-dom'
import './index.less'

function Home(props) {
  const {columns, assetsCol, appliCol, newTodosData, newAppliData, myAssetsData, applicationCount, links, clickTodosSearch, clickAssetsSearch, clickApplicationsSearch, roleInfos, personId} = props
  return (
    <div className='applIndex'>
      <div className='tableName'>
        <h3>我的待办任务<span>当前有<b> {newTodosData.length} </b>个申请单等待您审批，请您及时审批哦</span></h3>
        <Table rowKey={row => row.voucherId} columns={columns} dataSource={newTodosData} pagination={false} />
        {props.myTodos && props.myTodos.count > 5 ?
          <Row>
            <Col className="taRight" span={23}>
              <Button type='primary' onClick={() => clickTodosSearch()}>查看更多</Button>
            </Col>
          </Row> : ''}
      </div>
      <div className='tableName'>
        <h3>我的资产</h3>
        <Table rowKey={row => row.assetId} columns={assetsCol} dataSource={myAssetsData.slice(0, 5)} pagination={false} />
        {props.myAssets && props.myAssets.count > 5 ?
          <Row>
            <Col className="taRight" span={23}>
              <Button type='primary' onClick={clickAssetsSearch}>查看更多</Button>
            </Col>
          </Row> : ''}
      </div>
      <div className='tableName'>
        <h3>我的申请查询<span>截止到目前您累计提交了<b> {applicationCount} </b>个申请单</span></h3>
        <Table rowKey={row => row.voucherId} columns={appliCol} dataSource={newAppliData.slice(0, 5)} pagination={false} />
        <Row>
          <Col className="taRight" span={23}>
            {props.myApplicationInquiry && props.myApplicationInquiry.count > 5 ? (<Button type='primary' onClick={() => clickApplicationsSearch()}>查看更多</Button>) : ''}
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default Home

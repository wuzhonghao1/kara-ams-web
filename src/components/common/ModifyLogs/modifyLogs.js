import React from 'react'
import { Table } from 'antd';

export default class ModifyLogs extends React.Component {

  render() {
		const { modifyLogs=[], columns } = this.props;
    return (
			<Table
				columns={columns}
				dataSource={modifyLogs}
				pagination={false}
				scroll={{ x: 800, y: 240 }}
				rowKey={(row, index) => row.assetId+index}
			/>
    )
  }

}

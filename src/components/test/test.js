import React from 'react'
import { Select } from 'antd';
const { Option, OptGroup } = Select;

export default class Root extends React.Component {

  render() {
    const { match } = this.props
    return <Select
      defaultValue={['jack', 'Yiminghe']}
      mode="multiple"
      style={{ width: 200 }}
    >
      <OptGroup label="新公司">
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
      </OptGroup>
      <OptGroup label="老公司">
        <Option value="Yiminghe">yiminghe</Option>
      </OptGroup>
    </Select>



    return <p>test match path{match.path ? match.path : '无'}</p>
  }

}

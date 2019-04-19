import React from 'react'
import { Select } from 'antd'
import debounce from 'lodash/debounce'

const Option = Select.Option;

export default class SearchInput extends React.Component {

	state = {
		data: [],
		value: '',
	}

	handleChange = debounce((value) => {
		if (value.trim() === '') {
			return;
		}
		this.setState({ value });
		const { bgId } = this.props.user
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
				this.setState({ data })
			}
		})
		fetch(value, data => this.setState({ data }));
	}, 200)

  render() {
		const options = this.state.data.map(d => <Option key={d.value}>{d.text}</Option>);
    return (
      <Select
        mode="combobox"
        value={this.state.value}
        placeholder={this.props.placeholder}
        notFoundContent=""
        style={this.props.style}
        defaultActiveFirstOption={false}
        showArrow={false}
        filterOption={false}
        onChange={this.handleChange}
      >
        {options}
      </Select>
    )
  }

}

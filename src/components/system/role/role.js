import React from 'react'
import { Card, Row, Col, Form, Radio, Input, AutoComplete, Icon, Select, Table, Button, Modal, message } from 'antd'
import StaffFinder from '../../common/staffFinder/staffFinder'
import Add from './add'
import List from './list'
import './role.less'
const FormItem = Form.Item
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const Option = Select.Option
const { TextArea } = Input;


class Root extends React.Component {

  render() {

    const { getCustomRole, addCustomRole, deleteCustomRole, updateCustomRole, getRoleView, setRoleView, getAllRoleView, setRoleMenu, getRoleMenu, refresh, flag } = this.props

    const listProps = {
      getCustomRole,
      deleteCustomRole,
      updateCustomRole,
      getRoleView,
      setRoleView,
      getAllRoleView,
      setRoleMenu,
      getRoleMenu,
      flag,
    }

    return <div className="m-system-role">
      <Add
        addCustomRole={addCustomRole}
        getCustomRole={getCustomRole}
        refresh={refresh}
      />
      <List {...listProps} />
    </div>
  }

}

export default Root
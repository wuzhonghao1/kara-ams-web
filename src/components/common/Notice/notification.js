import { Modal } from 'antd';
export default class message {
  static error = (msg, ok) => Modal.error({
      content: msg || '',
      okText: '确定',
      onOk: ok ? ok : () => {}
  })
  static warning = (msg, ok) => Modal.warning({
      content: msg || '',
      okText: '确定',
      onOk: ok ? ok : () => {}
  })
  static success = (msg, ok) => Modal.success({
      content: msg || '',
      okText: '确定',
      onOk: ok ? ok : () => {}
  })
}
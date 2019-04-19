import React from 'react'
import {upLoadFile} from '../../../actions/Files/files'
import './invalidate.less'
import { Button } from 'antd'
import message from '../../common/Notice/notification'

export default class InputFile extends React.Component {
  onChange = (e) => {
    const { dispatch, getUpLoadFile } = this.props
    const type = this.props.type ? this.props.type : null;
    let errors = ''
    const file = []
    const fileObj = []
    const targetFile = e.target.files[0]
    file.push(targetFile)

    if (errors) {
      message.error(errors, 5)
    } else {
      const theFile = file[0]
      const fileName = theFile.name
      const reader = new FileReader()
      reader.readAsDataURL(theFile)
      reader.addEventListener('loadend', (oFREvent) => {
        const result = oFREvent.target.result
        dispatch(upLoadFile(fileName, result.split(',')[1])).then(res => {
          if(res && res.response && res.response.resultCode === '000000'){
            message.success('上传成功')
            getUpLoadFile({
              id: res.response.objectId,
              name: fileName
            }, type)
          } else {
            message.warning('上传失败')
          }
        })
      })
    }
    this.inputFile.value = null
  }

  fileErrorCheck = (file) => {
    // 上传文件检查
    const fileName = file.name
    const typeName = fileName.substring(fileName.lastIndexOf('.') + 1).toLocaleLowerCase()
    if (!(typeName === 'pdf' || typeName === 'jpg' || typeName === 'doc' || typeName === 'docx' || typeName === 'xlsx' || typeName === 'zip')) {
      return `《${fileName}》的类型应该是(pdf/jpg/doc/docx/xlsx/zip)`
    }
    const fileSize = file.size
    if (fileSize / 1024 / 1024 > 6) {
      return `《${fileName}》大小不能超过6M`
    }
    return false
  }

  render() {
    const { disabled, text } = this.props
    return (<div className="upLoadContain">
      <Button
        disabled={disabled}
        style={{marginBottom: '10px'}}
        type="primary"
        icon="upload"
        onClick={()=>{this.inputFile.click()}}
      >
        {text ? text : '上传附件'}
      </Button>
      <input
        type="file"
        ref={ref => this.inputFile = ref}
        onChange={e => this.onChange(e)}
      />
    </div>)
  }
}

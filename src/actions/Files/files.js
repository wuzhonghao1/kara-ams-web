import { httpApi } from '../../http/reduxRequestMiddleware';

// 上传文件
export const upLoadFile = (name, file) => {
  return {
    [httpApi]: {
      url: '/ams/file/upload',
      options: {
        method: 'POST',
        body: {
          fileName: name,
          fileStream: file,
        },
      },
      types: ['UP_LOAD_FILE_SUCCESS'],
    },
  }
};

// 下载文件
export const downLoadFile = (url) => {
  return {
    [httpApi]: {
      url: '/ams/file/download',
      acceptType: 'blob',
      options: {
        method: 'POST',
        body: {
          objectId: url, //文件下载路径
        },
      },
      types: ['DOWN_LOAD_FILE_SUCCESS'],
    },
  }
};
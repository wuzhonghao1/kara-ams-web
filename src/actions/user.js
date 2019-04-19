import { httpApi } from '../http/reduxRequestMiddleware'

export function getUserInfo() {
  return {
    [httpApi]: {
      url: '/ams/user/info',
      types: ['GET_USER_INFO_SUCCESS'],
    },
  }
}
export function getUserList(body, useAmsPai) {
    const url = useAmsPai ? '/ams/user/search' : '/outer/employee/getStaffInfoListByPage'
    return {
        [httpApi]: {
            url,
            options: {
                method: 'POST',
                body: body
            },
            types: ['GET_USER_LIST_SUCCESS'],
        },
    }
}
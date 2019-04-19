import { httpApi } from '../../http/reduxRequestMiddleware'

export const getMyTodos = (body) => ({
  [httpApi]: {
    url: '/ams/approve/myTasks',
    options: {
      method: 'POST',
      body,
    },
      types: ['GET_MY_TODOS_SUCCESS'],
  },
})

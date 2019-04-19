import caseReducer from '../caseReducer'

const taskQuery = {
    taskList: []
}

function getTaskList(state, action) {
    return {
        ...state,
        taskList: action.response.results,
    }
}

export default caseReducer(taskQuery, {
    GET_TASK_QUERY_LIST_SUCCESS: getTaskList
})

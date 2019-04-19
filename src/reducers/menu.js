import caseReducer from './caseReducer'

const menu = {
  collapsed: localStorage.menuCollapsed === 'true' ? true : false, // 菜单默认不横向折叠
  open: {},
}

function menuToggle(state, action) {
  // 记录 默认展开 和 手动展开的菜单
  const isOpen = action.is === undefined ? !state.open[action.key] : action.is
  return {...state, open: {...state.open, [action.key]:isOpen}}
}

function menuCollapsed(state) {
  const collapsed = !state.collapsed
  if(collapsed) {
    localStorage.menuCollapsed = 'true' // 关闭
  }else{
    localStorage.menuCollapsed = 'false' //打开
  }
  return {...state, collapsed}
}

export default caseReducer(menu, {
  MENU_TOGGLE: menuToggle,
  MENU_COLLAPSED: menuCollapsed,
})

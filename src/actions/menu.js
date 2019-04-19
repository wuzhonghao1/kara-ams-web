export function menuToggle(key,is) {
  return {
    type: 'MENU_TOGGLE',
    key,
    is
  }
}

export function menuCollapsed() {
  return {
    type: 'MENU_COLLAPSED'
  }
}

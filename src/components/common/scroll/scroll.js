import React from 'react';
import getScrollbarWidth from './getScrollbarWidth';
import getInner from './getInner';
import { addClass, removeClass } from './classNames';
import './scroll.less';

export default class scroll extends React.Component {


  componentDidMount(){
    // console.log('scroll componentDidMount')
    this.getRatio(); // 获取内容和可视比例
    this.setVerticalThumbHeight(); // 设置垂直滚动条高度
    this.setHorizontalThumbWidth();// 设置横向滚动条宽度
    // 设置拖动事件
    this.verticalThumb.addEventListener('mousedown', this.handleVerticalThumbMouseDown);
    this.horizontalThumb.addEventListener('mousedown', this.handleHorizontalThumbMouseDown);
  }

  componentDidUpdate(){
    // console.log('scroll componentDidUpdate')
    this.getRatio(); // 获取滚动比例
    this.setVerticalThumbHeight(); // 设置垂直滚动条高度
    this.setHorizontalThumbWidth();// 设置横向滚动条宽度
  }

  // 获取内容和可视比例
  getRatio = () => {
    const container = this.container;

    this.contentHeight = container.scrollHeight; // 获取内容高度 (不包含滚动条)
    this.visibleHeight = container.clientHeight; // 获取可视高度 (不包含滚动条)
    this.scrollVerticalRatio = this.contentHeight ? this.visibleHeight / this.contentHeight : 1;

    this.contentWidth = container.scrollWidth; // 获取内容宽度 (不包含滚动条)
    this.visibleWidth = container.clientWidth; // 获取可视宽度(不包含滚动条)
    this.scrollHorizontalRatio = this.contentWidth ? this.visibleWidth / this.contentWidth : 1;

    this.barIsHidden(); // 获取比例后判断滚动条是否需要隐藏
  }

  // 滚动重新设置 滚动条高度比例
  resetRatio = () => {
    const { container, contentHeight, contentWidth, visibleHeight, visibleWidth } = this
    if(contentHeight !== container.scrollHeight || visibleHeight !== container.clientHeight) {
      // 内容高度有变化 || 可视高度有变化
      // console.log('内容高度有变化 || 可视高度有变化')
      this.getRatio()
      this.setVerticalThumbHeight()
    }
    if(contentWidth !== container.scrollWidth || visibleWidth !== container.clientWidth) {
      // 内容宽度有变化 || 可视宽度有变化
      // console.log('内容宽度有变化 || 可视宽度有变化')
      this.getRatio()
      this.setHorizontalThumbWidth()
    }
  }

  // 获取垂直滚动条高度
  getVerticalThumbHeight = () => {
    const verticalBar = this.verticalBar;
    // console.log('verticalBar',verticalBar)
    const trackHeight = getInner.height(verticalBar);
    const height = this.scrollVerticalRatio * trackHeight;
    if(height < 30) {
      this.thumbShort = 30 - height
      return 30
    }else{
      return height
    }
  }

  // 设置滚动条高
  setVerticalThumbHeight = () => {
    this.verticalThumbHeight = this.getVerticalThumbHeight(); // 获取垂直滚动条高度 并保存到 this
    this.verticalThumb.style.height = `${this.verticalThumbHeight}px`;
  }

  // 获取滚动条宽度
  getHorizontalThumbWidth = () => {
    const horizontalBar = this.horizontalBar;
    const trackWidth = getInner.width(horizontalBar);
    const width = this.scrollHorizontalRatio * trackWidth
    if(width < 30) {
      this.horizontalThumbShort = 30 - width
      return 30
    }else{
      return width
    }
  }

  // 设置滚动条宽度
  setHorizontalThumbWidth = () => {
    this.horizontalThumbWidth = this.getHorizontalThumbWidth()
    this.horizontalThumb.style.width = `${this.horizontalThumbWidth}px`;
  }

  // container 滚动 设置滚动条Top
  setThumbVerticalTop = (containerScrollTop) => {
    if(this.drag === 'ing') {
      // 如果在拖动 thumb 不能重复设置 top
      return false
    }
    //console.log('this.scrollVerticalRatio',this.scrollVerticalRatio)
    const fixThumbShort = this.thumbShort ? this.thumbShort*(containerScrollTop/(this.contentHeight - this.visibleHeight)) : 0;
    const top = containerScrollTop * this.scrollVerticalRatio - fixThumbShort;
    this.verticalThumb.style.top = `${top}px`;
  }

  // 获取垂直滚动条top（拖动滚动条时）
  getVerticalThumbTop = (clientY) => {
    const { top:barTop } = this.verticalBar.getBoundingClientRect()
    let top = clientY - barTop - this.thumbClientYToTop
    const max = this.visibleHeight - this.verticalThumbHeight
    // console.log('this.visibleHeight',this.visibleHeight)
    if(top < 0) {
      return 0
    }else if(top > max){
      // console.log('max',max)
      return max
    }else{
      // console.log('top',top)
      return top
    }
  }

  // 获取横向滚动条left (拖动滚动条时)
  getHorizontalThumbLeft = (clientX) => {
    const { left:barLeft } = this.horizontalBar.getBoundingClientRect()
    let left = clientX - barLeft - this.thumbClientXToLeft
    const max = this.visibleWidth - this.horizontalThumbWidth
    if(left < 0) {
      return 0
    }else if(left > max){
      return max
    }else{
      return left
    }
  }

  // 设置 container scroll top
  setContainerScrollTop = (verticalThumbTop) => {
    const fixThumbShort = this.thumbShort ? this.thumbShort*(verticalThumbTop/(this.visibleHeight-30)) : 0
    const scrollTop = (verticalThumbTop + fixThumbShort) / this.scrollVerticalRatio
    this.container.scrollTop = scrollTop
  }

  // 设置 container scroll left
  setContainerScrollLeft = (horizontalThumbLeft) => {
    const fixThumbShort = this.horizontalThumbShort ? this.horizontalThumbShort*(horizontalThumbLeft/(this.visibleWidth-30)) : 0
    const scrollLeft = (horizontalThumbLeft + fixThumbShort) / this.scrollHorizontalRatio
    this.container.scrollLeft = scrollLeft
  }

  // 滚动条是否隐藏
  barIsHidden = () => {
    if(this.scrollVerticalRatio === 1) {
      addClass(this.verticalBar, 'hidden')
    }else{
      removeClass(this.verticalBar, 'hidden')
    }

    if(this.scrollHorizontalRatio === 1) {
      addClass(this.horizontalBar, 'hidden')
    }else{
      removeClass(this.horizontalBar, 'hidden')
    }
  }

  // container on scroll
  onScroll = (e) => {
  }

  onWheel = (e) => {
    this.resetRatio();
    this.setThumbVerticalTop(e.currentTarget.scrollTop); // container 滚动 设置滚动条Top
  }

  // 垂直滚动条 鼠标按下
  handleVerticalThumbMouseDown = (e) => {
    this.resetRatio();
    this.handleVerticalDragStart(e);
  }

  // 垂直开始拖动
  handleVerticalDragStart = (e) => {
    const {clientY} = e;
    const { top } = this.verticalThumb.getBoundingClientRect()
    this.thumbClientYToTop = clientY - top
    this.drag = 'start'

    document.addEventListener('mousemove', this.handleVerticalDrag);
    document.addEventListener('mouseup', this.handleVerticalDragEnd);
    // 禁止选择
    addClass(document.getElementsByTagName('body')[0], 'noselect');
    // 添加clss name
    addClass(this.verticalBar,'drag')
  }

  // 垂直拖动滚动条
  handleVerticalDrag = (e) => {
    const {clientY} = e;
    if(this.drag !== 'ing') {
      this.drag = 'ing'
    }
    const verticalThumbTop = this.getVerticalThumbTop(clientY)
    this.verticalThumb.style.top = `${verticalThumbTop}px`;
    this.setContainerScrollTop(verticalThumbTop)
  }

  // 垂直拖动结束
  handleVerticalDragEnd = () => {
    this.drag = 'end'
    document.removeEventListener('mousemove', this.handleVerticalDrag);
    document.removeEventListener('mouseup', this.handleVerticalDragEnd);
    // 取消禁止选择
    removeClass(document.getElementsByTagName('body')[0], 'noselect');
    // 删除class name
    removeClass(this.verticalBar,'drag')
  }


  // 横向滚动条 鼠标按下
  handleHorizontalThumbMouseDown = (e) => {
    this.resetRatio();
    this.handleHorizontalDragStart(e);
  }

  // 横向滚动条开始拖动
  handleHorizontalDragStart = (e) => {
    const {clientX} = e;
    const { left } = this.horizontalThumb.getBoundingClientRect()
    this.thumbClientXToLeft = clientX - left
    this.drag = 'start'

    document.addEventListener('mousemove', this.handleHorizontalDrag);
    document.addEventListener('mouseup', this.handleHorizontalDragEnd);
    // 禁止选择
    addClass(document.getElementsByTagName('body')[0], 'noselect');
    // 添加clss name
    addClass(this.horizontalBar,'drag')
  }

  // 横向拖动滚动条
  handleHorizontalDrag = (e) => {
    const {clientX} = e;
    if(this.drag !== 'ing') {
      this.drag = 'ing'
    }
    const horizontalThumbLeft = this.getHorizontalThumbLeft(clientX)
    this.horizontalThumb.style.left = `${horizontalThumbLeft}px`;
    this.setContainerScrollLeft(horizontalThumbLeft)
  }

  // 横向拖动结束
  handleHorizontalDragEnd = () => {
    this.drag = 'end'
    document.removeEventListener('mousemove', this.handleHorizontalDrag);
    document.removeEventListener('mouseup', this.handleHorizontalDragEnd);
    // 取消禁止选择
    removeClass(document.getElementsByTagName('body')[0], 'noselect');
    // 删除class name
    removeClass(this.horizontalBar,'drag')
  }

  render(){
    // console.log('render')
    const { children, className='' } = this.props

    const scrollbarWidth = getScrollbarWidth(); // 获取滚动条宽度

    const containerStyle = scrollbarWidth ?
      {right:-scrollbarWidth, bottom:-scrollbarWidth,paddingRight:0,paddingBottom:0} :
      {right:-20, bottom:-20,paddingRight:20,paddingBottom:20}


    return <div className={`scroll ${className}`}>
      <div className="vertical-bar" ref={(e) => { this.verticalBar = e; }}>
        <i ref={(e) => { this.verticalThumb = e; }}/>
      </div>
      <div className="horizontal-bar" ref={(e) => { this.horizontalBar = e; }}>
        <i ref={(e) => { this.horizontalThumb = e; }}/>
      </div>
      <div
        className="container"
        style={containerStyle}
        ref={(e) => { this.container = e; }}
        onScroll={this.onScroll}
        onWheel={this.onWheel}
      >
        {children}
      </div>
    </div>
  }
}
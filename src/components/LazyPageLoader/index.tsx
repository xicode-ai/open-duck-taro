import React from 'react'
import Loading from '../common/Loading'

/**
 * 懒加载页面组件
 * 用于页面级别的代码分割和懒加载
 */
const LazyPageLoader: React.FC = () => {
  return <Loading overlay type="spinner" text="页面加载中..." />
}

export default LazyPageLoader

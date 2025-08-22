import React, { Suspense } from 'react'
import { PropsWithChildren } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import { Loading } from './components/common'
import { initMobileAdapter } from './utils/mobileAdapter'
import './app.scss'

function App({ children }: PropsWithChildren) {
  React.useEffect(() => {
    // 开口鸭应用启动
    console.log('开口鸭应用启动')

    // 初始化手机适配
    initMobileAdapter()

    // 预加载关键资源
    const preloadCriticalResources = () => {
      // 预加载字体
      const fontLink = document.createElement('link')
      fontLink.rel = 'preload'
      fontLink.as = 'font'
      fontLink.type = 'font/woff2'
      fontLink.crossOrigin = 'anonymous'
      fontLink.href = '/assets/fonts/main.woff2'
      document.head.appendChild(fontLink)
    }

    // 性能监控
    const performanceObserver = () => {
      if ('PerformanceObserver' in window) {
        const observer = new window.PerformanceObserver(list => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            if (entry.entryType === 'navigation') {
              console.log('页面加载时间:', entry.duration)
            }
            if (entry.entryType === 'paint') {
              console.log(`${entry.name}:`, entry.startTime)
            }
          })
        })

        observer.observe({ entryTypes: ['navigation', 'paint'] })
      }
    }

    preloadCriticalResources()
    performanceObserver()
  }, [])

  // children 就是要渲染的页面
  return (
    <ErrorBoundary enableErrorReporting={true} maxRetries={3}>
      <div className="app">
        <Suspense
          fallback={<Loading overlay type="spinner" text="加载中..." />}
        >
          {children}
        </Suspense>
      </div>
    </ErrorBoundary>
  )
}

export default App

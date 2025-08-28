import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import './app.scss'

// 开发环境启用MSW
const isDev =
  typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'

// 在开发环境下启动MSW
if (
  typeof window !== 'undefined' &&
  (isDev ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('192.168.'))
) {
  import('./mocks/browser')
    .then(({ startWorker }) => {
      startWorker()
        .then(() => {
          console.log('🔧 MSW Mock服务已启动')
        })
        .catch(error => {
          console.error('❌ MSW启动失败:', error)
        })
    })
    .catch(error => {
      console.error('❌ MSW模块加载失败:', error)
    })
}

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    // 开口鸭应用启动
    console.log('开口鸭应用启动')
  })

  // children 就是要渲染的页面
  return children
}

export default App

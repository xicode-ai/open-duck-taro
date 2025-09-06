import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { QueryProvider } from '@/providers/QueryProvider'
import './app.scss'

// 开发环境启用MSW
const isDev =
  typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'

// 全局MSW状态
let mswReady = false
let mswReadyCallbacks: (() => void)[] = []

// 通知MSW准备就绪
const notifyMSWReady = () => {
  mswReady = true
  mswReadyCallbacks.forEach(callback => callback())
  mswReadyCallbacks = []
}

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
          notifyMSWReady()
        })
        .catch(error => {
          console.error('❌ MSW启动失败:', error)
          notifyMSWReady() // 即使失败也设置为ready，让应用继续运行
        })
    })
    .catch(error => {
      console.error('❌ MSW模块加载失败:', error)
      notifyMSWReady() // 即使失败也设置为ready
    })
} else {
  // 非开发环境直接设置为ready
  notifyMSWReady()
}

// 导出MSW状态检查函数
export const waitForMSW = (): Promise<void> => {
  return new Promise(resolve => {
    if (mswReady) {
      resolve()
    } else {
      mswReadyCallbacks.push(resolve)
      // 设置超时，避免无限等待
      setTimeout(() => {
        if (!mswReady) {
          console.warn('⚠️ MSW启动超时，继续执行')
          notifyMSWReady()
        }
      }, 3000)
    }
  })
}

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    // 开口鸭应用启动
    console.log('开口鸭应用启动')
  })

  // 使用 QueryProvider 包装应用
  return <QueryProvider>{children}</QueryProvider>
}

export default App

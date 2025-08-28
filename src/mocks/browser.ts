import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// 创建Service Worker实例
export const worker = setupWorker(...handlers)

// 启动配置
export const startWorker = async () => {
  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  })
}

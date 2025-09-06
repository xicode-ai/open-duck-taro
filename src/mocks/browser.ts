import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// 创建Service Worker实例
export const worker = setupWorker(...handlers)

// 启动配置
export const startWorker = async () => {
  try {
    console.log('🔧 正在启动MSW Service Worker...')

    const result = await worker.start({
      onUnhandledRequest: 'warn', // 改为warn以便调试
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    })

    console.log('🔧 MSW Service Worker启动成功')
    console.log('🔧 MSW handlers数量:', handlers.length)

    // 列出所有已注册的handlers
    handlers.forEach((handler, index) => {
      console.log(`🔧 Handler ${index}:`, handler)
    })

    return result
  } catch (error) {
    console.error('🔧 MSW Service Worker启动失败:', error)
    throw error
  }
}

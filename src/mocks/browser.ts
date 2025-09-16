import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// 创建Service Worker实例
export const worker = setupWorker(...handlers)

// 启动配置
export const startWorker = async () => {
  try {
    console.log('🔧 正在启动MSW Service Worker...')

    const result = await worker.start({
      onUnhandledRequest(request) {
        const url = new URL(request.url)

        // 只对可能是API请求的路径发出警告
        if (
          url.pathname.startsWith('/api/') ||
          url.pathname.startsWith('/mock/') ||
          (url.hostname === 'localhost' &&
            !url.pathname.match(
              /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/
            ))
        ) {
          console.warn(`[MSW] 未处理的请求: ${request.method} ${request.url}`)
        }

        // 对于其他请求（如外部资源），不发出警告
      },
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

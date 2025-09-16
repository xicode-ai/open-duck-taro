import { http, HttpResponse, passthrough } from 'msw'
import { chatHandlers } from './chat'
import { userHandlers } from './user'
import { vocabularyHandlers } from './vocabulary'
import { topicsHandlers } from './topics'
import { translateHandlers } from './translate'
import { progressHandlers } from './progress'
import { membershipHandlers } from './membership'
import { photoStoryHandlers } from './photoStory'

// 通用handlers（处理favicon等）
const commonHandlers = [
  // 处理favicon请求，避免MSW警告
  http.get('/favicon.ico', () => {
    return new HttpResponse(null, { status: 204 })
  }),
]

// 外部资源passthrough handlers（让外部请求正常通过，不被MSW拦截）
const externalResourceHandlers = [
  // Unsplash 图片服务
  http.get('https://images.unsplash.com/*', () => {
    return passthrough()
  }),

  // Unsplash API
  http.get('https://api.unsplash.com/*', () => {
    return passthrough()
  }),

  // Pexels 图片服务
  http.get('https://images.pexels.com/*', () => {
    return passthrough()
  }),

  // Apple 官方资源
  http.get('https://developer.apple.com/*', () => {
    return passthrough()
  }),

  // 其他常用CDN和图片服务
  http.get('https://cdn.jsdelivr.net/*', () => {
    return passthrough()
  }),

  http.get('https://unpkg.com/*', () => {
    return passthrough()
  }),

  // 通用的外部图片资源匹配（基于常见图片文件扩展名）
  http.get(/\.(jpg|jpeg|png|gif|webp|svg|ico)(\?.*)?$/, ({ request }) => {
    const url = new URL(request.url)
    // 只对外部域名进行passthrough，避免拦截本地图片
    if (
      !url.hostname.includes('localhost') &&
      !url.hostname.includes('127.0.0.1')
    ) {
      return passthrough()
    }
    // 本地图片继续正常处理
    return passthrough()
  }),
]

// 合并所有handlers
export const handlers = [
  ...externalResourceHandlers, // 外部资源handlers放在最前面，优先匹配
  ...commonHandlers,
  ...chatHandlers,
  ...userHandlers,
  ...vocabularyHandlers,
  ...topicsHandlers,
  ...translateHandlers,
  ...progressHandlers,
  ...membershipHandlers,
  ...photoStoryHandlers,
]

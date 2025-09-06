import Taro from '@tarojs/taro'
import type { ApiResponse } from '@/types'
import config from '@/config'
import { handleApiError } from '@/utils/errorHandler'

// 请求配置接口
export interface RequestConfig extends Omit<RequestInit, 'cache'> {
  url: string
  timeout?: number
  retry?: number
  cache?: boolean
  showLoading?: boolean
  showError?: boolean
}

// 缓存接口
interface CacheItem {
  data: unknown
  timestamp: number
  expires: number
}

// HTTP 客户端类
class HttpClient {
  private cache = new Map<string, CacheItem>()
  private requestQueue = new Map<string, Promise<unknown>>()

  constructor() {
    // 定期清理过期缓存
    setInterval(() => this.clearExpiredCache(), 5 * 60 * 1000) // 5分钟清理一次
  }

  // 清理过期缓存
  private clearExpiredCache() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.timestamp + item.expires) {
        this.cache.delete(key)
      }
    }
  }

  // 生成缓存键
  private getCacheKey(url: string, options: RequestConfig): string {
    const method = options.method || 'GET'
    const body = options.body ? JSON.stringify(options.body) : ''
    return `${method}:${url}:${body}`
  }

  // 从缓存获取数据
  private getFromCache(key: string): unknown | null {
    const item = this.cache.get(key)
    if (!item) return null

    const now = Date.now()
    if (now > item.timestamp + item.expires) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  // 设置缓存
  private setCache(key: string, data: unknown, expires = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expires,
    })
  }

  // 显示加载状态
  private showLoading(show: boolean, title = '加载中...') {
    if (show) {
      Taro.showLoading({ title, mask: true })
    } else {
      Taro.hideLoading()
    }
  }

  // 显示错误提示
  private showError(message: string) {
    Taro.showToast({
      title: message,
      icon: 'error',
      duration: 2000,
    })
  }

  // 检查网络状态
  private async checkNetwork(): Promise<boolean> {
    try {
      const res = await Taro.getNetworkType()
      return res.networkType !== 'none'
    } catch {
      return false
    }
  }

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 核心请求方法
  private async makeRequest<T>(
    url: string,
    options: RequestConfig
  ): Promise<T> {
    const {
      timeout = config.api.timeout,
      showLoading: shouldShowLoading = false,
      showError: shouldShowError = true,
      headers = {},
      url: _url,
      retry: _retry,
      cache: _cache,
      ...requestInit
    } = options

    // 获取 token
    const token = Taro.getStorageSync('token')

    // 构建请求配置
    const requestConfig: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      ...requestInit,
    }

    // 显示加载状态
    if (shouldShowLoading) {
      this.showLoading(true)
    }

    try {
      // 创建超时 Promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('请求超时')), timeout)
      })

      // 发送请求
      const fullUrl = config.api.baseUrl ? `${config.api.baseUrl}${url}` : url
      const fetchPromise = fetch(fullUrl, requestConfig)
      const response = await Promise.race([fetchPromise, timeoutPromise])

      // 隐藏加载状态
      if (shouldShowLoading) {
        this.showLoading(false)
      }

      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // 解析 JSON
      const data = await response.json()
      return data
    } catch (error) {
      // 隐藏加载状态
      if (shouldShowLoading) {
        this.showLoading(false)
      }

      // 使用统一的异步错误处理
      const apiError = error instanceof Error ? error : new Error('请求失败')
      handleApiError(apiError, { url, method: options.method })

      // 显示错误提示
      if (shouldShowError) {
        this.showError(apiError.message)
      }

      throw apiError
    }
  }

  // 主要请求方法（支持重试和缓存）
  async request<T = unknown>(options: RequestConfig): Promise<ApiResponse<T>> {
    const {
      url,
      retry = config.api.retryCount,
      cache = false,
      method = 'GET',
      ...restOptions
    } = options

    // 在开发环境等待MSW准备就绪
    if (process.env.NODE_ENV === 'development') {
      const { waitForMSW } = await import('../app')
      await waitForMSW()
    }

    // 检查网络状态
    const hasNetwork = await this.checkNetwork()
    if (!hasNetwork) {
      throw new Error('网络连接不可用')
    }

    // 生成缓存键
    const cacheKey = this.getCacheKey(url, options)

    // 检查是否有相同请求正在进行
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey) as Promise<ApiResponse<T>>
    }

    // 如果是 GET 请求且启用缓存，先尝试从缓存获取
    if (method.toUpperCase() === 'GET' && cache) {
      const cachedData = this.getFromCache(cacheKey)
      if (cachedData) {
        return cachedData as ApiResponse<T>
      }
    }

    // 创建请求 Promise
    const requestPromise = this.performRequestWithRetry<T>(
      url,
      { url, method, ...restOptions },
      retry
    ).finally(() => {
      // 请求完成后从队列中移除
      this.requestQueue.delete(cacheKey)
    })

    // 将请求添加到队列
    this.requestQueue.set(cacheKey, requestPromise)

    const result = await requestPromise

    // 如果是 GET 请求且启用缓存，缓存结果
    if (method.toUpperCase() === 'GET' && cache) {
      this.setCache(cacheKey, result)
    }

    return result
  }

  // 执行带重试的请求
  private async performRequestWithRetry<T>(
    url: string,
    options: RequestConfig,
    retryCount: number
  ): Promise<ApiResponse<T>> {
    let lastError: Error

    for (let i = 0; i <= retryCount; i++) {
      try {
        const result = await this.makeRequest<ApiResponse<T>>(url, options)
        return result
      } catch (error) {
        lastError = error as Error

        // 如果不是最后一次重试，等待一段时间后再试
        if (i < retryCount) {
          const delay = Math.min(1000 * Math.pow(2, i), 5000) // 指数退避，最大5秒
          await this.delay(delay)
        }
      }
    }

    throw lastError!
  }

  // GET 请求
  get<T = unknown>(
    url: string,
    options: Omit<RequestConfig, 'url' | 'method'> = {}
  ) {
    return this.request<T>({ url, method: 'GET', cache: true, ...options })
  }

  // POST 请求
  post<T = unknown>(
    url: string,
    data?: unknown,
    options: Omit<RequestConfig, 'url' | 'method'> = {}
  ) {
    return this.request<T>({
      url,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  }

  // PUT 请求
  put<T = unknown>(
    url: string,
    data?: unknown,
    options: Omit<RequestConfig, 'url' | 'method'> = {}
  ) {
    return this.request<T>({
      url,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  }

  // DELETE 请求
  delete<T = unknown>(
    url: string,
    options: Omit<RequestConfig, 'url' | 'method'> = {}
  ) {
    return this.request<T>({ url, method: 'DELETE', ...options })
  }

  // 清除所有缓存
  clearCache() {
    this.cache.clear()
  }

  // 清除指定 URL 的缓存
  clearCacheByUrl(url: string) {
    for (const key of this.cache.keys()) {
      if (key.includes(url)) {
        this.cache.delete(key)
      }
    }
  }
}

// 创建默认的 HTTP 客户端实例
const httpClient = new HttpClient()

// 导出实例和类
export default httpClient
export { HttpClient }

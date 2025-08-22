/**
 * 异步错误处理工具
 * 用于处理错误边界无法捕获的异步错误、事件回调错误等
 */

import Taro from '@tarojs/taro'

// 错误类型
export type AsyncErrorType = 'api' | 'event' | 'timeout' | 'storage' | 'unknown'

// 异步错误信息
export interface AsyncError {
  type: AsyncErrorType
  message: string
  stack?: string
  context?: Record<string, unknown>
  timestamp: number
  userId?: string
  pageName?: string
}

// 错误处理器配置
interface ErrorHandlerConfig {
  enableReporting?: boolean
  enableToast?: boolean
  logLevel?: 'none' | 'error' | 'warn' | 'info'
  maxReports?: number
  reportInterval?: number
}

class AsyncErrorHandler {
  private config: Required<ErrorHandlerConfig>
  private reportCount = 0
  private lastReportTime = 0

  constructor(config: ErrorHandlerConfig = {}) {
    this.config = {
      enableReporting: true,
      enableToast: true,
      logLevel: 'error',
      maxReports: 50,
      reportInterval: 60000, // 1分钟
      ...config,
    }

    // 设置全局错误处理
    this.setupGlobalErrorHandlers()
  }

  // 设置全局错误处理器
  private setupGlobalErrorHandlers() {
    // 处理未捕获的 Promise 错误
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', event => {
        this.handleAsyncError({
          type: 'api',
          message: event.reason?.message || '未捕获的 Promise 错误',
          stack: event.reason?.stack,
          context: { reason: event.reason },
          timestamp: Date.now(),
        })

        // 阻止控制台错误输出
        event.preventDefault()
      })

      // 处理全局 JavaScript 错误
      window.addEventListener('error', event => {
        this.handleAsyncError({
          type: 'unknown',
          message: event.message,
          stack: event.error?.stack,
          context: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
          timestamp: Date.now(),
        })
      })
    }
  }

  // 处理异步错误
  handleAsyncError(error: AsyncError) {
    // 记录日志
    this.logError(error)

    // 显示用户友好的提示
    if (this.config.enableToast) {
      this.showErrorToast(error)
    }

    // 上报错误
    if (this.config.enableReporting && this.shouldReport()) {
      this.reportError(error)
    }
  }

  // 记录错误日志
  private logError(error: AsyncError) {
    const { logLevel } = this.config

    if (logLevel === 'none') return

    const logMessage = `[AsyncError] ${error.type}: ${error.message}`
    const logData = {
      ...error,
      userAgent: window.navigator?.userAgent,
      url: window.location?.href,
    }

    switch (logLevel) {
      case 'error':
        console.error(logMessage, logData)
        break
      case 'warn':
        console.warn(logMessage, logData)
        break
      case 'info':
        console.info(logMessage, logData)
        break
    }
  }

  // 显示错误提示
  private showErrorToast(error: AsyncError) {
    const messages: Record<AsyncErrorType, string> = {
      api: '网络请求失败，请稍后重试',
      event: '操作失败，请重试',
      timeout: '操作超时，请检查网络',
      storage: '数据保存失败，请重试',
      unknown: '操作失败，请稍后重试',
    }

    Taro.showToast({
      title: messages[error.type] || messages.unknown,
      icon: 'error',
      duration: 2000,
    })
  }

  // 判断是否应该上报错误
  private shouldReport(): boolean {
    const now = Date.now()

    // 检查上报频率限制
    if (now - this.lastReportTime < this.config.reportInterval) {
      return false
    }

    // 检查上报数量限制
    if (this.reportCount >= this.config.maxReports) {
      return false
    }

    return true
  }

  // 上报错误
  private async reportError(error: AsyncError) {
    try {
      this.reportCount++
      this.lastReportTime = Date.now()

      // 这里可以调用实际的错误上报 API
      console.log('Reporting async error:', error)

      // 示例：发送到错误监控服务
      // await fetch('/api/error-report', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(error)
      // })
    } catch (reportError) {
      console.error('Failed to report async error:', reportError)
    }
  }

  // 手动处理 API 错误
  handleApiError(error: Error, context?: Record<string, unknown>) {
    this.handleAsyncError({
      type: 'api',
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
    })
  }

  // 手动处理事件错误
  handleEventError(
    error: Error,
    eventName?: string,
    context?: Record<string, unknown>
  ) {
    this.handleAsyncError({
      type: 'event',
      message: error.message,
      stack: error.stack,
      context: { eventName, ...context },
      timestamp: Date.now(),
    })
  }

  // 手动处理存储错误
  handleStorageError(
    error: Error,
    operation?: string,
    context?: Record<string, unknown>
  ) {
    this.handleAsyncError({
      type: 'storage',
      message: error.message,
      stack: error.stack,
      context: { operation, ...context },
      timestamp: Date.now(),
    })
  }

  // 安全的异步函数包装器
  wrapAsync<T extends unknown[], R>(
    fn: (...args: T) => Promise<R>,
    errorType: AsyncErrorType = 'unknown'
  ) {
    return async (...args: T): Promise<R | null> => {
      try {
        return await fn(...args)
      } catch (error) {
        this.handleAsyncError({
          type: errorType,
          message: error instanceof Error ? error.message : '未知错误',
          stack: error instanceof Error ? error.stack : undefined,
          context: { args },
          timestamp: Date.now(),
        })
        return null
      }
    }
  }

  // 安全的事件处理器包装器
  wrapEventHandler<T extends unknown[]>(
    handler: (...args: T) => void,
    eventName?: string
  ) {
    return (...args: T) => {
      try {
        return handler(...args)
      } catch (error) {
        this.handleEventError(
          error instanceof Error ? error : new Error('事件处理错误'),
          eventName,
          { args }
        )
      }
    }
  }

  // 重置统计信息
  resetStats() {
    this.reportCount = 0
    this.lastReportTime = 0
  }

  // 获取统计信息
  getStats() {
    return {
      reportCount: this.reportCount,
      lastReportTime: this.lastReportTime,
      config: this.config,
    }
  }
}

// 创建默认的异步错误处理器实例
export const asyncErrorHandler = new AsyncErrorHandler()

// 便捷的错误处理函数
export const handleApiError = (
  error: Error,
  context?: Record<string, unknown>
) => {
  asyncErrorHandler.handleApiError(error, context)
}

export const handleEventError = (
  error: Error,
  eventName?: string,
  context?: Record<string, unknown>
) => {
  asyncErrorHandler.handleEventError(error, eventName, context)
}

export const handleStorageError = (
  error: Error,
  operation?: string,
  context?: Record<string, unknown>
) => {
  asyncErrorHandler.handleStorageError(error, operation, context)
}

// 安全包装器
export const safeAsync = asyncErrorHandler.wrapAsync.bind(asyncErrorHandler)
export const safeEventHandler =
  asyncErrorHandler.wrapEventHandler.bind(asyncErrorHandler)

export default AsyncErrorHandler

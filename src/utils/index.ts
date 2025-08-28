// 工具函数统一导出
export * from './date'
export * from './storage'
export * from './format'
export * from './validation'
export * from './performance'
export * from './errorHandler'
export * from './environment'

// 重新导出常用工具
export { dateUtils } from './date'
export { storageUtils, cacheManager } from './storage'
export { formatUtils } from './format'
export { validationUtils, FormValidator } from './validation'
export { performanceUtils, performanceMonitor } from './performance'
export {
  asyncErrorHandler,
  handleApiError,
  handleEventError,
  handleStorageError,
  safeAsync,
  safeEventHandler,
} from './errorHandler'

import Taro from '@tarojs/taro'

/**
 * 显示加载中
 */
export const showLoading = (title = '加载中...') => {
  Taro.showLoading({ title, mask: true })
}

/**
 * 隐藏加载中
 */
export const hideLoading = () => {
  Taro.hideLoading()
}

/**
 * 显示提示消息
 */
export const showToast = (
  title: string,
  icon: 'success' | 'error' | 'loading' | 'none' = 'none'
) => {
  Taro.showToast({ title, icon, duration: 2000 })
}

/**
 * 显示确认弹框
 */
export const showModal = (title: string, content: string): Promise<boolean> => {
  return new Promise(resolve => {
    Taro.showModal({
      title,
      content,
      success: res => {
        resolve(res.confirm)
      },
    })
  })
}

/**
 * 检查网络状态
 */
export const checkNetwork = (): Promise<boolean> => {
  return new Promise(resolve => {
    Taro.getNetworkType({
      success: res => {
        resolve(res.networkType !== 'none')
      },
      fail: () => {
        resolve(false)
      },
    })
  })
}

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout | null = null

  return ((...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}

/**
 * 节流函数
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): T => {
  let inThrottle = false

  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }) as T
}

/**
 * 生成唯一ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 获取用户级别显示名称
 * @deprecated 请使用 formatUtils.formatLevelName
 */
export const getUserLevelName = (level: string): string => {
  const levelMap: Record<string, string> = {
    preschool: '萌芽期',
    elementary: '基础期',
    middle: '发展期',
    high: '加速期',
    university: '精通期',
    master: '大师期',
  }
  return levelMap[level] || '未知'
}

/**
 * 获取用户级别颜色
 */
export const getUserLevelColor = (level: string): string => {
  const colorMap: Record<string, string> = {
    preschool: '#FF9500',
    elementary: '#50C878',
    middle: '#4A90E2',
    high: '#9B59B6',
    university: '#E74C3C',
    master: '#F39C12',
  }
  return colorMap[level] || '#999999'
}

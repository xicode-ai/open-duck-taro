import Taro from '@tarojs/taro'

/**
 * 格式化时间戳
 */
export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString()
  }
}

/**
 * 格式化音频时长
 */
export const formatDuration = (seconds: number): string => {
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

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
 * 保存到本地存储
 */
export const setStorage = async (key: string, data: unknown): Promise<void> => {
  await Taro.setStorage({ key, data })
}

/**
 * 从本地存储读取
 */
export const getStorage = <T = unknown>(key: string): Promise<T | null> => {
  return new Promise(resolve => {
    Taro.getStorage({
      key,
      success: res => {
        resolve(res.data)
      },
      fail: () => {
        resolve(null)
      },
    })
  })
}

/**
 * 清除本地存储
 */
export const removeStorage = async (key: string): Promise<void> => {
  await Taro.removeStorage({ key })
}

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(func: T, wait: number): T => {
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
export const throttle = <T extends (...args: unknown[]) => unknown>(func: T, limit: number): T => {
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

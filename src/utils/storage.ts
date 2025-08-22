import Taro from '@tarojs/taro'

/**
 * 本地存储相关工具函数
 */

/**
 * 保存到本地存储
 */
export const setStorage = async <T = unknown>(
  key: string,
  data: T
): Promise<void> => {
  try {
    await Taro.setStorage({ key, data })
  } catch (error) {
    console.error('保存到本地存储失败:', error)
    throw error
  }
}

/**
 * 从本地存储读取
 */
export const getStorage = <T = unknown>(key: string): Promise<T | null> => {
  return new Promise(resolve => {
    Taro.getStorage({
      key,
      success: res => {
        resolve(res.data as T)
      },
      fail: () => {
        resolve(null)
      },
    })
  })
}

/**
 * 同步读取本地存储
 */
export const getStorageSync = <T = unknown>(key: string): T | null => {
  try {
    return Taro.getStorageSync(key) as T
  } catch (error) {
    console.error('同步读取本地存储失败:', error)
    return null
  }
}

/**
 * 清除本地存储
 */
export const removeStorage = async (key: string): Promise<void> => {
  try {
    await Taro.removeStorage({ key })
  } catch (error) {
    console.error('清除本地存储失败:', error)
    throw error
  }
}

/**
 * 清除所有本地存储
 */
export const clearStorage = async (): Promise<void> => {
  try {
    await Taro.clearStorage()
  } catch (error) {
    console.error('清除所有本地存储失败:', error)
    throw error
  }
}

/**
 * 获取本地存储信息
 */
export const getStorageInfo = (): Promise<{
  keys: string[]
  currentSize: number
  limitSize: number
}> => {
  return new Promise((resolve, reject) => {
    Taro.getStorageInfo({
      success: res => {
        resolve(res)
      },
      fail: err => {
        reject(err)
      },
    })
  })
}

/**
 * 批量保存到本地存储
 */
export const setBatchStorage = async (
  items: Record<string, unknown>
): Promise<void> => {
  const promises = Object.entries(items).map(([key, data]) =>
    setStorage(key, data)
  )
  await Promise.all(promises)
}

/**
 * 批量读取本地存储
 */
export const getBatchStorage = async <T = unknown>(
  keys: string[]
): Promise<Record<string, T | null>> => {
  const promises = keys.map(async key => {
    const data = await getStorage<T>(key)
    return [key, data] as const
  })

  const results = await Promise.all(promises)
  return Object.fromEntries(results)
}

/**
 * 检查存储项是否存在
 */
export const hasStorage = async (key: string): Promise<boolean> => {
  const data = await getStorage(key)
  return data !== null
}

/**
 * 带过期时间的存储
 */
interface StorageWithExpiry<T> {
  data: T
  timestamp: number
  expiry: number
}

/**
 * 保存到本地存储（带过期时间）
 */
export const setStorageWithExpiry = async <T = unknown>(
  key: string,
  data: T,
  expiry: number // 过期时间（毫秒）
): Promise<void> => {
  const item: StorageWithExpiry<T> = {
    data,
    timestamp: Date.now(),
    expiry,
  }
  await setStorage(key, item)
}

/**
 * 从本地存储读取（检查过期时间）
 */
export const getStorageWithExpiry = async <T = unknown>(
  key: string
): Promise<T | null> => {
  const item = await getStorage<StorageWithExpiry<T>>(key)

  if (!item) return null

  const now = Date.now()
  if (now > item.timestamp + item.expiry) {
    // 已过期，删除并返回null
    await removeStorage(key)
    return null
  }

  return item.data
}

/**
 * 缓存管理器
 */
class CacheManager {
  private prefix: string

  constructor(prefix = 'cache_') {
    this.prefix = prefix
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  async set<T>(key: string, data: T, expiry = 5 * 60 * 1000): Promise<void> {
    await setStorageWithExpiry(this.getKey(key), data, expiry)
  }

  async get<T>(key: string): Promise<T | null> {
    return getStorageWithExpiry<T>(this.getKey(key))
  }

  async remove(key: string): Promise<void> {
    await removeStorage(this.getKey(key))
  }

  async clear(): Promise<void> {
    const info = await getStorageInfo()
    const keysToRemove = info.keys.filter(key => key.startsWith(this.prefix))

    const promises = keysToRemove.map(key => removeStorage(key))
    await Promise.all(promises)
  }

  async has(key: string): Promise<boolean> {
    const data = await this.get(key)
    return data !== null
  }
}

// 创建默认缓存管理器
export const cacheManager = new CacheManager()

// 导出存储工具对象
export const storageUtils = {
  setStorage,
  getStorage,
  getStorageSync,
  removeStorage,
  clearStorage,
  getStorageInfo,
  setBatchStorage,
  getBatchStorage,
  hasStorage,
  setStorageWithExpiry,
  getStorageWithExpiry,
  cacheManager,
}

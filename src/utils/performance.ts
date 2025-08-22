/**
 * 性能优化相关工具函数
 */

/**
 * 预加载资源
 */
export const preloadResource = (
  url: string,
  type: 'script' | 'style' | 'image' | 'font'
) => {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = url

  switch (type) {
    case 'script':
      link.as = 'script'
      break
    case 'style':
      link.as = 'style'
      break
    case 'image':
      link.as = 'image'
      break
    case 'font':
      link.as = 'font'
      link.crossOrigin = 'anonymous'
      break
  }

  document.head.appendChild(link)
}

/**
 * 批量处理操作
 */
export const batchOperations = <T>(
  operations: (() => T)[],
  batchSize = 10,
  delay = 0
): Promise<T[]> => {
  return new Promise(resolve => {
    const results: T[] = []
    let currentBatch = 0

    const processBatch = () => {
      const start = currentBatch * batchSize
      const end = Math.min(start + batchSize, operations.length)

      for (let i = start; i < end; i++) {
        results[i] = operations[i]()
      }

      currentBatch++

      if (end < operations.length) {
        setTimeout(processBatch, delay)
      } else {
        resolve(results)
      }
    }

    processBatch()
  })
}

/**
 * 性能监控类
 */
export class PerformanceMonitor {
  private metrics: Record<string, number> = {}

  // 测量函数执行时间
  measure<T>(name: string, fn: () => T): T {
    const start = Date.now()
    const result = fn()
    const end = Date.now()
    this.metrics[name] = end - start
    return result
  }

  // 测量异步函数执行时间
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now()
    const result = await fn()
    const end = Date.now()
    this.metrics[name] = end - start
    return result
  }

  // 获取所有指标
  getMetrics() {
    return { ...this.metrics }
  }

  // 清除指标
  clearMetrics() {
    this.metrics = {}
  }
}

// 导出性能工具对象
export const performanceUtils = {
  preloadResource,
  batchOperations,
  PerformanceMonitor,
}

// 创建默认实例
export const performanceMonitor = new PerformanceMonitor()

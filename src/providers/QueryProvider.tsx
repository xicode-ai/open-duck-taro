import React, { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 创建 QueryClient 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 数据保持新鲜的时间（5分钟）
      staleTime: 5 * 60 * 1000,
      // 缓存时间（30分钟）
      gcTime: 30 * 60 * 1000,
      // 重试配置 - 更智能的重试策略
      retry: (failureCount, error: { status?: number; message?: string }) => {
        // 网络错误或5xx错误重试
        if (failureCount >= 3) return false

        // 网络错误
        if (
          error?.message?.includes('network') ||
          error?.message?.includes('fetch')
        ) {
          return true
        }

        // 5xx 服务器错误
        if (error?.status && error.status >= 500) {
          return true
        }

        // 4xx 客户端错误不重试
        if (error?.status && error.status >= 400 && error.status < 500) {
          return false
        }

        return true
      },
      // 重试延迟（指数退避，但限制最大延迟）
      retryDelay: attemptIndex => {
        const delay = Math.min(1000 * 2 ** attemptIndex, 10000) // 最大10秒
        // 添加随机抖动避免所有客户端同时重试
        return delay + Math.random() * 1000
      },
      // 窗口重新获得焦点时不自动重新获取
      refetchOnWindowFocus: false,
      // 网络重连时重新获取
      refetchOnReconnect: true,
    },
    mutations: {
      // 变更重试配置 - 减少重试次数
      retry: (failureCount, error: { message?: string }) => {
        // 网络错误重试一次
        if (error?.message?.includes('network') && failureCount < 1) {
          return true
        }
        return false
      },
      // 变更重试延迟
      retryDelay: () => 1000,
    },
  },
})

// QueryProvider 组件
export const QueryProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

// 导出 queryClient 实例供其他地方使用
export { queryClient }
export default QueryProvider

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
      // 重试配置
      retry: (failureCount, error: Error) => {
        // 网络错误重试，其他错误不重试
        if (error?.message?.includes('network') && failureCount < 3) {
          return true
        }
        return false
      },
      // 重试延迟（指数退避）
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // 窗口重新获得焦点时不自动重新获取
      refetchOnWindowFocus: false,
      // 网络重连时重新获取
      refetchOnReconnect: true,
    },
    mutations: {
      // 变更重试配置
      retry: 1,
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

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { translateApi } from '@/services/api'
import Taro from '@tarojs/taro'
import type { TranslateHistoryItem } from '@/types'

// Query Keys
export const TRANSLATE_HISTORY_KEYS = {
  all: ['translateHistory'] as const,
  lists: () => [...TRANSLATE_HISTORY_KEYS.all, 'list'] as const,
  list: (filters: { page?: number; pageSize?: number; type?: string }) =>
    [...TRANSLATE_HISTORY_KEYS.lists(), filters] as const,
  favorites: () => [...TRANSLATE_HISTORY_KEYS.all, 'favorites'] as const,
  detail: (id: string) =>
    [...TRANSLATE_HISTORY_KEYS.all, 'detail', id] as const,
}

// 获取翻译历史（分页）
export const useTranslateHistory = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: TRANSLATE_HISTORY_KEYS.list({ page, pageSize }),
    queryFn: async () => {
      const response = await translateApi.getTranslationHistory(page, pageSize)
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 30 * 60 * 1000, // 30分钟
  })
}

// 无限滚动加载翻译历史
export const useInfiniteTranslateHistory = (pageSize = 20) => {
  return useInfiniteQuery({
    queryKey: TRANSLATE_HISTORY_KEYS.list({ pageSize }),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await translateApi.getTranslationHistory(
        pageParam,
        pageSize
      )
      return response.data
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce(
        (sum, page) => sum + page.list.length,
        0
      )
      if (totalLoaded >= lastPage.total) {
        return undefined
      }
      return allPages.length + 1
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

// 获取收藏列表
export const useFavoriteHistory = () => {
  return useQuery({
    queryKey: TRANSLATE_HISTORY_KEYS.favorites(),
    queryFn: async () => {
      const response = await translateApi.getFavoriteHistory()
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

// 切换收藏状态
export const useToggleFavorite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      isFavorited,
    }: {
      id: string
      isFavorited: boolean
    }) => {
      const response = await translateApi.toggleFavorite(id, isFavorited)
      return response.data
    },
    onMutate: async ({ id, isFavorited }) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({
        queryKey: TRANSLATE_HISTORY_KEYS.lists(),
      })

      // 保存之前的数据用于回滚
      const previousData = queryClient.getQueriesData({
        queryKey: TRANSLATE_HISTORY_KEYS.lists(),
      })

      // 乐观更新
      queryClient.setQueriesData(
        { queryKey: TRANSLATE_HISTORY_KEYS.lists() },
        old => {
          if (!old) return old

          // 处理分页数据结构 (InfiniteData)
          if (
            typeof old === 'object' &&
            old !== null &&
            'pages' in old &&
            Array.isArray((old as { pages: unknown[] }).pages)
          ) {
            const infiniteData = old as {
              pages: Array<{
                list: TranslateHistoryItem[]
                total: number
                page: number
                pageSize: number
                hasMore?: boolean
              }>
              pageParams: unknown[]
            }

            return {
              ...infiniteData,
              pages: infiniteData.pages.map(page => ({
                ...page,
                list: page.list.map((item: TranslateHistoryItem) =>
                  item.id === id ? { ...item, isFavorited } : item
                ),
              })),
            }
          }

          // 处理单页数据结构
          if (
            typeof old === 'object' &&
            old !== null &&
            'list' in old &&
            Array.isArray((old as { list: unknown[] }).list)
          ) {
            const pageData = old as {
              list: TranslateHistoryItem[]
              total: number
              page: number
              pageSize: number
              hasMore?: boolean
            }

            return {
              ...pageData,
              list: pageData.list.map((item: TranslateHistoryItem) =>
                item.id === id ? { ...item, isFavorited } : item
              ),
            }
          }

          return old
        }
      )

      return { previousData }
    },
    onError: (err, variables, context) => {
      // 错误时回滚
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      Taro.showToast({
        title: '操作失败',
        icon: 'error',
      })
    },
    onSettled: () => {
      // 最终同步数据
      queryClient.invalidateQueries({
        queryKey: TRANSLATE_HISTORY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: TRANSLATE_HISTORY_KEYS.favorites(),
      })
    },
    onSuccess: (data, { isFavorited }) => {
      Taro.showToast({
        title: isFavorited ? '已收藏' : '已取消收藏',
        icon: 'success',
      })
    },
  })
}

// 清空历史记录（保留收藏）
export const useClearHistory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await translateApi.clearTranslationHistoryOnly()
      return response.data
    },
    onSuccess: () => {
      // 清除所有相关缓存
      queryClient.removeQueries({ queryKey: TRANSLATE_HISTORY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: TRANSLATE_HISTORY_KEYS.all })

      Taro.showToast({
        title: '已清空历史记录',
        icon: 'success',
      })
    },
    onError: () => {
      Taro.showToast({
        title: '清空失败',
        icon: 'error',
      })
    },
  })
}

// 清空收藏记录
export const useClearFavorites = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await translateApi.clearFavorites()
      return response.data
    },
    onSuccess: () => {
      // 清除所有相关缓存
      queryClient.removeQueries({ queryKey: TRANSLATE_HISTORY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: TRANSLATE_HISTORY_KEYS.all })

      Taro.showToast({
        title: '已清空收藏记录',
        icon: 'success',
      })
    },
    onError: () => {
      Taro.showToast({
        title: '清空失败',
        icon: 'error',
      })
    },
  })
}

// 清空所有历史记录
export const useClearAllHistory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await translateApi.clearTranslationHistory()
      return response.data
    },
    onSuccess: () => {
      // 清除所有相关缓存
      queryClient.removeQueries({ queryKey: TRANSLATE_HISTORY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: TRANSLATE_HISTORY_KEYS.all })

      Taro.showToast({
        title: '已清空所有记录',
        icon: 'success',
      })
    },
    onError: () => {
      Taro.showToast({
        title: '清空失败',
        icon: 'error',
      })
    },
  })
}

// 删除单条历史记录
export const useDeleteHistoryItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await translateApi.deleteTranslationHistory(id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TRANSLATE_HISTORY_KEYS.lists(),
      })

      Taro.showToast({
        title: '已删除',
        icon: 'success',
      })
    },
    onError: () => {
      Taro.showToast({
        title: '删除失败',
        icon: 'error',
      })
    },
  })
}

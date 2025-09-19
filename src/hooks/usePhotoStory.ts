import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query'
import axios from 'axios'
import type {
  PhotoStory,
  PhotoStoryScore,
  GenerateStoryRequest,
  GenerateStoryResponse,
  SpeechScoreRequest,
  SpeechScoreResponse,
  PhotoStoryHistoryResponse,
  ApiResponse,
} from '../types'
import { usePhotoStoryStore } from '../stores/photoStory'
import Taro from '@tarojs/taro'

// Query Keys
export const PHOTO_STORY_KEYS = {
  all: ['photoStory'] as const,
  history: (page?: number) =>
    [...PHOTO_STORY_KEYS.all, 'history', page] as const,
  detail: (id: string) => [...PHOTO_STORY_KEYS.all, 'detail', id] as const,
  generate: () => [...PHOTO_STORY_KEYS.all, 'generate'] as const,
  score: () => [...PHOTO_STORY_KEYS.all, 'score'] as const,
}

// API 基础URL（根据环境配置）
const API_BASE_URL = process.env.NODE_ENV === 'development' ? '/api' : '/api'

// 生成短文
export const useGenerateStory = () => {
  const queryClient = useQueryClient()
  const { setCurrentStory, setGenerating } = usePhotoStoryStore()

  return useMutation<GenerateStoryResponse, Error, GenerateStoryRequest>({
    mutationFn: async data => {
      setGenerating(true)
      const response = await axios.post<ApiResponse<PhotoStory>>(
        `${API_BASE_URL}/photo-story/generate`,
        data
      )
      return { story: response.data.data }
    },
    onSuccess: data => {
      setCurrentStory(data.story)
      setGenerating(false)
      // 使历史记录缓存失效
      queryClient.invalidateQueries({ queryKey: PHOTO_STORY_KEYS.history() })

      Taro.showToast({
        title: '短文生成成功',
        icon: 'success',
      })
    },
    onError: error => {
      setGenerating(false)
      console.error('生成短文失败:', error)
      Taro.showToast({
        title: '生成失败，请重试',
        icon: 'error',
      })
    },
  })
}

// 获取历史记录（无限滚动）
export const usePhotoStoryHistory = () => {
  return useInfiniteQuery<PhotoStoryHistoryResponse, Error>({
    queryKey: PHOTO_STORY_KEYS.history(),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axios.get<ApiResponse<PhotoStoryHistoryResponse>>(
        `${API_BASE_URL}/photo-story/history`,
        {
          params: {
            page: pageParam,
            pageSize: 10,
          },
        }
      )
      return response.data.data
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.hasMore) {
        return allPages.length + 1
      }
      return undefined
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 30 * 60 * 1000, // 30分钟
  })
}

// 获取单个故事详情
export const usePhotoStoryDetail = (id: string) => {
  return useQuery<PhotoStory, Error>({
    queryKey: PHOTO_STORY_KEYS.detail(id),
    queryFn: async () => {
      const response = await axios.get<ApiResponse<PhotoStory>>(
        `${API_BASE_URL}/photo-story/detail/${id}`
      )
      return response.data.data
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10分钟
  })
}

// 缓存更新辅助函数：同步当前故事状态到历史数据缓存
const updateStoryInHistoryCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  storyId: string,
  updates: Partial<PhotoStory>
) => {
  // 更新历史数据缓存中的对应项
  queryClient.setQueriesData(
    { queryKey: PHOTO_STORY_KEYS.history(), exact: false },
    (oldData: { pages?: Array<{ items: PhotoStory[] }> } | undefined) => {
      if (!oldData?.pages) return oldData

      return {
        ...oldData,
        pages: oldData.pages.map(page => ({
          ...page,
          items: page.items.map((story: PhotoStory) =>
            story.id === storyId ? { ...story, ...updates } : story
          ),
        })),
      }
    }
  )

  // 同时更新详情缓存
  queryClient.setQueryData(
    PHOTO_STORY_KEYS.detail(storyId),
    (oldData: PhotoStory | undefined) => {
      if (oldData) {
        return { ...oldData, ...updates }
      }
      return oldData
    }
  )
}

// 语音评分
export const useSpeechScore = () => {
  const queryClient = useQueryClient()
  const { updatePracticeScore, setRecording, currentStory } =
    usePhotoStoryStore()

  return useMutation<SpeechScoreResponse, Error, SpeechScoreRequest>({
    mutationFn: async data => {
      setRecording(true)
      const response = await axios.post<ApiResponse<SpeechScoreResponse>>(
        `${API_BASE_URL}/photo-story/speech-score`,
        data
      )
      return response.data.data
    },
    onSuccess: (data, variables) => {
      setRecording(false)

      // 更新练习分数
      if (data.score) {
        updatePracticeScore(variables.sentenceId, data.score)

        // 同步更新历史数据缓存
        if (currentStory?.id) {
          // 从sentenceId中提取类型信息来决定更新哪个评分字段
          const isStandardType = variables.sentenceId.includes('standard')
          const updates = isStandardType
            ? { standardScore: data.score }
            : { nativeScore: data.score }

          updateStoryInHistoryCache(queryClient, currentStory.id, {
            ...updates,
            status: 'completed',
          })
        }
      }

      // 显示分数
      const grade = data.score.grade
      const overall = data.score.overall
      Taro.showToast({
        title: `得分: ${overall} (${grade})`,
        icon: 'none',
        duration: 2000,
      })
    },
    onError: error => {
      setRecording(false)
      console.error('评分失败:', error)
      Taro.showToast({
        title: '评分失败，请重试',
        icon: 'error',
      })
    },
  })
}

// 保存练习记录
export const useSavePhotoStory = () => {
  const queryClient = useQueryClient()
  const { currentStory, getOverallScore } = usePhotoStoryStore()

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!currentStory) {
        throw new Error('没有可保存的故事')
      }

      const overallScore = getOverallScore()
      const storyToSave = {
        ...currentStory,
        score: overallScore,
        status: 'completed' as const,
      }

      await axios.post<ApiResponse<void>>(
        `${API_BASE_URL}/photo-story/save`,
        storyToSave
      )
    },
    onSuccess: () => {
      // 使历史记录缓存失效
      queryClient.invalidateQueries({ queryKey: PHOTO_STORY_KEYS.history() })

      Taro.showToast({
        title: '保存成功',
        icon: 'success',
      })
    },
    onError: error => {
      console.error('保存失败:', error)
      Taro.showToast({
        title: '保存失败，请重试',
        icon: 'error',
      })
    },
  })
}

// 删除历史记录
export const useDeletePhotoStory = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async id => {
      await axios.delete<ApiResponse<void>>(`${API_BASE_URL}/photo-story/${id}`)
    },
    onSuccess: () => {
      // 使历史记录缓存失效
      queryClient.invalidateQueries({ queryKey: PHOTO_STORY_KEYS.history() })

      Taro.showToast({
        title: '删除成功',
        icon: 'success',
      })
    },
    onError: error => {
      console.error('删除失败:', error)
      Taro.showToast({
        title: '删除失败，请重试',
        icon: 'error',
      })
    },
  })
}

// 综合的故事评分更新 Hook - 同时更新 Zustand store 和 React Query 缓存
export const useUpdateStoryScore = () => {
  const queryClient = useQueryClient()
  const { updateStoryScoreByType, currentStory } = usePhotoStoryStore()

  return (score: PhotoStoryScore, type: 'standard' | 'native') => {
    // 更新 Zustand store
    updateStoryScoreByType(score, type)

    // 同步更新历史数据缓存
    if (currentStory?.id) {
      const updates =
        type === 'standard' ? { standardScore: score } : { nativeScore: score }

      updateStoryInHistoryCache(queryClient, currentStory.id, {
        ...updates,
        status: 'completed',
      })
    }
  }
}

// 收藏/取消收藏
export const useToggleFavorite = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { id: string; isFavorite: boolean }>({
    mutationFn: async ({ id, isFavorite }) => {
      await axios.post<ApiResponse<void>>(
        `${API_BASE_URL}/photo-story/${id}/favorite`,
        { isFavorite }
      )
    },
    onMutate: async ({ id, isFavorite }) => {
      // 乐观更新本地缓存
      queryClient.setQueryData(
        PHOTO_STORY_KEYS.detail(id),
        (old: PhotoStory | undefined) => {
          if (old) {
            return {
              ...old,
              isFavorite,
              favoritedAt: isFavorite ? new Date().toISOString() : undefined,
            }
          }
          return old
        }
      )
    },
    onSuccess: (_, variables) => {
      // 使历史记录缓存失效
      queryClient.invalidateQueries({ queryKey: PHOTO_STORY_KEYS.history() })

      Taro.showToast({
        title: variables.isFavorite ? '已收藏' : '已取消收藏',
        icon: 'success',
      })
    },
    onError: (error, variables) => {
      // 错误时回滚乐观更新
      queryClient.setQueryData(
        PHOTO_STORY_KEYS.detail(variables.id),
        (old: PhotoStory | undefined) => {
          if (old) {
            return {
              ...old,
              isFavorite: !variables.isFavorite,
              favoritedAt: !variables.isFavorite
                ? new Date().toISOString()
                : undefined,
            }
          }
          return old
        }
      )

      console.error('操作失败:', error)
      Taro.showToast({
        title: '操作失败，请重试',
        icon: 'error',
      })
    },
  })
}

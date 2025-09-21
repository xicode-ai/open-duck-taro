import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Taro from '@tarojs/taro'
import {
  userApi,
  chatApi,
  topicApi,
  vocabularyApi,
  translateApi,
  photoStoryApi,
} from '@/services/api'
import type { User, WordKnowledgeLevel } from '@/types'

// Query Keys 常量
export const QUERY_KEYS = {
  // 用户相关
  USER: ['user'] as const,
  USER_PROFILE: (userId?: string) => ['user', 'profile', userId] as const,
  USER_STATS: ['user', 'stats'] as const,

  // 话题相关
  TOPICS: ['topics'] as const,
  HOT_TOPICS: ['topics', 'hot'] as const,
  CUSTOM_TOPICS: ['topics', 'custom'] as const,
  TOPIC_PROGRESS: ['topics', 'progress'] as const,
  TOPIC_DETAIL: (topicId: string) => ['topics', 'detail', topicId] as const,
  TOPIC_DIALOGUES: (topicId: string) =>
    ['topics', 'dialogues', topicId] as const,

  // 词汇相关
  VOCABULARIES: ['vocabularies'] as const,
  VOCABULARY_BY_LEVEL: (level: string) =>
    ['vocabularies', 'level', level] as const,
  VOCABULARY_PROGRESS: (userId: string) =>
    ['vocabularies', 'progress', userId] as const,
  VOCABULARY_STAGES: ['vocabularies', 'stages'] as const,
  VOCABULARY_STUDY_NOTES: ['vocabularies', 'study-notes'] as const,

  // 单词学习相关
  VOCABULARY_STUDY_WORDS: (stage: string) =>
    ['vocabularies', 'study-words', stage] as const,
  VOCABULARY_STUDY_WORD_DETAIL: (wordId: string) =>
    ['vocabularies', 'study-word', wordId] as const,
  VOCABULARY_STUDY_HISTORY: ['vocabularies', 'study-history'] as const,
  VOCABULARY_DAILY_PROGRESS: (date?: string) =>
    ['vocabularies', 'daily-progress', date] as const,
  VOCABULARY_FAVORITES: ['vocabularies', 'favorites'] as const,

  // 聊天相关
  CHAT_HISTORY: (sessionId: string) => ['chat', 'history', sessionId] as const,
  CHAT_SESSIONS: ['chat', 'sessions'] as const,

  // 翻译相关
  TRANSLATION_HISTORY: ['translation', 'history'] as const,

  // 照片故事相关
  PHOTO_STORIES: ['photo-stories'] as const,
} as const

// ============ 用户相关 Hooks ============

/**
 * 获取用户信息 - 长缓存策略
 */
export const useUserInfo = () => {
  return useQuery({
    queryKey: QUERY_KEYS.USER_PROFILE(),
    queryFn: async () => {
      const response = await userApi.getUserInfo()
      return response.data
    },
    staleTime: 30 * 60 * 1000, // 30分钟内认为数据是新鲜的（用户信息变化不频繁）
    gcTime: 60 * 60 * 1000, // 1小时后清理缓存
  })
}

/**
 * 获取用户学习统计 - 中等缓存策略
 */
export const useUserStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.USER_STATS,
    queryFn: async () => {
      const response = await userApi.getStudyStats()
      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2分钟内认为数据是新鲜的（学习统计更新相对频繁）
    gcTime: 10 * 60 * 1000, // 10分钟后清理缓存
  })
}

/**
 * 更新用户信息
 */
export const useUpdateUserInfo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userInfo: Partial<User>) => userApi.updateUserInfo(userInfo),
    onSuccess: data => {
      // 更新用户信息缓存
      queryClient.setQueryData(QUERY_KEYS.USER_PROFILE(), data)
      // 使相关查询失效
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })
    },
  })
}

/**
 * 用户登录
 */
export const useUserLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (code: string) => userApi.login(code),
    onSuccess: data => {
      // 设置用户信息缓存
      queryClient.setQueryData(QUERY_KEYS.USER_PROFILE(), data)
      // 预取用户统计数据
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.USER_STATS,
        queryFn: () => userApi.getStudyStats(),
      })
    },
  })
}

// ============ 话题相关 Hooks ============

/**
 * 获取话题列表
 */
export const useTopics = (category?: string, level?: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.TOPICS, { category, level }],
    queryFn: async () => {
      const response = await topicApi.getTopics({ category, level })
      return response.data
    },
    staleTime: 15 * 60 * 1000, // 15分钟内认为数据是新鲜的
  })
}

/**
 * 获取热门话题
 */
export const useHotTopics = (category?: string, level?: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.HOT_TOPICS, { category, level }],
    queryFn: async () => {
      const response = await topicApi.getHotTopics({ category, level })
      return response.data
    },
    staleTime: 15 * 60 * 1000, // 15分钟内认为数据是新鲜的
  })
}

/**
 * 获取自定义话题
 */
export const useCustomTopics = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CUSTOM_TOPICS,
    queryFn: async () => {
      const response = await topicApi.getCustomTopics()
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5分钟内认为数据是新鲜的
  })
}

/**
 * 获取话题学习进度
 */
export const useTopicProgress = () => {
  return useQuery({
    queryKey: QUERY_KEYS.TOPIC_PROGRESS,
    queryFn: async () => {
      const response = await topicApi.getTopicProgress()
      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2分钟内认为数据是新鲜的
  })
}

/**
 * 获取话题详情
 */
export const useTopicDetail = (topicId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.TOPIC_DETAIL(topicId),
    queryFn: () => topicApi.getTopicDetail(topicId),
    enabled: !!topicId,
    staleTime: 30 * 60 * 1000, // 30分钟内认为数据是新鲜的
  })
}

/**
 * 获取话题对话内容
 */
export const useTopicDialogues = (topicId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.TOPIC_DIALOGUES(topicId),
    queryFn: () => topicApi.getTopicDialogues(topicId),
    enabled: !!topicId,
    staleTime: 60 * 60 * 1000, // 1小时内认为数据是新鲜的
  })
}

/**
 * 获取话题对话详情 (替换 useTopicDialogues)
 */
export const useTopicDialogueDetail = (topicId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.TOPIC_DIALOGUES(topicId),
    queryFn: () => topicApi.getTopicDialogueDetail(topicId),
    enabled: !!topicId,
    staleTime: 5 * 60 * 1000, // 5分钟
  })
}

/**
 * 录音跟读
 */
export const useRecordDialogue = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: {
      topicId: string
      dialogueId: string
      audioBlob: string
      duration: number
    }) =>
      topicApi.recordDialogue(variables.topicId, {
        dialogueId: variables.dialogueId,
        audioBlob: variables.audioBlob,
        duration: variables.duration,
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TOPIC_DIALOGUES(variables.topicId),
      })
    },
  })
}

/**
 * 下一个对话
 */
export const useNextDialogue = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (topicId: string) => topicApi.nextDialogue(topicId),
    onSuccess: (data, topicId) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TOPIC_DIALOGUES(topicId),
      })
    },
  })
}

/**
 * 重置练习
 */
export const useResetTopicPractice = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (topicId: string) => topicApi.resetPractice(topicId),
    onSuccess: (data, topicId) => {
      queryClient.setQueryData(QUERY_KEYS.TOPIC_DIALOGUES(topicId), data)
    },
  })
}

/**
 * 切换话题收藏（带乐观更新）
 */
export const useToggleTopicFavorite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (topicId: string) => topicApi.toggleFavorite(topicId),

    // 乐观更新
    onMutate: async topicId => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.HOT_TOPICS })
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.TOPICS })

      // 保存之前的数据
      const previousHotTopics = queryClient.getQueryData(QUERY_KEYS.HOT_TOPICS)
      const previousTopics = queryClient.getQueryData(QUERY_KEYS.TOPICS)

      // 乐观更新热门话题
      queryClient.setQueryData(QUERY_KEYS.HOT_TOPICS, (old: unknown) =>
        Array.isArray(old)
          ? old.map((topic: { id: string; isFavorite?: boolean }) =>
              topic.id === topicId
                ? { ...topic, isFavorite: !topic.isFavorite }
                : topic
            )
          : old
      )

      return { previousHotTopics, previousTopics }
    },

    onSuccess: (data, topicId) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TOPIC_DIALOGUES(topicId),
      })
    },

    // 错误回滚
    onError: (err, variables, context) => {
      if (context?.previousHotTopics) {
        queryClient.setQueryData(
          QUERY_KEYS.HOT_TOPICS,
          context.previousHotTopics
        )
      }
      if (context?.previousTopics) {
        queryClient.setQueryData(QUERY_KEYS.TOPICS, context.previousTopics)
      }
    },

    // 最终同步
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HOT_TOPICS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TOPICS })
    },
  })
}

/**
 * 创建自定义话题
 */
export const useCreateCustomTopic = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; description?: string; icon: string }) =>
      topicApi.createCustomTopic(data),
    onSuccess: () => {
      // 刷新自定义话题列表
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOM_TOPICS })
    },
  })
}

/**
 * 更新自定义话题
 */
export const useUpdateCustomTopic = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      topicId,
      data,
    }: {
      topicId: string
      data: { title: string; icon: string }
    }) => topicApi.updateCustomTopic(topicId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOM_TOPICS })
    },
  })
}

/**
 * 删除自定义话题（带乐观更新）
 */
export const useDeleteCustomTopic = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (topicId: string) => topicApi.deleteCustomTopic(topicId),

    // 乐观更新
    onMutate: async topicId => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.CUSTOM_TOPICS })

      const previousTopics = queryClient.getQueryData(QUERY_KEYS.CUSTOM_TOPICS)

      // 乐观移除话题
      queryClient.setQueryData(QUERY_KEYS.CUSTOM_TOPICS, (old: unknown) =>
        Array.isArray(old)
          ? old.filter((topic: { id: string }) => topic.id !== topicId)
          : old
      )

      return { previousTopics }
    },

    // 错误回滚
    onError: (err, variables, context) => {
      if (context?.previousTopics) {
        queryClient.setQueryData(
          QUERY_KEYS.CUSTOM_TOPICS,
          context.previousTopics
        )
      }
    },

    // 最终同步
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOM_TOPICS })
    },
  })
}

/**
 * 切换参考答案
 */
export const useToggleReferenceAnswer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: { topicId: string; dialogueId: string }) =>
      topicApi.toggleReferenceAnswer(variables.topicId, variables.dialogueId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TOPIC_DIALOGUES(variables.topicId),
      })
    },
  })
}

/**
 * 获取系统回答
 */
export const useGetSystemResponse = () => {
  return useMutation({
    mutationFn: (variables: { topicId: string; currentDialogueId: string }) =>
      topicApi.getSystemResponse(
        variables.topicId,
        variables.currentDialogueId
      ),
  })
}

// ============ 词汇相关 Hooks ============

/**
 * 获取词汇列表
 */
export const useVocabularies = (level?: string, category?: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.VOCABULARIES, { level, category }],
    queryFn: () => vocabularyApi.getVocabularies({ level, category }),
    staleTime: 30 * 60 * 1000, // 30分钟内认为数据是新鲜的
  })
}

/**
 * 获取按级别分组的词汇
 */
export const useVocabulariesByLevel = (level: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.VOCABULARY_BY_LEVEL(level),
    queryFn: () => vocabularyApi.getVocabulariesByLevel(level),
    enabled: !!level,
    staleTime: 30 * 60 * 1000,
  })
}

/**
 * 获取词汇学习进度
 */
export const useVocabularyProgress = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.VOCABULARY_PROGRESS(userId),
    queryFn: () => vocabularyApi.getVocabularyProgress(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5分钟内认为数据是新鲜的
  })
}

/**
 * 更新词汇学习进度
 */
export const useUpdateVocabularyProgress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ wordId, progress }: { wordId: string; progress: number }) =>
      vocabularyApi.updateVocabularyProgress(wordId, progress),
    onSuccess: () => {
      // 使词汇进度查询失效
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.VOCABULARY_PROGRESS(''),
      })
    },
  })
}

/**
 * 获取学习阶段列表
 */
export const useLearningStages = () => {
  return useQuery({
    queryKey: QUERY_KEYS.VOCABULARY_STAGES,
    queryFn: async () => {
      const response = await vocabularyApi.getLearningStages()
      return response.data
    },
    staleTime: 60 * 60 * 1000, // 1小时内认为数据是新鲜的
  })
}

/**
 * 获取学习说明
 */
export const useStudyNotes = () => {
  return useQuery({
    queryKey: QUERY_KEYS.VOCABULARY_STUDY_NOTES,
    queryFn: async () => {
      const response = await vocabularyApi.getStudyNotes()
      return response.data
    },
    staleTime: 60 * 60 * 1000, // 1小时内认为数据是新鲜的
  })
}

// ============ 单词学习相关 Hooks ============

/**
 * 获取单词学习列表（根据阶段）
 */
export const useStudyWordsByStage = (stage: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.VOCABULARY_STUDY_WORDS(stage),
    queryFn: async () => {
      const response = await vocabularyApi.getStudyWordsByStage(stage)
      return response.data
    },
    enabled: !!stage,
    staleTime: 2 * 60 * 1000, // 2分钟内认为数据是新鲜的
  })
}

/**
 * 获取单个学习单词详情
 */
export const useStudyWordDetail = (wordId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.VOCABULARY_STUDY_WORD_DETAIL(wordId),
    queryFn: async () => {
      const response = await vocabularyApi.getStudyWordDetail(wordId)
      return response.data
    },
    enabled: !!wordId,
    staleTime: 10 * 60 * 1000, // 10分钟内认为数据是新鲜的
  })
}

/**
 * 提交单词学习记录
 */
export const useSubmitStudyRecord = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: vocabularyApi.submitStudyRecord,
    onSuccess: (data, variables) => {
      // 使学习历史失效
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.VOCABULARY_STUDY_HISTORY,
      })
      // 使今日进度失效
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.VOCABULARY_DAILY_PROGRESS(),
      })
      // 使该阶段的单词列表失效
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.VOCABULARY_STUDY_WORDS(variables.stage),
      })
    },
  })
}

/**
 * 获取学习历史记录（分页）
 */
export const useStudyHistory = (params?: {
  page?: number
  pageSize?: number
  type?: 'all' | 'favorites'
  knowledgeLevel?: 'all' | 'known' | 'vague' | 'unknown'
}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.VOCABULARY_STUDY_HISTORY, params],
    queryFn: async () => {
      const response = await vocabularyApi.getStudyHistory(params)
      return response.data
    },
    staleTime: 30 * 1000, // 30秒内认为数据是新鲜的
  })
}

/**
 * 获取今日学习进度 - 短缓存策略（实时数据）
 */
export const useDailyProgress = (date?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.VOCABULARY_DAILY_PROGRESS(date),
    queryFn: async () => {
      const response = await vocabularyApi.getDailyProgress(date)
      return response.data
    },
    staleTime: 30 * 1000, // 30秒内认为数据是新鲜的（实时学习进度）
    gcTime: 5 * 60 * 1000, // 5分钟后清理缓存
    refetchOnMount: 'always', // 组件挂载时总是重新获取
  })
}

/**
 * 切换单词收藏状态
 */
export const useToggleWordFavorite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      wordId,
      isFavorited,
    }: {
      wordId: string
      isFavorited: boolean
    }) => vocabularyApi.toggleWordFavorite(wordId, isFavorited),
    onSuccess: (data, variables) => {
      // 使收藏列表失效
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.VOCABULARY_FAVORITES,
      })
      // 使学习历史失效
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.VOCABULARY_STUDY_HISTORY,
      })
      // 使单词详情失效
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.VOCABULARY_STUDY_WORD_DETAIL(variables.wordId),
      })
    },
  })
}

/**
 * 获取收藏单词列表
 */
export const useFavoriteWords = (params?: {
  page?: number
  pageSize?: number
}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.VOCABULARY_FAVORITES, params],
    queryFn: async () => {
      const response = await vocabularyApi.getFavoriteWords(params)
      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2分钟内认为数据是新鲜的
  })
}

/**
 * 更新单词认识度
 */
export const useUpdateWordKnowledgeLevel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      wordId,
      knowledgeLevel,
    }: {
      wordId: string
      knowledgeLevel: WordKnowledgeLevel
    }) => vocabularyApi.updateWordKnowledgeLevel(wordId, knowledgeLevel),
    onSuccess: (data, variables) => {
      // 使学习历史失效
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.VOCABULARY_STUDY_HISTORY,
      })
      // 使单词详情失效
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.VOCABULARY_STUDY_WORD_DETAIL(variables.wordId),
      })
    },
  })
}

// ============ 聊天相关 Hooks ============

/**
 * 获取聊天历史
 */
export const useChatHistory = (sessionId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.CHAT_HISTORY(sessionId),
    queryFn: () => chatApi.getChatHistory(sessionId),
    enabled: !!sessionId,
    staleTime: 2 * 60 * 1000, // 2分钟内认为数据是新鲜的
  })
}

/**
 * 发送聊天消息
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      sessionId,
      content,
      type,
    }: {
      sessionId: string
      content: string
      type: 'text' | 'voice'
    }) => chatApi.sendMessage({ sessionId, content, type }),
    onSuccess: (_, { sessionId }) => {
      // 使聊天历史查询失效
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CHAT_HISTORY(sessionId),
      })
    },
  })
}

// ============ 翻译相关 Hooks ============

/**
 * 文本翻译
 */
export const useTranslateText = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      text,
      from,
      to,
    }: {
      text: string
      from: string
      to: string
    }) => translateApi.translateText(text, from, to),
    onSuccess: () => {
      // 使翻译历史查询失效
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TRANSLATION_HISTORY,
      })
    },
  })
}

/**
 * 获取翻译历史
 */
export const useTranslationHistory = () => {
  return useQuery({
    queryKey: QUERY_KEYS.TRANSLATION_HISTORY,
    queryFn: () => translateApi.getTranslationHistory(),
    staleTime: 5 * 60 * 1000, // 5分钟内认为数据是新鲜的
  })
}

// ============ 照片故事相关 Hooks ============

/**
 * 生成照片故事
 */
export const useGeneratePhotoStory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imageUrl: string) => photoStoryApi.generateStory(imageUrl),
    onSuccess: () => {
      // 使照片故事列表查询失效
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PHOTO_STORIES,
      })
    },
  })
}

/**
 * 获取照片故事列表
 */
export const usePhotoStories = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PHOTO_STORIES,
    queryFn: () => photoStoryApi.getPhotoStories(),
    staleTime: 10 * 60 * 1000, // 10分钟内认为数据是新鲜的
  })
}

// ============ 通用工具 Hooks ============

/**
 * 预取数据的 Hook
 */
export const usePrefetchData = () => {
  const queryClient = useQueryClient()

  const prefetchUserData = (userId?: string) => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.USER_PROFILE(userId),
      queryFn: () => userApi.getUserInfo(),
    })

    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.USER_STATS,
      queryFn: () => userApi.getStudyStats(),
    })
  }

  const prefetchTopics = () => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.TOPICS,
      queryFn: () => topicApi.getTopics({}),
    })
  }

  const prefetchHotTopics = () => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.HOT_TOPICS,
      queryFn: () => topicApi.getHotTopics({}),
    })
  }

  const prefetchCustomTopics = () => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.CUSTOM_TOPICS,
      queryFn: () => topicApi.getCustomTopics(),
    })
  }

  const prefetchVocabularies = (level?: string) => {
    queryClient.prefetchQuery({
      queryKey: [...QUERY_KEYS.VOCABULARIES, { level }],
      queryFn: () => vocabularyApi.getVocabularies({ level }),
    })
  }

  return {
    prefetchUserData,
    prefetchTopics,
    prefetchHotTopics,
    prefetchCustomTopics,
    prefetchVocabularies,
  }
}

// ============ 错误处理工具 ============

/**
 * 统一的错误处理函数
 */
export const handleApiError = (
  error: unknown,
  options?: {
    context?: string
    showToast?: boolean
    defaultMessage?: string
  }
) => {
  const {
    context = '',
    showToast = true,
    defaultMessage = '操作失败，请重试',
  } = options || {}

  let errorMessage = defaultMessage

  // 解析错误信息
  if (error && typeof error === 'object') {
    const err = error as {
      message?: string
      response?: { data?: { message?: string } }
    }
    if (err.message) {
      errorMessage = err.message
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message
    }
  }

  // 记录错误日志
  console.error(`API Error ${context ? `[${context}]` : ''}:`, error)

  // 显示错误提示
  if (showToast) {
    Taro.showToast({
      title: errorMessage,
      icon: 'error',
      duration: 2000,
    })
  }

  return errorMessage
}

/**
 * 创建带错误处理的 mutation 配置（工厂函数）
 */
export const createMutationOptions = <T, K>(
  mutationFn: (params: K) => Promise<T>,
  options?: {
    onSuccessMessage?: string
    onErrorMessage?: string
    context?: string
    invalidateQueries?: string[][]
  }
) => {
  return (queryClient: ReturnType<typeof useQueryClient>) => ({
    mutationFn,
    onSuccess: () => {
      if (options?.onSuccessMessage) {
        Taro.showToast({
          title: options.onSuccessMessage,
          icon: 'success',
        })
      }
      // 使指定查询失效
      options?.invalidateQueries?.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey })
      })
    },
    onError: (error: unknown) => {
      handleApiError(error, {
        context: options?.context,
        defaultMessage: options?.onErrorMessage,
      })
    },
  })
}

/**
 * 网络状态检查 hook
 */
export const useNetworkStatus = () => {
  return {
    isOnline:
      typeof window !== 'undefined' && 'navigator' in window
        ? window.navigator.onLine
        : true,
    // 可以扩展更多网络状态检查
  }
}

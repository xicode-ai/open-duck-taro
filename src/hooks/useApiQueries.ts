import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  userApi,
  chatApi,
  topicApi,
  vocabularyApi,
  translateApi,
  photoStoryApi,
} from '@/services/api'
import type { User } from '@/types'

// Query Keys 常量
export const QUERY_KEYS = {
  // 用户相关
  USER: ['user'] as const,
  USER_PROFILE: (userId?: string) => ['user', 'profile', userId] as const,
  USER_STATS: ['user', 'stats'] as const,

  // 话题相关
  TOPICS: ['topics'] as const,
  TOPIC_DETAIL: (topicId: string) => ['topics', 'detail', topicId] as const,
  TOPIC_DIALOGUES: (topicId: string) =>
    ['topics', 'dialogues', topicId] as const,

  // 词汇相关
  VOCABULARIES: ['vocabularies'] as const,
  VOCABULARY_BY_LEVEL: (level: string) =>
    ['vocabularies', 'level', level] as const,
  VOCABULARY_PROGRESS: (userId: string) =>
    ['vocabularies', 'progress', userId] as const,

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
 * 获取用户信息
 */
export const useUserInfo = () => {
  return useQuery({
    queryKey: QUERY_KEYS.USER_PROFILE(),
    queryFn: async () => {
      const response = await userApi.getUserInfo()
      return response.data
    },
    staleTime: 10 * 60 * 1000, // 10分钟内认为数据是新鲜的
  })
}

/**
 * 获取用户学习统计
 */
export const useUserStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.USER_STATS,
    queryFn: async () => {
      const response = await userApi.getStudyStats()
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5分钟内认为数据是新鲜的
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
 * 切换话题收藏
 */
export const useToggleTopicFavorite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (topicId: string) => topicApi.toggleFavorite(topicId),
    onSuccess: (data, topicId) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TOPIC_DIALOGUES(topicId),
      })
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

  const prefetchVocabularies = (level?: string) => {
    queryClient.prefetchQuery({
      queryKey: [...QUERY_KEYS.VOCABULARIES, { level }],
      queryFn: () => vocabularyApi.getVocabularies({ level }),
    })
  }

  return {
    prefetchUserData,
    prefetchTopics,
    prefetchVocabularies,
  }
}

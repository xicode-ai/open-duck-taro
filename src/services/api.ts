import httpClient from './http'
import type {
  User,
  Topic,
  Vocabulary,
  TranslationResult,
  TranslateHistoryItem,
  PhotoStory,
  TopicDialogueDetail,
  RecordingResult,
  DialogueProgress,
  LearningStage,
  StudyNote,
  WordStudyItem,
  WordStudyRecord,
  WordKnowledgeLevel,
  DailyStudyProgress,
  WordStudyHistoryResponse,
  LearningProgress,
  DailyOverview,
  WeeklyProgress,
  StudyStatistics,
} from '@/types'

// 用户相关API
export const userApi = {
  // 用户登录
  login: (code: string) =>
    httpClient.post<User>('/auth/login', { code }, { showLoading: true }),

  // 获取用户信息
  getUserInfo: () => httpClient.get<User>('/user/profile', { cache: true }),

  // 更新用户信息
  updateUserInfo: (userInfo: Partial<User>) =>
    httpClient.put<User>('/user/profile', userInfo, { showLoading: true }),

  // 获取学习统计
  getStudyStats: () =>
    httpClient.get<{
      totalStudyDays: number
      totalPoints: number
      currentStreak: number
      totalConversations: number
      totalWords: number
      totalMinutes: number
    }>('/api/user/stats', { cache: true }),
}

// 聊天相关API
export const chatApi = {
  // 获取AI助手信息
  getAssistant: (id: string) =>
    httpClient.get(`/chat/assistant/${id}`, { cache: true }),

  // 获取聊天历史
  getChatHistory: (sessionId: string) =>
    httpClient.get(`/chat/history/${sessionId}`, { cache: true }),

  // 发送消息
  sendMessage: (params: {
    sessionId: string
    content: string
    type: 'text' | 'voice'
    audioUrl?: string
    duration?: number
  }) =>
    httpClient.post('/chat/send', params, {
      showLoading: true,
    }),

  // 语音转文字
  speechToText: (audioFile: FormData) =>
    httpClient.post('/chat/speech-to-text', audioFile, {
      showLoading: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // 文字转语音
  textToSpeech: (text: string, voice?: string) =>
    httpClient.post(
      '/chat/text-to-speech',
      { text, voice },
      {
        showLoading: true,
      }
    ),

  // 翻译消息
  translateMessage: (text: string, from?: string, to?: string) =>
    httpClient.post(
      '/chat/translate',
      { text, from, to },
      {
        showLoading: true,
      }
    ),

  // 获取纠错和帮助
  getCorrection: (text: string, context?: string) =>
    httpClient.post(
      '/chat/correction',
      { text, context },
      {
        showLoading: true,
      }
    ),

  // 发送表情反馈
  sendFeedback: (messageId: string, emoji: string, sessionId: string) =>
    httpClient.post('/chat/feedback', { messageId, emoji, sessionId }),

  // 获取AI状态
  getAssistantStatus: (id: string) =>
    httpClient.get(`/chat/assistant-status/${id}`),

  // 获取推荐话题
  getSuggestedTopics: () =>
    httpClient.get('/chat/suggested-topics', { cache: true }),

  // 获取话题分类和话题列表
  getTopicCategories: () =>
    httpClient.get('/chat/topic-categories', { cache: true }),

  // 选择话题并开始对话
  selectTopic: (topic: string, category: string) =>
    httpClient.post(
      '/chat/select-topic',
      { topic, category },
      { showLoading: true }
    ),

  // 获取特定分类的话题列表
  getTopicsByCategory: (categoryId: string) =>
    httpClient.get(`/chat/topics/${categoryId}`, { cache: true }),

  // 获取话题详情
  getTopicDetail: (topicId: string) =>
    httpClient.get(`/chat/topic-detail/${topicId}`, { cache: true }),

  // 获取随机话题
  getRandomTopic: (category?: string) => {
    const url = category
      ? `/chat/random-topic?category=${category}`
      : '/chat/random-topic'
    return httpClient.get(url, { cache: false })
  },

  // 获取话题统计信息
  getTopicStats: () => httpClient.get('/chat/topic-stats', { cache: true }),

  // 获取翻译详情
  getTranslationDetail: (
    messageId: string,
    content: string,
    messageType: 'user' | 'ai'
  ) =>
    httpClient.post(
      '/chat/translation-detail',
      { messageId, content, messageType },
      { showLoading: true }
    ),

  // 获取求助建议
  getHelpSuggestion: (messageId: string, content: string) =>
    httpClient.post(
      '/chat/help-suggestion',
      { messageId, content },
      { showLoading: true }
    ),
}

// 话题相关API
export const topicApi = {
  // 获取热门话题列表
  getHotTopics: (params?: { category?: string; level?: string }) => {
    const searchParams = new URLSearchParams({
      ...(params?.category && { category: params.category }),
      ...(params?.level && { level: params.level }),
    })
    return httpClient.get<Topic[]>(`/api/topics/hot?${searchParams}`, {
      cache: true,
    })
  },

  // 获取话题列表（兼容旧接口）
  getTopics: (params?: { category?: string; level?: string }) => {
    const searchParams = new URLSearchParams({
      ...(params?.category && { category: params.category }),
      ...(params?.level && { level: params.level }),
    })
    return httpClient.get<Topic[]>(`/api/topics?${searchParams}`, {
      cache: true,
    })
  },

  // 获取自定义话题列表
  getCustomTopics: () =>
    httpClient.get<
      {
        id: string
        title: string
        description: string
        icon: string
        conversations: number
        created: string
        isCustom: boolean
      }[]
    >('/api/topics/custom', { cache: true }),

  // 创建自定义话题
  createCustomTopic: (data: {
    title: string
    description?: string
    icon: string
  }) => httpClient.post('/api/topics/custom', data, { showLoading: true }),

  // 更新自定义话题
  updateCustomTopic: (topicId: string, data: { title: string; icon: string }) =>
    httpClient.put(`/api/topics/custom/${topicId}`, data, {
      showLoading: true,
    }),

  // 删除自定义话题
  deleteCustomTopic: (topicId: string) =>
    httpClient.delete(`/api/topics/custom/${topicId}`, { showLoading: true }),

  // 获取学习进度
  getTopicProgress: () =>
    httpClient.get<
      {
        topicId: string
        title: string
        icon: string
        completedDialogues: number
        totalDialogues: number
        progress: number
      }[]
    >('/api/topics/progress', { cache: true }),

  // 获取话题详情
  getTopicDetail: (topicId: string) =>
    httpClient.get<Topic>(`/api/topics/${topicId}`, { cache: true }),

  // 获取话题对话内容
  getTopicDialogues: (topicId: string) =>
    httpClient.get<unknown>(`/api/topics/${topicId}/dialogues`, {
      cache: true,
    }),

  // 获取话题对话详情
  getTopicDialogueDetail: (topicId: string) =>
    httpClient.get<TopicDialogueDetail>(`/api/topics/${topicId}/dialogue`),

  // 录音跟读
  recordDialogue: (
    topicId: string,
    data: { dialogueId: string; audioBlob: string; duration: number }
  ) => httpClient.post<RecordingResult>(`/api/topics/${topicId}/record`, data),

  // 获取系统回答
  getSystemResponse: (topicId: string, currentDialogueId: string) =>
    httpClient.post<{
      hasResponse: boolean
      aiResponse?: {
        id: string
        english: string
        chinese: string
        speakerName: string
        audioUrl?: string
        duration?: number
      }
      message?: string
    }>(`/api/topics/${topicId}/system-response`, { currentDialogueId }),

  // 下一个对话
  nextDialogue: (topicId: string) =>
    httpClient.post<DialogueProgress>(`/api/topics/${topicId}/next-dialogue`),

  // 重置练习
  resetPractice: (topicId: string) =>
    httpClient.post<TopicDialogueDetail>(`/api/topics/${topicId}/reset`),

  // 切换收藏
  toggleFavorite: (topicId: string) =>
    httpClient.post<{ topicId: string; isFavorited: boolean }>(
      `/api/topics/${topicId}/favorite`
    ),

  // 切换参考答案
  toggleReferenceAnswer: (topicId: string, dialogueId: string) =>
    httpClient.post<{ dialogueId: string; showReference: boolean }>(
      `/api/topics/${topicId}/toggle-reference`,
      { dialogueId }
    ),

  // 获取推荐话题
  getRecommendedTopics: (userId: string) =>
    httpClient.get<Topic[]>(`/api/topics/recommended/${userId}`, {
      cache: true,
    }),
}

// 翻译相关API
export const translateApi = {
  // 文本翻译
  translateText: (text: string, from = 'zh', to = 'en') =>
    httpClient.post<TranslationResult>(
      '/api/translate',
      { text, from, to },
      { showLoading: true }
    ),

  // 文本翻译（别名，保持兼容性）
  translate: (text: string, from = 'zh', to = 'en') =>
    httpClient.post<TranslationResult>(
      '/api/translate',
      { text, from, to },
      { showLoading: true }
    ),

  // 获取翻译历史（分页）
  getTranslationHistory: (page = 1, pageSize = 20, type = 'all') => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      type,
    })
    return httpClient.get<{
      list: TranslateHistoryItem[]
      total: number
      page: number
      pageSize: number
      hasMore?: boolean
    }>(`/api/translate/history?${params.toString()}`, {
      cache: false,
    })
  },

  // 获取收藏历史
  getFavoriteHistory: (page = 1, pageSize = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    })
    return httpClient.get<{
      list: TranslateHistoryItem[]
      total: number
      page: number
      pageSize: number
      hasMore?: boolean
    }>(`/api/translate/favorites?${params.toString()}`, {
      cache: false,
    })
  },

  // 切换收藏状态
  toggleFavorite: (id: string, isFavorited: boolean) =>
    httpClient.post<{ id: string; isFavorited: boolean }>(
      '/api/translate/favorite/toggle',
      { id, isFavorited },
      { showLoading: false }
    ),

  // 删除翻译历史
  deleteTranslationHistory: (id: string) =>
    httpClient.delete(`/api/translate/history/${id}`, { showLoading: true }),

  // 清空翻译历史
  clearTranslationHistory: () =>
    httpClient.delete('/api/translate/history', { showLoading: true }),

  // 清空翻译历史（只清空历史，保留收藏）
  clearTranslationHistoryOnly: () =>
    httpClient.delete('/api/translate/history?type=history', {
      showLoading: true,
    }),

  // 清空收藏记录
  clearFavorites: () =>
    httpClient.delete('/api/translate/favorites', { showLoading: true }),
}

// 拍照短文相关API
export const photoStoryApi = {
  // 生成短文
  generateStory: (imageUrl: string, prompt?: string) =>
    httpClient.post<PhotoStory>(
      '/photo-story/generate',
      { imageUrl, prompt },
      { showLoading: true }
    ),

  // 获取短文历史
  getPhotoStories: () =>
    httpClient.get<PhotoStory[]>('/photo-story/history', { cache: true }),

  // 获取短文历史（别名，保持兼容性）
  getStoryHistory: () =>
    httpClient.get<PhotoStory[]>('/photo-story/history', { cache: true }),

  // 删除短文
  deleteStory: (id: string) =>
    httpClient.delete(`/photo-story/${id}`, { showLoading: true }),
}

// 单词相关API
export const vocabularyApi = {
  // 获取单词列表
  getVocabularies: (params?: {
    level?: string
    category?: string
    page?: number
    size?: number
  }) => {
    const searchParams = new URLSearchParams({
      ...(params?.level && { level: params.level }),
      ...(params?.category && { category: params.category }),
      page: (params?.page || 1).toString(),
      size: (params?.size || 20).toString(),
    })
    return httpClient.get<{
      words: Vocabulary[]
      total: number
      hasMore: boolean
    }>(`/vocabulary?${searchParams}`, { cache: true })
  },

  // 获取按级别分组的词汇
  getVocabulariesByLevel: (level: string) =>
    httpClient.get<Vocabulary[]>(`/vocabulary/level/${level}`, { cache: true }),

  // 获取词汇学习进度
  getVocabularyProgress: (userId: string) =>
    httpClient.get<unknown>(`/vocabulary/progress/${userId}`, { cache: true }),

  // 更新词汇学习进度
  updateVocabularyProgress: (wordId: string, progress: number) =>
    httpClient.post(
      `/vocabulary/${wordId}/progress`,
      { progress },
      { showLoading: true }
    ),

  // 获取单词详情
  getWordDetail: (wordId: string) =>
    httpClient.get<Vocabulary>(`/vocabulary/${wordId}`, { cache: true }),

  // 标记单词为已学
  markAsStudied: (wordId: string) =>
    httpClient.post(`/vocabulary/${wordId}/studied`, null, {
      showLoading: true,
    }),

  // 添加到收藏
  addToFavorites: (wordId: string) =>
    httpClient.post(`/vocabulary/${wordId}/favorite`, null, {
      showLoading: true,
    }),

  // 从收藏移除
  removeFromFavorites: (wordId: string) =>
    httpClient.delete(`/vocabulary/${wordId}/favorite`, { showLoading: true }),

  // 获取学习阶段列表
  getLearningStages: () =>
    httpClient.get<LearningStage[]>('/api/vocabulary/stages', { cache: true }),

  // 获取学习说明
  getStudyNotes: () =>
    httpClient.get<StudyNote[]>('/api/vocabulary/study-notes', { cache: true }),

  // ===== 新增：单词学习相关API =====

  // 获取单词学习列表（根据阶段）
  getStudyWordsByStage: (stage: string) =>
    httpClient.get<{
      stage: string
      words: WordStudyItem[]
      totalWords: number
      remainingWords: number
    }>(`/api/vocabulary/study-words/${stage}`, { cache: false }),

  // 获取单个学习单词详情
  getStudyWordDetail: (wordId: string) =>
    httpClient.get<WordStudyItem>(`/api/vocabulary/study-word/${wordId}`, {
      cache: true,
    }),

  // 提交单词学习记录
  submitStudyRecord: (params: {
    wordId: string
    knowledgeLevel: WordKnowledgeLevel
    stage: string
    responseTime?: number
  }) =>
    httpClient.post<{
      record: WordStudyRecord
      pointsEarned: number
      nextWord: WordStudyItem | null
    }>('/api/vocabulary/study-record', params, { showLoading: false }),

  // 获取学习历史记录（分页）
  getStudyHistory: (params?: {
    page?: number
    pageSize?: number
    type?: 'all' | 'favorites'
    knowledgeLevel?: 'all' | 'known' | 'vague' | 'unknown'
  }) => {
    const searchParams = new URLSearchParams({
      page: (params?.page || 1).toString(),
      pageSize: (params?.pageSize || 10).toString(),
      ...(params?.type && { type: params.type }),
      ...(params?.knowledgeLevel && { knowledgeLevel: params.knowledgeLevel }),
    })
    return httpClient.get<WordStudyHistoryResponse>(
      `/api/vocabulary/study-history?${searchParams}`,
      { cache: false }
    )
  },

  // 获取今日学习进度
  getDailyProgress: (date?: string) => {
    const params = date ? `?date=${date}` : ''
    return httpClient.get<DailyStudyProgress>(
      `/api/vocabulary/daily-progress${params}`,
      { cache: false }
    )
  },

  // 切换单词收藏状态
  toggleWordFavorite: (wordId: string, isFavorited: boolean) =>
    httpClient.post<{
      wordId: string
      isFavorited: boolean
    }>(
      '/api/vocabulary/toggle-favorite',
      { wordId, isFavorited },
      { showLoading: false }
    ),

  // 获取收藏单词列表
  getFavoriteWords: (params?: { page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams({
      page: (params?.page || 1).toString(),
      pageSize: (params?.pageSize || 10).toString(),
    })
    return httpClient.get<{
      list: WordStudyItem[]
      total: number
      page: number
      pageSize: number
      hasMore: boolean
    }>(`/api/vocabulary/favorites?${searchParams}`, { cache: false })
  },

  // 更新单词认识度
  updateWordKnowledgeLevel: (
    wordId: string,
    knowledgeLevel: WordKnowledgeLevel
  ) =>
    httpClient.post<{
      wordId: string
      knowledgeLevel: WordKnowledgeLevel
      updatedRecords: number
    }>(
      '/api/vocabulary/update-knowledge-level',
      { wordId, knowledgeLevel },
      { showLoading: false }
    ),
}

// 发音评分相关API
export const pronunciationApi = {
  // 提交发音评分
  submitPronunciation: (audioFile: File, text: string) => {
    const formData = new FormData()
    formData.append('audio', audioFile)
    formData.append('text', text)

    return httpClient.request<{
      score: number
      accuracy: number
      fluency: number
      completeness: number
      feedback: string
    }>({
      url: '/pronunciation/score',
      method: 'POST',
      body: formData,
      showLoading: true,
    })
  },
}

// 会员相关API
export const membershipApi = {
  // 获取会员信息
  getMembershipInfo: () =>
    httpClient.get<{
      level: 'free' | 'basic' | 'pro' | 'premium'
      expireDate: string
      features: string[]
      price: number
    }>('/membership/info', { cache: true }),

  // 购买会员
  purchaseMembership: (plan: string, paymentMethod: string) =>
    httpClient.post<{
      orderId: string
      paymentUrl: string
    }>('/membership/purchase', { plan, paymentMethod }, { showLoading: true }),

  // 获取会员权益
  getMembershipBenefits: () =>
    httpClient.get<{
      free: string[]
      basic: string[]
      pro: string[]
      premium: string[]
    }>('/membership/benefits', { cache: true }),
}

// 导出话题相关API（别名，保持命名一致性）
export const topicsApi = {
  getHotTopics: topicApi.getHotTopics,
  getCustomTopics: topicApi.getCustomTopics,
  createCustomTopic: topicApi.createCustomTopic,
  updateCustomTopic: topicApi.updateCustomTopic,
  deleteCustomTopic: topicApi.deleteCustomTopic,
  getTopicsProgress: topicApi.getTopicProgress,
  getTopicDetail: topicApi.getTopicDetail,
}

// 学习进度相关API
export const progressApi = {
  // 获取学习进度数据
  getLearningProgress: () =>
    httpClient.get<LearningProgress>('/api/progress/learning', {
      cache: false,
    }),

  // 获取今日概览
  getDailyOverview: (date?: string) => {
    const params = date ? `?date=${date}` : ''
    return httpClient.get<DailyOverview>(
      `/api/progress/daily-overview${params}`,
      { cache: false }
    )
  },

  // 获取本周进度
  getWeeklyProgress: (weekNumber?: number) => {
    const params = weekNumber ? `?week=${weekNumber}` : ''
    return httpClient.get<WeeklyProgress>(`/api/progress/weekly${params}`, {
      cache: false,
    })
  },

  // 获取学习统计
  getStudyStatistics: (period?: 'week' | 'month' | 'year') => {
    const params = period ? `?period=${period}` : ''
    return httpClient.get<StudyStatistics>(
      `/api/progress/statistics${params}`,
      { cache: false }
    )
  },

  // 更新学习活动（用于记录学习行为）
  updateStudyActivity: (activity: {
    type: 'chat' | 'topic' | 'vocabulary' | 'translate' | 'photo'
    duration: number
    details?: Record<string, unknown>
  }) =>
    httpClient.post<{ success: boolean; pointsEarned?: number }>(
      '/api/progress/activity',
      activity
    ),

  // 获取学习建议
  getStudySuggestion: () =>
    httpClient.get<{
      title: string
      description: string
      type: 'chat' | 'topic' | 'vocabulary' | 'translate' | 'photo'
      priority: 'high' | 'medium' | 'low'
    }>('/api/progress/suggestion', { cache: false }),

  // 获取学习排行榜
  getLeaderboard: (type: 'daily' | 'weekly' | 'monthly' = 'weekly') =>
    httpClient.get<{
      rank: number
      totalUsers: number
      users: Array<{
        rank: number
        userId: string
        nickname: string
        avatar?: string
        score: number
        studyTime: number
      }>
    }>(`/api/progress/leaderboard?type=${type}`, { cache: true }),
}

// 导出所有API
export default {
  user: userApi,
  chat: chatApi,
  topic: topicApi,
  topics: topicsApi,
  translate: translateApi,
  photoStory: photoStoryApi,
  vocabulary: vocabularyApi,
  pronunciation: pronunciationApi,
  membership: membershipApi,
  progress: progressApi,
}

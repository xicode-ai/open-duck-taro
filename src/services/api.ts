import httpClient from './http'
import type {
  User,
  Topic,
  Vocabulary,
  TranslationResult,
  PhotoStory,
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
    }>('/user/stats', { cache: true }),
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
  // 获取话题列表
  getTopics: (params?: { category?: string; level?: string }) => {
    const searchParams = new URLSearchParams({
      ...(params?.category && { category: params.category }),
      ...(params?.level && { level: params.level }),
    })
    return httpClient.get<Topic[]>(`/topics?${searchParams}`, { cache: true })
  },

  // 获取话题详情
  getTopicDetail: (topicId: string) =>
    httpClient.get<Topic>(`/topics/${topicId}`, { cache: true }),

  // 获取话题对话内容
  getTopicDialogues: (topicId: string) =>
    httpClient.get<unknown>(`/topics/${topicId}/dialogues`, { cache: true }),

  // 获取推荐话题
  getRecommendedTopics: (userId: string) =>
    httpClient.get<Topic[]>(`/topics/recommended/${userId}`, { cache: true }),
}

// 翻译相关API
export const translateApi = {
  // 文本翻译
  translateText: (text: string, from = 'zh', to = 'en') =>
    httpClient.post<TranslationResult>(
      '/translate',
      { text, from, to },
      { showLoading: true }
    ),

  // 文本翻译（别名，保持兼容性）
  translate: (text: string, from = 'zh', to = 'en') =>
    httpClient.post<TranslationResult>(
      '/translate',
      { text, from, to },
      { showLoading: true }
    ),

  // 获取翻译历史
  getTranslationHistory: () =>
    httpClient.get<TranslationResult[]>('/translate/history', { cache: true }),

  // 删除翻译历史
  deleteTranslationHistory: (id: string) =>
    httpClient.delete(`/translate/history/${id}`, { showLoading: true }),
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

// 导出所有API
export default {
  user: userApi,
  chat: chatApi,
  topic: topicApi,
  translate: translateApi,
  photoStory: photoStoryApi,
  vocabulary: vocabularyApi,
  pronunciation: pronunciationApi,
  membership: membershipApi,
}

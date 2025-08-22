import httpClient from './http'
import type {
  User,
  ChatMessage,
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
    }>('/user/stats', { cache: true }),
}

// 聊天相关API
export const chatApi = {
  // 发送消息
  sendMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) =>
    httpClient.post<ChatMessage>('/chat/message', message, {
      showLoading: true,
    }),

  // 获取聊天历史
  getChatHistory: (chatId: string) =>
    httpClient.get<ChatMessage[]>(`/chat/history/${chatId}`, { cache: true }),

  // 获取AI回复
  getAIResponse: (message: string, context?: string) =>
    httpClient.post<{
      reply: string
      translation?: string
      suggestions?: string[]
    }>('/chat/ai-response', { message, context }, { showLoading: true }),
}

// 话题相关API
export const topicApi = {
  // 获取话题列表
  getTopics: (category?: string, level?: string) => {
    const params = new URLSearchParams({
      ...(category && { category }),
      ...(level && { level }),
    })
    return httpClient.get<Topic[]>(`/topics?${params}`, { cache: true })
  },

  // 获取话题详情
  getTopicDetail: (topicId: string) =>
    httpClient.get<Topic>(`/topics/${topicId}`, { cache: true }),

  // 获取推荐话题
  getRecommendedTopics: (userId: string) =>
    httpClient.get<Topic[]>(`/topics/recommended/${userId}`, { cache: true }),
}

// 翻译相关API
export const translateApi = {
  // 文本翻译
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
  generateStory: (imageFile: File, prompt?: string) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    if (prompt) {
      formData.append('prompt', prompt)
    }

    return httpClient.request<PhotoStory>({
      url: '/photo-story/generate',
      method: 'POST',
      body: formData,
      showLoading: true,
    })
  },

  // 获取短文历史
  getStoryHistory: () =>
    httpClient.get<PhotoStory[]>('/photo-story/history', { cache: true }),

  // 删除短文
  deleteStory: (id: string) =>
    httpClient.delete(`/photo-story/${id}`, { showLoading: true }),
}

// 单词相关API
export const vocabularyApi = {
  // 获取单词列表
  getVocabularies: (level: string, page = 1, size = 20) => {
    const params = new URLSearchParams({
      level,
      page: page.toString(),
      size: size.toString(),
    })
    return httpClient.get<{
      words: Vocabulary[]
      total: number
      hasMore: boolean
    }>(`/vocabulary?${params}`, { cache: true })
  },

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

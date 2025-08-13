import Taro from '@tarojs/taro'
import type {
  ApiResponse,
  User,
  ChatMessage,
  Topic,
  Vocabulary,
  TranslationResult,
  PhotoStory,
} from '@/types'

// API基础配置
const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.openduck.com'
    : 'https://dev-api.openduck.com'

// 请求拦截器
const request = async <T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = Taro.getStorageSync('token')

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    // 使用Taro的日志系统替代console
    Taro.showToast({ title: '网络请求失败', icon: 'error' })
    throw error
  }
}

// 用户相关API
export const userApi = {
  // 用户登录
  login: (code: string) =>
    request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  // 获取用户信息
  getUserInfo: () => request<User>('/user/profile'),

  // 更新用户信息
  updateUserInfo: (userInfo: Partial<User>) =>
    request<User>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userInfo),
    }),

  // 获取学习统计
  getStudyStats: () =>
    request<{
      totalStudyDays: number
      totalPoints: number
      currentStreak: number
      totalConversations: number
      totalWords: number
    }>('/user/stats'),
}

// 聊天相关API
export const chatApi = {
  // 发送消息
  sendMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) =>
    request<ChatMessage>('/chat/message', {
      method: 'POST',
      body: JSON.stringify(message),
    }),

  // 获取聊天历史
  getChatHistory: (chatId: string) => request<ChatMessage[]>(`/chat/history/${chatId}`),

  // 获取AI回复
  getAIResponse: (message: string, context?: string) =>
    request<{
      reply: string
      translation?: string
      suggestions?: string[]
    }>('/chat/ai-response', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    }),
}

// 话题相关API
export const topicApi = {
  // 获取话题列表
  getTopics: (category?: string, level?: string) =>
    request<Topic[]>(
      `/topics?${new URLSearchParams({
        ...(category && { category }),
        ...(level && { level }),
      })}`
    ),

  // 获取话题详情
  getTopicDetail: (topicId: string) => request<Topic>(`/topics/${topicId}`),

  // 获取推荐话题
  getRecommendedTopics: (userId: string) => request<Topic[]>(`/topics/recommended/${userId}`),
}

// 翻译相关API
export const translateApi = {
  // 文本翻译
  translate: (text: string, from = 'zh', to = 'en') =>
    request<TranslationResult>('/translate', {
      method: 'POST',
      body: JSON.stringify({ text, from, to }),
    }),

  // 获取翻译历史
  getTranslationHistory: () => request<TranslationResult[]>('/translate/history'),

  // 删除翻译历史
  deleteTranslationHistory: (id: string) =>
    request(`/translate/history/${id}`, {
      method: 'DELETE',
    }),
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

    return request<PhotoStory>('/photo-story/generate', {
      method: 'POST',
      body: formData,
      headers: {
        // 移除Content-Type，让浏览器自动设置multipart/form-data
      },
    })
  },

  // 获取短文历史
  getStoryHistory: () => request<PhotoStory[]>('/photo-story/history'),

  // 删除短文
  deleteStory: (id: string) =>
    request(`/photo-story/${id}`, {
      method: 'DELETE',
    }),
}

// 单词相关API
export const vocabularyApi = {
  // 获取单词列表
  getVocabularies: (level: string, page = 1, size = 20) =>
    request<{
      words: Vocabulary[]
      total: number
      hasMore: boolean
    }>(`/vocabulary?level=${level}&page=${page}&size=${size}`),

  // 获取单词详情
  getWordDetail: (wordId: string) => request<Vocabulary>(`/vocabulary/${wordId}`),

  // 标记单词为已学
  markAsStudied: (wordId: string) =>
    request(`/vocabulary/${wordId}/studied`, {
      method: 'POST',
    }),

  // 添加到收藏
  addToFavorites: (wordId: string) =>
    request(`/vocabulary/${wordId}/favorite`, {
      method: 'POST',
    }),

  // 从收藏移除
  removeFromFavorites: (wordId: string) =>
    request(`/vocabulary/${wordId}/favorite`, {
      method: 'DELETE',
    }),
}

// 发音评分相关API
export const pronunciationApi = {
  // 提交发音评分
  submitPronunciation: (audioFile: File, text: string) => {
    const formData = new FormData()
    formData.append('audio', audioFile)
    formData.append('text', text)

    return request<{
      score: number
      accuracy: number
      fluency: number
      completeness: number
      feedback: string
    }>('/pronunciation/score', {
      method: 'POST',
      body: formData,
      headers: {
        // 移除Content-Type，让浏览器自动设置multipart/form-data
      },
    })
  },
}

// 会员相关API
export const membershipApi = {
  // 获取会员信息
  getMembershipInfo: () =>
    request<{
      level: 'free' | 'basic' | 'pro' | 'premium'
      expireDate: string
      features: string[]
      price: number
    }>('/membership/info'),

  // 购买会员
  purchaseMembership: (plan: string, paymentMethod: string) =>
    request<{
      orderId: string
      paymentUrl: string
    }>('/membership/purchase', {
      method: 'POST',
      body: JSON.stringify({ plan, paymentMethod }),
    }),

  // 获取会员权益
  getMembershipBenefits: () =>
    request<{
      free: string[]
      basic: string[]
      pro: string[]
      premium: string[]
    }>('/membership/benefits'),
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

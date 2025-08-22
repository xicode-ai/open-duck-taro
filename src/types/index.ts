// 用户相关类型
export interface User {
  id: string
  nickname: string
  avatar?: string
  level: UserLevel
  points: number
  studyDays: number
}

export type UserLevel =
  | 'preschool'
  | 'elementary'
  | 'middle'
  | 'high'
  | 'university'
  | 'master'

// 对话相关类型
export interface ChatMessage {
  id: string
  content: string
  type: 'user' | 'ai'
  timestamp: number
  audioUrl?: string
  duration?: number
  translation?: string
  helpContent?: {
    original: string
    corrected: string
  }
}

// 话题相关类型
export interface Topic {
  id: string
  title: string
  description: string
  category: string
  level: UserLevel
  icon: string
  color?: string
  dialogCount?: number
  dialogues: Dialogue[]
}

export interface Dialogue {
  id: string
  speaker: 'A' | 'B'
  english: string
  chinese: string
  audioUrl?: string
}

// 单词相关类型
export interface Vocabulary {
  id: string
  word: string
  pronunciation: {
    us: string
    uk: string
  }
  meaning: string
  partOfSpeech: string
  example: {
    english: string
    chinese: string
  }
  level: UserLevel
  audioUrl?: {
    us: string
    uk: string
  }
}

// 翻译相关类型
export interface TranslationResult {
  original: string
  formal: string
  casual: string
  audioUrl?: string
}

// 拍照短文相关类型
export interface PhotoStory {
  id: string
  imageUrl: string
  story: string
  audioUrl?: string
  createdAt: number
}

// API 响应类型
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// 评分相关类型
export interface PronunciationScore {
  overall: number
  accuracy: number
  fluency: number
  completeness: number
  feedback: string
}

/**
 * MSW相关类型定义
 */

import { PathParams } from 'msw'

// 路径参数类型定义
export interface ChatParams extends PathParams {
  id: string
}

export interface SessionParams extends PathParams {
  sessionId: string
}

export interface TopicParams extends PathParams {
  topicId: string
}

export interface LessonParams extends PathParams {
  topicId: string
  lessonId: string
}

export interface BookParams extends PathParams {
  bookId: string
}

export interface WordParams extends PathParams {
  wordId: string
}

export interface StoryParams extends PathParams {
  storyId: string
}

export interface OrderParams extends PathParams {
  orderId: string
}

export interface TranslateParams extends PathParams {
  id: string
}

// FormData扩展类型
export interface ExtendedFormData extends FormData {
  get(name: string): string | File | null
  getAll(name: string): (string | File)[]
}

// 请求体类型定义
export interface ChatSendBody {
  sessionId: string
  content: string
  type: 'text' | 'voice'
  audioUrl?: string
  duration?: number
}

export interface TranslateBody {
  text: string
  from?: string
  to?: string
  mode?: 'text' | 'voice' | 'image'
}

export interface TopicPracticeBody {
  type: 'speaking' | 'writing' | 'listening'
  content: string
  duration: number
}

export interface ProgressUpdateBody {
  progress: number
  imageId?: string
}

export interface MembershipPurchaseBody {
  planId: string
  paymentMethod: string
  duration?: number
}

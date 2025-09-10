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
  difficulty: 'easy' | 'medium' | 'hard'
  icon: string
  iconClass?: string
  background?: string
  color?: string
  dialogCount?: number
  conversations?: number
  dialogues: Dialogue[]
  isNew?: boolean
  isPopular?: boolean
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
  id: string
  originalText: string
  standardTranslation: string
  colloquialTranslation: string
  comparisonNotes?: Array<{
    id: string
    point: string
    standard: string
    colloquial: string
    explanation: string
  }>
  relatedPhrases: Array<{
    id: string
    chinese: string
    english: string
    pinyin?: string
  }>
  from?: string
  to?: string
  mode?: string
  timestamp?: string
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

// 话题对话详情相关类型
export interface VoiceScore {
  overallScore: number // 总体评分 0-100
  pronunciation: number // 发音准确度 0-100%
  fluency: number // 语音流畅度 0-100%
  naturalness: number // 语调自然度 0-100%
  stars: number // 星级评价 1-5
}

export interface UserRecording {
  audioUrl: string
  duration: number
  transcription: string
  translation?: string // 添加翻译字段
  score: VoiceScore
}

export interface ReferenceAnswer {
  show: boolean
  text: string
}

export interface AIDialogue {
  id: string
  speaker: 'ai'
  speakerName: string
  english: string
  chinese: string
  audioUrl?: string
  duration?: number
}

export interface UserDialogue {
  id: string
  speaker: 'user'
  speakerName: string
  english: string
  chinese: string
  referenceAnswer?: ReferenceAnswer
  userRecording?: UserRecording | null
  completed?: boolean
}

export type TopicDialogue = AIDialogue | UserDialogue

export interface TopicScene {
  location: string
  description: string
}

export interface TopicDialogueDetail {
  id: string
  title: string
  subtitle: string
  scene: TopicScene
  currentDialogueIndex: number
  totalDialogues: number
  progress: number
  isFavorited: boolean
  dialogues: TopicDialogue[]
}

export interface RecordingResult {
  transcription: string
  translation: string
  score: VoiceScore
  feedback: {
    strengths: string[]
    improvements: string[]
  }
}

export interface DialogueProgress {
  currentIndex: number
  progress: number
  isCompleted: boolean
}

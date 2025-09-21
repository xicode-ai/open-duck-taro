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

// 单词学习状态枚举
export type WordKnowledgeLevel = 'unknown' | 'vague' | 'known'

// 单词学习项
export interface WordStudyItem {
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
  difficulty: 'easy' | 'medium' | 'hard'
  tags?: string[]
  stage: string // 学习阶段
  isFavorited?: boolean // 是否收藏
}

// 单词学习记录
export interface WordStudyRecord {
  id: string
  wordId: string
  word: string
  meaning: string
  knowledgeLevel: WordKnowledgeLevel
  studiedAt: string
  stage: string
  isFavorited: boolean
  responseTime?: number // 反应时间（毫秒）
}

// 今日学习进度
export interface DailyStudyProgress {
  date: string
  knownCount: number // 认识的单词数量
  vagueCount: number // 模糊的单词数量
  unknownCount: number // 不认识的单词数量
  totalStudied: number // 总学习数量
  continuousDays: number // 连续学习天数
  targetWords: number // 目标单词数
}

// 单词学习会话
export interface WordStudySession {
  id: string
  stage: string
  currentWordIndex: number
  totalWords: number
  studiedWords: WordStudyRecord[]
  startTime: string
  endTime?: string
  progress: number // 0-100
}

// 单词学习历史分页响应
export interface WordStudyHistoryResponse {
  list: WordStudyRecord[]
  total: number
  page: number
  pageSize: number
  hasMore?: boolean
}

// 学习阶段类型
export interface LearningStage {
  id: string
  name: string
  ageRange: string
  icon: string
  bgColor: string
  isPremium: boolean
  description?: string
  wordCount?: number
}

// 学习说明类型
export interface StudyNote {
  id: string
  icon: string
  text: string
  type: 'info' | 'premium' | 'feature' | 'method'
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

// 翻译历史记录类型
export interface TranslateHistoryItem {
  id: string
  sourceText: string
  standardTranslation: string
  colloquialTranslation: string
  colloquialNotes: string
  timestamp: string
  sourceLanguage: 'zh' | 'en'
  targetLanguage: 'zh' | 'en'
  isFavorited?: boolean
  favoritedAt?: string
  comparisonNotes?: Array<{
    id: string
    point: string
    standard: string
    colloquial: string
    explanation: string
  }>
  relatedPhrases?: Array<{
    id: string
    chinese: string
    english: string
    pinyin?: string
  }>
}

// 翻译历史分页响应
export interface TranslateHistoryResponse {
  list: TranslateHistoryItem[]
  total: number
  page: number
  pageSize: number
  hasMore?: boolean
}

// 拍照短文相关类型
export interface PhotoStory {
  id: string
  imageUrl: string
  imageBase64?: string
  title: string
  titleCn: string
  standardStory: string // 标准短文
  standardStoryCn: string // 标准短文中文翻译
  nativeStory: string // 地道短文
  nativeStoryCn: string // 地道短文中文翻译
  sentences: StoryPractice[] // 练习句子列表
  createdAt: string
  standardScore?: PhotoStoryScore // 标准短文评分
  nativeScore?: PhotoStoryScore // 地道短文评分
  status: 'generating' | 'generated' | 'practicing' | 'completed'
  isFavorite?: boolean // 是否收藏
  favoritedAt?: string // 收藏时间
}

export interface StoryPractice {
  id: string
  sentence: string
  sentenceCn: string
  audioUrl?: string
  score?: number
  practiced: boolean
  order: number
}

export interface PhotoStoryScore {
  overall: number // 总分
  grade: string // 等级 A+, A, B+, B, C+, C
  accuracy: number // 发音准确度
  fluency: number // 流畅度
  speed: number // 语速
  completeness: number // 完整度
  feedback: string // 反馈建议
}

export interface GenerateStoryRequest {
  imageBase64: string
  userId?: string
}

export interface GenerateStoryResponse {
  story: PhotoStory
}

export interface SpeechScoreRequest {
  audioBase64: string
  sentenceId: string
  expectedText: string
}

export interface SpeechScoreResponse {
  score: PhotoStoryScore
  detailScores: {
    words: Array<{
      word: string
      score: number
      feedback?: string
    }>
  }
}

export interface PhotoStoryHistoryParams {
  page: number
  pageSize: number
}

export interface PhotoStoryHistoryResponse {
  items: PhotoStory[]
  hasMore: boolean
  total: number
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

// 学习进度相关类型
export interface DailyOverview {
  date: string
  topicProgress: {
    completed: number
    total: number
    percentage: number
  }
  vocabularyCount: number
  photoStoryCount: number
}

export interface WeeklyProgress {
  weekNumber: number
  days: Array<{
    date: string
    dayOfWeek: string
    dayNumber: string
    isCompleted: boolean
    isToday: boolean
    studyMinutes?: number
  }>
}

export interface StudyStatistics {
  chatCount: number
  topicCount: number
  translateCount: number
  photoStoryCount: number
  vocabularyCount: number
  totalStudyTime: number // 总学习时长（分钟）
}

export interface LearningProgress {
  dailyOverview: DailyOverview
  weeklyProgress: WeeklyProgress
  studyStatistics: StudyStatistics
  suggestion?: {
    title: string
    description: string
    type: 'chat' | 'topic' | 'vocabulary' | 'translate' | 'photo'
    priority: 'high' | 'medium' | 'low'
  }
}

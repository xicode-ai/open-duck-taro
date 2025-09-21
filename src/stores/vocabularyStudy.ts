import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { queryClient } from '@/providers/QueryProvider'
import { QUERY_KEYS } from '@/hooks/useApiQueries'
import type {
  WordStudyItem,
  WordKnowledgeLevel,
  DailyStudyProgress,
  WordStudyRecord,
} from '@/types'

// 背单词学习状态接口
interface VocabularyStudyState {
  // 当前学习会话数据
  currentStage: string
  currentWord: WordStudyItem | null
  currentWordIndex: number
  totalWords: number

  // 学习进度数据
  dailyProgress: DailyStudyProgress | null

  // 学习历史缓存
  studyHistory: WordStudyRecord[]

  // 学习统计
  sessionStats: {
    studiedCount: number
    masteredCount: number
    startTime: string | null
  }

  // Actions
  setCurrentStage: (stage: string) => void
  setCurrentWord: (word: WordStudyItem | null) => void
  setCurrentWordIndex: (index: number) => void
  setTotalWords: (total: number) => void

  // 学习记录提交
  submitStudyRecord: (
    wordId: string,
    knowledgeLevel: WordKnowledgeLevel,
    responseTime?: number
  ) => void

  // 收藏操作
  toggleWordFavorite: (wordId: string, isFavorited: boolean) => void

  // 认识度更新
  updateWordKnowledgeLevel: (
    wordId: string,
    knowledgeLevel: WordKnowledgeLevel
  ) => void

  // 进度数据管理
  setDailyProgress: (progress: DailyStudyProgress) => void
  updateProgressAnimated: (
    field: keyof DailyStudyProgress,
    newValue: number
  ) => void

  // 历史记录管理
  addStudyRecord: (record: WordStudyRecord) => void
  setStudyHistory: (history: WordStudyRecord[]) => void

  // 会话管理
  startStudySession: (stage: string) => void
  endStudySession: () => void
  resetSessionStats: () => void

  // 查询辅助方法
  getCurrentWordProgress: () => number
  isCurrentWordFavorited: () => boolean
  getSessionDuration: () => number
}

// 背单词学习状态管理
export const useVocabularyStudyStore = create<VocabularyStudyState>()(
  persist(
    (set, get) => ({
      // 初始状态
      currentStage: '',
      currentWord: null,
      currentWordIndex: 0,
      totalWords: 0,
      dailyProgress: null,
      studyHistory: [],
      sessionStats: {
        studiedCount: 0,
        masteredCount: 0,
        startTime: null,
      },

      // 设置当前学习阶段
      setCurrentStage: (stage: string) => {
        set({ currentStage: stage })
      },

      // 设置当前单词
      setCurrentWord: (word: WordStudyItem | null) => {
        set({ currentWord: word })
      },

      // 设置当前单词索引
      setCurrentWordIndex: (index: number) => {
        set({ currentWordIndex: index })
      },

      // 设置总单词数
      setTotalWords: (total: number) => {
        set({ totalWords: total })
      },

      // 提交学习记录
      submitStudyRecord: (
        wordId: string,
        knowledgeLevel: WordKnowledgeLevel,
        responseTime?: number
      ) => {
        const state = get()
        const { currentWord, currentStage, sessionStats } = state

        if (!currentWord) return

        // 创建学习记录
        const record: WordStudyRecord = {
          id: `study-${Date.now()}`,
          wordId,
          word: currentWord.word,
          meaning: currentWord.meaning,
          knowledgeLevel,
          studiedAt: new Date().toISOString(),
          stage: currentStage,
          isFavorited: currentWord.isFavorited || false,
          responseTime: responseTime || 0,
        }

        // 更新会话统计
        const newSessionStats = {
          ...sessionStats,
          studiedCount: sessionStats.studiedCount + 1,
          masteredCount:
            sessionStats.masteredCount + (knowledgeLevel === 'known' ? 1 : 0),
        }

        // 更新今日进度
        let updatedDailyProgress = state.dailyProgress
        if (updatedDailyProgress) {
          updatedDailyProgress = {
            ...updatedDailyProgress,
            totalStudied: updatedDailyProgress.totalStudied + 1,
            knownCount:
              updatedDailyProgress.knownCount +
              (knowledgeLevel === 'known' ? 1 : 0),
            vagueCount:
              updatedDailyProgress.vagueCount +
              (knowledgeLevel === 'vague' ? 1 : 0),
            unknownCount:
              updatedDailyProgress.unknownCount +
              (knowledgeLevel === 'unknown' ? 1 : 0),
          }
        }

        set({
          sessionStats: newSessionStats,
          dailyProgress: updatedDailyProgress,
        })

        // 添加到历史记录
        get().addStudyRecord(record)

        // 使相关的 React Query 缓存失效
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.VOCABULARY_DAILY_PROGRESS(),
        })
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.VOCABULARY_STUDY_HISTORY,
        })
        // 使当前单词详情失效
        if (currentWord) {
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.VOCABULARY_STUDY_WORD_DETAIL(currentWord.id),
          })
        }
      },

      // 切换单词收藏状态
      toggleWordFavorite: (wordId: string, isFavorited: boolean) => {
        const { currentWord } = get()

        // 更新当前单词的收藏状态
        if (currentWord && currentWord.id === wordId) {
          set({
            currentWord: {
              ...currentWord,
              isFavorited,
            },
          })
        }

        // 使相关缓存失效
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.VOCABULARY_FAVORITES,
        })
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.VOCABULARY_STUDY_HISTORY,
        })
      },

      // 设置今日学习进度
      setDailyProgress: (progress: DailyStudyProgress) => {
        set({ dailyProgress: progress })
      },

      // 动画更新进度数据
      updateProgressAnimated: (
        field: keyof DailyStudyProgress,
        newValue: number
      ) => {
        const { dailyProgress } = get()
        if (dailyProgress && typeof dailyProgress[field] === 'number') {
          const updatedProgress = {
            ...dailyProgress,
            [field]: newValue,
          }
          set({ dailyProgress: updatedProgress })
        }
      },

      // 添加学习记录
      addStudyRecord: (record: WordStudyRecord) => {
        set(state => ({
          studyHistory: [record, ...state.studyHistory.slice(0, 49)], // 保持最近50条记录
        }))
      },

      // 设置学习历史
      setStudyHistory: (history: WordStudyRecord[]) => {
        set({ studyHistory: history })
      },

      // 开始学习会话
      startStudySession: (stage: string) => {
        set({
          currentStage: stage,
          sessionStats: {
            studiedCount: 0,
            masteredCount: 0,
            startTime: new Date().toISOString(),
          },
        })
      },

      // 结束学习会话
      endStudySession: () => {
        set(state => ({
          sessionStats: {
            ...state.sessionStats,
            startTime: null,
          },
        }))
      },

      // 重置会话统计
      resetSessionStats: () => {
        set({
          sessionStats: {
            studiedCount: 0,
            masteredCount: 0,
            startTime: null,
          },
        })
      },

      // 获取当前单词学习进度
      getCurrentWordProgress: () => {
        const { currentWordIndex, totalWords } = get()
        return totalWords > 0
          ? Math.round((currentWordIndex / totalWords) * 100)
          : 0
      },

      // 检查当前单词是否收藏
      isCurrentWordFavorited: () => {
        const { currentWord } = get()
        return currentWord?.isFavorited || false
      },

      // 获取会话持续时间（分钟）
      getSessionDuration: () => {
        const { sessionStats } = get()
        if (!sessionStats.startTime) return 0

        const startTime = new Date(sessionStats.startTime).getTime()
        const now = Date.now()
        return Math.round((now - startTime) / (1000 * 60))
      },

      // 更新单词认识度
      updateWordKnowledgeLevel: (
        wordId: string,
        knowledgeLevel: WordKnowledgeLevel
      ) => {
        const state = get()

        // 更新历史记录中的认识度
        const updatedHistory = state.studyHistory.map(record =>
          record.wordId === wordId ? { ...record, knowledgeLevel } : record
        )

        set({ studyHistory: updatedHistory })

        // 使相关的 React Query 缓存失效，触发重新获取
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.VOCABULARY_STUDY_HISTORY,
        })
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.VOCABULARY_STUDY_WORD_DETAIL(wordId),
        })
      },
    }),
    {
      name: 'vocabulary-study-storage',
      // 只持久化必要的字段
      partialize: state => ({
        currentStage: state.currentStage,
        studyHistory: state.studyHistory.slice(0, 20), // 只保存最近20条记录到本地存储
        sessionStats: state.sessionStats,
      }),
    }
  )
)

// 导出类型
export type { VocabularyStudyState }

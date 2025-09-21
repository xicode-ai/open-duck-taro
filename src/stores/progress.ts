import { create } from 'zustand'
import type {
  LearningProgress,
  DailyOverview,
  WeeklyProgress,
  StudyStatistics,
} from '@/types'
import { userApi } from '@/services/api'

export interface ProgressState {
  // 数据状态
  learningProgress: LearningProgress | null
  loading: boolean
  error: string | null

  // 操作方法
  fetchLearningProgress: () => Promise<void>
  updateDailyOverview: (overview: DailyOverview) => void
  updateWeeklyProgress: (progress: WeeklyProgress) => void
  updateStudyStatistics: (statistics: StudyStatistics) => void
  clearError: () => void
  reset: () => void
}

const initialState = {
  learningProgress: null,
  loading: false,
  error: null,
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  ...initialState,

  fetchLearningProgress: async () => {
    set({ loading: true, error: null })

    try {
      // 获取今日概览数据
      const dailyOverviewPromise = userApi.getStudyStats().then(stats => ({
        date: new Date().toISOString().split('T')[0],
        topicProgress: {
          completed: stats.data.totalConversations || 0,
          total: 10, // 每日目标对话数
          percentage: Math.min(
            ((stats.data.totalConversations || 0) / 10) * 100,
            100
          ),
        },
        vocabularyCount: stats.data.totalWords || 0,
        photoStoryCount: 3, // 临时数据，需要后端提供
      }))

      // 获取本周进度数据
      const weeklyProgressPromise = Promise.resolve({
        weekNumber: Math.ceil(new Date().getDate() / 7),
        days: generateWeeklyDays(),
      })

      // 获取学习统计数据
      const studyStatsPromise = userApi.getStudyStats().then(stats => ({
        chatCount: stats.data.totalConversations || 0,
        topicCount: 45,
        translateCount: 67,
        photoStoryCount: 23,
        vocabularyCount: stats.data.totalWords || 0,
        totalStudyTime: stats.data.totalMinutes || 0,
      }))

      const [dailyOverview, weeklyProgress, studyStatistics] =
        await Promise.all([
          dailyOverviewPromise,
          weeklyProgressPromise,
          studyStatsPromise,
        ])

      const learningProgress: LearningProgress = {
        dailyOverview,
        weeklyProgress,
        studyStatistics,
        suggestion: {
          title: '今日建议',
          description:
            '你在对话练习方面表现很棒！建议今天多练习一些翻译功能，提升词汇量。',
          type: 'translate',
          priority: 'high',
        },
      }

      set({ learningProgress, loading: false })
    } catch (error) {
      console.error('获取学习进度失败:', error)
      set({
        error: error instanceof Error ? error.message : '获取学习进度失败',
        loading: false,
      })
    }
  },

  updateDailyOverview: (overview: DailyOverview) => {
    const current = get().learningProgress
    if (current) {
      set({
        learningProgress: {
          ...current,
          dailyOverview: overview,
        },
      })
    }
  },

  updateWeeklyProgress: (progress: WeeklyProgress) => {
    const current = get().learningProgress
    if (current) {
      set({
        learningProgress: {
          ...current,
          weeklyProgress: progress,
        },
      })
    }
  },

  updateStudyStatistics: (statistics: StudyStatistics) => {
    const current = get().learningProgress
    if (current) {
      set({
        learningProgress: {
          ...current,
          studyStatistics: statistics,
        },
      })
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}))

// 生成本周天数数据的辅助函数
function generateWeeklyDays() {
  const today = new Date()
  const currentDay = today.getDay() // 0 = 周日, 1 = 周一, ...
  const days = []

  // 从周一开始
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay

  const weekdays = ['一', '二', '三', '四', '五', '六', '日']

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + mondayOffset + i)

    const isToday = date.toDateString() === today.toDateString()
    const isPast = date < today && !isToday

    days.push({
      date: date.toISOString().split('T')[0],
      dayOfWeek: weekdays[i],
      dayNumber: date.getDate().toString(),
      isCompleted: isPast ? Math.random() > 0.3 : false, // 模拟已完成状态
      isToday,
      studyMinutes: isPast ? Math.floor(Math.random() * 60) + 15 : undefined,
    })
  }

  return days
}

// 导出类型已在上面的create函数中定义，这里不需要重复导出

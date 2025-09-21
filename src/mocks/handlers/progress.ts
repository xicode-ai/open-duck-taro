import { http, HttpResponse } from 'msw'
import type {
  LearningProgress,
  DailyOverview,
  WeeklyProgress,
  StudyStatistics,
} from '@/types'

// 生成本周天数数据
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

    // 模拟学习记录：过去的日子有80%概率完成学习
    const isCompleted = isPast ? Math.random() > 0.2 : false

    days.push({
      date: date.toISOString().split('T')[0],
      dayOfWeek: weekdays[i],
      dayNumber: date.getDate().toString(),
      isCompleted,
      isToday,
      studyMinutes: isCompleted
        ? Math.floor(Math.random() * 45) + 15
        : undefined,
    })
  }

  return days
}

// Mock 数据
const mockDailyOverview: DailyOverview = {
  date: new Date().toISOString().split('T')[0],
  topicProgress: {
    completed: 6,
    total: 10,
    percentage: 60,
  },
  vocabularyCount: 15,
  photoStoryCount: 3,
}

const mockWeeklyProgress: WeeklyProgress = {
  weekNumber: 3,
  days: generateWeeklyDays(),
}

const mockStudyStatistics: StudyStatistics = {
  chatCount: 128,
  topicCount: 45,
  translateCount: 67,
  photoStoryCount: 23,
  vocabularyCount: 156,
  totalStudyTime: 720, // 12小时
}

const mockLearningProgress: LearningProgress = {
  dailyOverview: mockDailyOverview,
  weeklyProgress: mockWeeklyProgress,
  studyStatistics: mockStudyStatistics,
  suggestion: {
    title: '今日建议',
    description:
      '你在对话练习方面表现很棒！建议今天多练习一些翻译功能，提升词汇量。',
    type: 'translate',
    priority: 'high',
  },
}

// 学习排行榜数据
const mockLeaderboard = {
  rank: 15,
  totalUsers: 1000,
  users: [
    {
      rank: 1,
      userId: 'user001',
      nickname: '学霸小明',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&crop=face',
      score: 2850,
      studyTime: 480,
    },
    {
      rank: 2,
      userId: 'user002',
      nickname: '英语达人',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b150b0e5?w=60&h=60&fit=crop&crop=face',
      score: 2720,
      studyTime: 450,
    },
    {
      rank: 3,
      userId: 'user003',
      nickname: '口语小王子',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
      score: 2680,
      studyTime: 420,
    },
    {
      rank: 14,
      userId: 'user014',
      nickname: '努力学习中',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
      score: 1850,
      studyTime: 280,
    },
    {
      rank: 15,
      userId: 'current',
      nickname: '我',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face',
      score: 1820,
      studyTime: 275,
    },
    {
      rank: 16,
      userId: 'user016',
      nickname: '新手小白',
      avatar:
        'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=60&h=60&fit=crop&crop=face',
      score: 1790,
      studyTime: 260,
    },
  ],
}

export const progressHandlers = [
  // 获取学习进度数据
  http.get('/api/progress/learning', () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: mockLearningProgress,
    })
  }),

  // 获取今日概览
  http.get('/api/progress/daily-overview', () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: mockDailyOverview,
    })
  }),

  // 获取本周进度
  http.get('/api/progress/weekly', () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: mockWeeklyProgress,
    })
  }),

  // 获取学习统计
  http.get('/api/progress/statistics', () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: mockStudyStatistics,
    })
  }),

  // 更新学习活动
  http.post('/api/progress/activity', async ({ request }) => {
    const activity = await request.json()

    // 根据不同活动类型计算积分
    const pointsMap = {
      chat: 10,
      topic: 15,
      vocabulary: 5,
      translate: 8,
      photo: 12,
    }

    const activityData = activity as {
      type: keyof typeof pointsMap
      duration: number
      details?: Record<string, unknown>
    }
    const pointsEarned = pointsMap[activityData.type] || 5

    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: {
        success: true,
        pointsEarned,
      },
    })
  }),

  // 获取学习建议
  http.get('/api/progress/suggestion', () => {
    const suggestions = [
      {
        title: '今日建议',
        description:
          '你在对话练习方面表现很棒！建议今天多练习一些翻译功能，提升词汇量。',
        type: 'translate' as const,
        priority: 'high' as const,
      },
      {
        title: '学习提示',
        description:
          '已经连续学习3天了！继续保持，建议尝试一些话题对话来提高口语表达。',
        type: 'topic' as const,
        priority: 'medium' as const,
      },
      {
        title: '复习建议',
        description: '单词学习进度不错，建议复习之前学过的词汇，巩固记忆。',
        type: 'vocabulary' as const,
        priority: 'medium' as const,
      },
    ]

    const randomSuggestion =
      suggestions[Math.floor(Math.random() * suggestions.length)]

    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: randomSuggestion,
    })
  }),

  // 获取学习排行榜
  http.get('/api/progress/leaderboard', ({ request }) => {
    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'weekly'

    // 根据类型调整排行榜数据
    let adjustedLeaderboard = { ...mockLeaderboard }

    if (type === 'daily') {
      adjustedLeaderboard.users = adjustedLeaderboard.users.map(user => ({
        ...user,
        score: Math.floor(user.score * 0.1),
        studyTime: Math.floor(user.studyTime * 0.2),
      }))
    } else if (type === 'monthly') {
      adjustedLeaderboard.users = adjustedLeaderboard.users.map(user => ({
        ...user,
        score: Math.floor(user.score * 4.2),
        studyTime: Math.floor(user.studyTime * 4.5),
      }))
    }

    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: adjustedLeaderboard,
    })
  }),

  // 获取学习历史图表数据
  http.get('/api/progress/chart-data', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'week'

    let chartData

    if (period === 'week') {
      chartData = {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [
          {
            label: '学习时长',
            data: [45, 30, 60, 25, 55, 40, 35],
            color: '#4CAF50',
          },
          {
            label: '完成任务',
            data: [8, 6, 12, 4, 10, 7, 5],
            color: '#2196F3',
          },
        ],
      }
    } else if (period === 'month') {
      const days = Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
      const studyData = Array.from(
        { length: 30 },
        () => Math.floor(Math.random() * 60) + 15
      )
      const taskData = Array.from(
        { length: 30 },
        () => Math.floor(Math.random() * 12) + 2
      )

      chartData = {
        labels: days,
        datasets: [
          {
            label: '学习时长',
            data: studyData,
            color: '#4CAF50',
          },
          {
            label: '完成任务',
            data: taskData,
            color: '#2196F3',
          },
        ],
      }
    }

    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: chartData,
    })
  }),

  // 获取成就徽章
  http.get('/api/progress/achievements', () => {
    const achievements = [
      {
        id: 'streak_7',
        title: '一周坚持',
        description: '连续学习7天',
        icon: 'fire',
        earned: true,
        earnedAt: '2024-01-15',
        progress: 100,
      },
      {
        id: 'vocabulary_100',
        title: '单词达人',
        description: '累计学习100个单词',
        icon: 'book',
        earned: true,
        earnedAt: '2024-01-10',
        progress: 100,
      },
      {
        id: 'topic_master',
        title: '话题大师',
        description: '完成50个话题对话',
        icon: 'chat',
        earned: false,
        progress: 90,
      },
      {
        id: 'early_bird',
        title: '早起鸟',
        description: '早上8点前学习10次',
        icon: 'sun',
        earned: false,
        progress: 60,
      },
    ]

    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: achievements,
    })
  }),
]

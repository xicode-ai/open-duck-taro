/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpResponse, delay } from 'msw'

// Mock用户数据
let mockUser = {
  id: 'user-001',
  username: 'DuckLearner',
  email: 'learner@openduck.com',
  avatar: '😊',
  level: 'intermediate',
  points: 1250,
  streak: 7,
  membershipType: 'basic',
  membershipExpiry: null,
  createdAt: '2024-01-01',
  settings: {
    dailyGoal: 30, // 分钟
    notificationEnabled: true,
    soundEnabled: true,
    autoPlay: false,
    theme: 'light',
    language: 'zh-CN',
  },
  stats: {
    totalStudyTime: 3600, // 分钟
    wordsLearned: 523,
    sentencesPracticed: 186,
    daysStudied: 45,
    accuracy: 0.85,
  },
}

// Mock Token
const MOCK_TOKEN = 'mock-jwt-token-' + Date.now()

export const userHandlers = [
  // 用户登录
  http.post('/api/auth/login', async ({ request }) => {
    await delay(800)
    const body = (await request.json()) as {
      username?: string
      email?: string
      password: string
    }

    // 简单验证
    if (body.password !== 'password123') {
      return HttpResponse.json(
        {
          code: 401,
          message: '用户名或密码错误',
        },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      code: 200,
      data: {
        token: MOCK_TOKEN,
        user: mockUser,
        expiresIn: 7200,
      },
      message: 'success',
    })
  }),

  // 用户注册
  http.post('/api/auth/register', async ({ request }) => {
    await delay(1000)
    const body = (await request.json()) as {
      username: string
      email: string
      password: string
    }

    const newUser = {
      ...mockUser,
      id: 'user-' + Date.now(),
      username: body.username,
      email: body.email,
      createdAt: new Date().toISOString(),
    }

    return HttpResponse.json({
      code: 200,
      data: {
        token: MOCK_TOKEN,
        user: newUser,
      },
      message: '注册成功',
    })
  }),

  // 退出登录
  http.post('/api/auth/logout', async () => {
    await delay(200)
    return HttpResponse.json({
      code: 200,
      message: '退出成功',
    })
  }),

  // 获取用户信息
  http.get('/api/user/profile', async ({ request }) => {
    await delay(400)

    // 检查token
    const token = request.headers.get('Authorization')
    if (!token || !token.includes(MOCK_TOKEN)) {
      return HttpResponse.json(
        {
          code: 401,
          message: '未授权',
        },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      code: 200,
      data: mockUser,
      message: 'success',
    })
  }),

  // 更新用户信息
  http.put('/api/user/profile', async ({ request }) => {
    await delay(500)
    const updates = (await request.json()) as any

    mockUser = {
      ...mockUser,
      ...updates,
    }

    return HttpResponse.json({
      code: 200,
      data: mockUser,
      message: '更新成功',
    })
  }),

  // 更新用户设置
  http.put('/api/user/settings', async ({ request }) => {
    await delay(300)
    const settings = (await request.json()) as any

    mockUser.settings = {
      ...mockUser.settings,
      ...settings,
    }

    return HttpResponse.json({
      code: 200,
      data: mockUser.settings,
      message: '设置已保存',
    })
  }),

  // 获取用户学习统计
  http.get('/api/user/stats', async () => {
    await delay(500)

    return HttpResponse.json({
      code: 200,
      data: {
        totalStudyDays: mockUser.stats.daysStudied,
        totalPoints: mockUser.points,
        currentStreak: mockUser.streak,
        totalConversations: 128, // 模拟对话次数
        totalWords: mockUser.stats.wordsLearned,
        totalMinutes: mockUser.stats.totalStudyTime,
      },
      message: 'success',
    })
  }),

  // 更新每日学习记录
  http.post('/api/user/daily-record', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as {
      date: string
      minutes: number
      words: number
      sentences: number
    }

    // 更新统计
    mockUser.stats.totalStudyTime += body.minutes
    mockUser.stats.wordsLearned += body.words
    mockUser.stats.sentencesPracticed += body.sentences

    return HttpResponse.json({
      code: 200,
      data: {
        recorded: true,
        newStreak: mockUser.streak + 1,
        pointsEarned: Math.floor(body.minutes * 2),
      },
      message: '学习记录已保存',
    })
  }),

  // 获取排行榜
  http.get('/api/user/leaderboard', async ({ request }) => {
    await delay(600)
    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'weekly'

    const mockLeaderboard = [
      {
        rank: 1,
        userId: 'user-002',
        username: 'TopLearner',
        avatar: '🏆',
        points: 3250,
        studyTime: 1200,
      },
      {
        rank: 2,
        userId: 'user-003',
        username: 'StudyMaster',
        avatar: '🌟',
        points: 2980,
        studyTime: 1100,
      },
      {
        rank: 3,
        userId: 'user-001',
        username: 'DuckLearner',
        avatar: '😊',
        points: 1250,
        studyTime: 600,
      },
      {
        rank: 4,
        userId: 'user-004',
        username: 'EnglishPro',
        avatar: '💪',
        points: 1180,
        studyTime: 550,
      },
      {
        rank: 5,
        userId: 'user-005',
        username: 'DailyPractice',
        avatar: '📚',
        points: 980,
        studyTime: 450,
      },
    ]

    return HttpResponse.json({
      code: 200,
      data: {
        type,
        leaderboard: mockLeaderboard,
        userRank: {
          rank: 3,
          improvement: 2, // 提升了2名
        },
      },
      message: 'success',
    })
  }),

  // 获取成就列表
  http.get('/api/user/achievements', async () => {
    await delay(500)

    const achievements = [
      {
        id: 'ach-001',
        name: '初学者',
        description: '完成第一次学习',
        icon: '🌱',
        unlocked: true,
        unlockedAt: '2024-01-02',
        progress: 1,
        total: 1,
      },
      {
        id: 'ach-002',
        name: '连续学习7天',
        description: '连续7天坚持学习',
        icon: '🔥',
        unlocked: true,
        unlockedAt: '2024-01-08',
        progress: 7,
        total: 7,
      },
      {
        id: 'ach-003',
        name: '词汇达人',
        description: '学习500个单词',
        icon: '📖',
        unlocked: true,
        unlockedAt: '2024-02-15',
        progress: 523,
        total: 500,
      },
      {
        id: 'ach-004',
        name: '口语大师',
        description: '完成1000句口语练习',
        icon: '🗣️',
        unlocked: false,
        progress: 186,
        total: 1000,
      },
      {
        id: 'ach-005',
        name: '学习达人',
        description: '累计学习100小时',
        icon: '⏰',
        unlocked: false,
        progress: 60,
        total: 100,
      },
    ]

    return HttpResponse.json({
      code: 200,
      data: achievements,
      message: 'success',
    })
  }),

  // 签到
  http.post('/api/user/check-in', async () => {
    await delay(400)

    const pointsEarned = 10 + Math.floor(Math.random() * 20)
    mockUser.points += pointsEarned
    mockUser.streak += 1

    return HttpResponse.json({
      code: 200,
      data: {
        success: true,
        pointsEarned,
        newStreak: mockUser.streak,
        totalPoints: mockUser.points,
        bonus: mockUser.streak % 7 === 0 ? 50 : 0, // 7天连续签到奖励
      },
      message: '签到成功',
    })
  }),
]

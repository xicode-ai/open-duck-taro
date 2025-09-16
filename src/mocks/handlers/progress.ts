import { http, HttpResponse, delay } from 'msw'

export const progressHandlers = [
  // 获取学习进度总览
  http.get('/api/progress/overview', async () => {
    await delay(500)

    const overview = {
      todayMinutes: 35,
      todayGoal: 30,
      weeklyMinutes: 245,
      weeklyGoal: 210,
      monthlyMinutes: 890,
      monthlyGoal: 900,
      streak: 7,
      longestStreak: 15,
      totalDays: 45,
      totalHours: Math.floor(890 / 60),
      level: 'intermediate',
      nextLevel: 'upper-intermediate',
      levelProgress: 0.65,
      points: 1250,
      rank: 23,
      totalUsers: 1580,
    }

    return HttpResponse.json({
      code: 200,
      data: overview,
      message: 'success',
    })
  }),

  // 获取详细学习统计
  http.get('/api/progress/stats', async ({ request }) => {
    await delay(600)
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'week'

    const generateStats = (days: number) => {
      return Array.from({ length: days }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (days - i - 1))
        return {
          date: date.toISOString().split('T')[0],
          minutes: Math.floor(Math.random() * 60) + 10,
          words: Math.floor(Math.random() * 30) + 5,
          sentences: Math.floor(Math.random() * 20) + 3,
          accuracy: Math.random() * 0.3 + 0.7,
          topics: Math.floor(Math.random() * 3) + 1,
        }
      })
    }

    let stats
    switch (period) {
      case 'week':
        stats = generateStats(7)
        break
      case 'month':
        stats = generateStats(30)
        break
      case 'year':
        stats = generateStats(365)
        break
      default:
        stats = generateStats(7)
    }

    return HttpResponse.json({
      code: 200,
      data: {
        period,
        stats,
        summary: {
          totalMinutes: stats.reduce((sum, s) => sum + s.minutes, 0),
          totalWords: stats.reduce((sum, s) => sum + s.words, 0),
          totalSentences: stats.reduce((sum, s) => sum + s.sentences, 0),
          averageAccuracy:
            stats.reduce((sum, s) => sum + s.accuracy, 0) / stats.length,
          activeDays: stats.filter(s => s.minutes > 0).length,
        },
      },
      message: 'success',
    })
  }),

  // 获取技能雷达图数据
  http.get('/api/progress/skills', async () => {
    await delay(400)

    const skills = {
      listening: {
        level: 3,
        maxLevel: 5,
        score: 75,
        progress: 0.6,
        exercises: 120,
      },
      speaking: {
        level: 2,
        maxLevel: 5,
        score: 65,
        progress: 0.4,
        exercises: 85,
      },
      reading: {
        level: 4,
        maxLevel: 5,
        score: 85,
        progress: 0.8,
        exercises: 200,
      },
      writing: {
        level: 3,
        maxLevel: 5,
        score: 70,
        progress: 0.55,
        exercises: 95,
      },
      vocabulary: {
        level: 3,
        maxLevel: 5,
        score: 78,
        progress: 0.65,
        words: 523,
      },
      grammar: {
        level: 3,
        maxLevel: 5,
        score: 72,
        progress: 0.58,
        rules: 156,
      },
    }

    return HttpResponse.json({
      code: 200,
      data: skills,
      message: 'success',
    })
  }),

  // 获取学习日历
  http.get('/api/progress/calendar', async ({ request }) => {
    await delay(500)
    const url = new URL(request.url)
    const year = parseInt(
      url.searchParams.get('year') || new Date().getFullYear().toString()
    )
    const month = parseInt(
      url.searchParams.get('month') || (new Date().getMonth() + 1).toString()
    )

    // 生成一个月的学习记录
    const daysInMonth = new Date(year, month, 0).getDate()
    const calendar = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month - 1, i + 1)
      const isStudied = Math.random() > 0.3 // 70%的概率有学习
      return {
        date: date.toISOString().split('T')[0],
        studied: isStudied,
        minutes: isStudied ? Math.floor(Math.random() * 60) + 10 : 0,
        completed: isStudied && Math.random() > 0.5,
      }
    })

    return HttpResponse.json({
      code: 200,
      data: {
        year,
        month,
        calendar,
        monthlyStreak: 7,
        studiedDays: calendar.filter(d => d.studied).length,
        totalMinutes: calendar.reduce((sum, d) => sum + d.minutes, 0),
      },
      message: 'success',
    })
  }),

  // 获取成就和里程碑
  http.get('/api/progress/milestones', async () => {
    await delay(400)

    const milestones = [
      {
        id: 'ms-001',
        title: '初出茅庐',
        description: '完成第一次学习',
        icon: '🌱',
        achieved: true,
        achievedDate: '2024-01-01',
        points: 10,
        rarity: 'common',
      },
      {
        id: 'ms-002',
        title: '坚持一周',
        description: '连续学习7天',
        icon: '🔥',
        achieved: true,
        achievedDate: '2024-01-07',
        points: 50,
        rarity: 'uncommon',
      },
      {
        id: 'ms-003',
        title: '词汇百人斩',
        description: '学习100个单词',
        icon: '⚔️',
        achieved: true,
        achievedDate: '2024-01-15',
        points: 100,
        rarity: 'rare',
      },
      {
        id: 'ms-004',
        title: '对话达人',
        description: '完成50次对话练习',
        icon: '💬',
        achieved: true,
        achievedDate: '2024-02-01',
        points: 150,
        rarity: 'rare',
      },
      {
        id: 'ms-005',
        title: '月度冠军',
        description: '单月学习时间超过30小时',
        icon: '🏆',
        achieved: false,
        progress: 0.75,
        target: 30,
        current: 22.5,
        points: 200,
        rarity: 'epic',
      },
      {
        id: 'ms-006',
        title: '全能选手',
        description: '所有技能达到4级',
        icon: '🌟',
        achieved: false,
        progress: 0.5,
        points: 500,
        rarity: 'legendary',
      },
    ]

    return HttpResponse.json({
      code: 200,
      data: {
        achieved: milestones.filter(m => m.achieved),
        inProgress: milestones.filter(m => !m.achieved),
        totalPoints: milestones
          .filter(m => m.achieved)
          .reduce((sum, m) => sum + m.points, 0),
      },
      message: 'success',
    })
  }),

  // 获取学习报告
  http.get('/api/progress/report', async ({ request }) => {
    await delay(700)
    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'weekly'

    const report = {
      type,
      period: type === 'weekly' ? '2024-03-18 至 2024-03-24' : '2024年3月',
      summary: {
        studyDays: type === 'weekly' ? 6 : 22,
        totalMinutes: type === 'weekly' ? 245 : 890,
        averageDaily: type === 'weekly' ? 35 : 30,
        wordsLearned: type === 'weekly' ? 68 : 234,
        sentencesPracticed: type === 'weekly' ? 42 : 186,
        topicsCompleted: type === 'weekly' ? 3 : 12,
      },
      improvements: [
        { skill: 'Pronunciation', improvement: '+15%', from: 65, to: 75 },
        { skill: 'Vocabulary', improvement: '+12%', from: 70, to: 78 },
        { skill: 'Fluency', improvement: '+8%', from: 60, to: 65 },
      ],
      strengths: [
        'Consistent daily practice',
        'Good vocabulary retention',
        'Active participation',
      ],
      suggestions: [
        'Try to increase speaking practice time',
        'Focus more on grammar exercises',
        'Review learned words more frequently',
      ],
      nextGoals: [
        'Complete 5 new topics',
        'Learn 100 new words',
        'Achieve 80% accuracy in exercises',
      ],
    }

    return HttpResponse.json({
      code: 200,
      data: report,
      message: 'success',
    })
  }),

  // 设置学习目标
  http.post('/api/progress/goals', async ({ request }) => {
    await delay(400)
    const body = (await request.json()) as {
      dailyMinutes: number
      weeklyDays: number
      monthlyWords: number
    }

    return HttpResponse.json({
      code: 200,
      data: {
        goals: body,
        updated: true,
      },
      message: '目标已更新',
    })
  }),

  // 获取学习徽章
  http.get('/api/progress/badges', async () => {
    await delay(400)

    const badges = [
      {
        id: 'badge-001',
        name: '早起鸟',
        description: '在早上6点前完成学习',
        icon: '🐦',
        count: 5,
        lastEarned: '2024-03-20',
      },
      {
        id: 'badge-002',
        name: '夜猫子',
        description: '在晚上11点后完成学习',
        icon: '🦉',
        count: 3,
        lastEarned: '2024-03-19',
      },
      {
        id: 'badge-003',
        name: '完美主义者',
        description: '单次练习正确率100%',
        icon: '💯',
        count: 12,
        lastEarned: '2024-03-21',
      },
      {
        id: 'badge-004',
        name: '速度之王',
        description: '5分钟内完成10个练习',
        icon: '⚡',
        count: 8,
        lastEarned: '2024-03-18',
      },
    ]

    return HttpResponse.json({
      code: 200,
      data: badges,
      message: 'success',
    })
  }),
]

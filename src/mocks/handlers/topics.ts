import { http, HttpResponse, delay } from 'msw'
import type { TopicParams, LessonParams, TopicPracticeBody } from '../types'

// Mock自定义话题数据
let customTopics = [
  {
    id: 'custom-1',
    title: '游戏交流',
    description: '3个对话 · 已练习2次',
    icon: '🎮',
    conversations: 3,
    created: '2024-01-01',
    isCustom: true,
  },
  {
    id: 'custom-2',
    title: '音乐分享',
    description: '2个对话 · 已练习1次',
    icon: '🎵',
    conversations: 2,
    created: '2024-01-02',
    isCustom: true,
  },
]

// Mock学习进度数据
const topicProgress = [
  {
    topicId: '1',
    title: '咖啡话题',
    icon: '☕',
    completedDialogues: 8,
    totalDialogues: 15,
    progress: 53,
  },
  {
    topicId: '2',
    title: '旅游话题',
    icon: '✈️',
    completedDialogues: 12,
    totalDialogues: 20,
    progress: 60,
  },
  {
    topicId: '3',
    title: '健身话题',
    icon: '💪',
    completedDialogues: 5,
    totalDialogues: 12,
    progress: 42,
  },
  {
    topicId: '4',
    title: '餐厅话题',
    icon: '🍽️',
    completedDialogues: 14,
    totalDialogues: 18,
    progress: 78,
  },
  {
    topicId: '5',
    title: '购物话题',
    icon: '🛒',
    completedDialogues: 6,
    totalDialogues: 16,
    progress: 38,
  },
  {
    topicId: '6',
    title: '工作话题',
    icon: '💼',
    completedDialogues: 18,
    totalDialogues: 22,
    progress: 82,
  },
]

// Mock热门话题数据
const hotTopicsData = [
  {
    id: '1',
    title: '咖啡',
    description: '点咖啡、描述口味偏好',
    icon: '☕',
    background: '#FF6B35',
    category: 'daily',
    difficulty: 'easy',
    conversations: 15,
    progress: 53,
    isPopular: true,
  },
  {
    id: '2',
    title: '旅游',
    description: '机场、酒店、问路',
    icon: '✈️',
    background: '#4ECDC4',
    category: 'travel',
    difficulty: 'medium',
    conversations: 20,
    progress: 60,
    isPopular: true,
  },
  {
    id: '3',
    title: '健身',
    description: '健身房、运动计划',
    icon: '💪',
    background: '#45B7D1',
    category: 'health',
    difficulty: 'medium',
    conversations: 12,
    progress: 42,
  },
  {
    id: '4',
    title: '餐厅',
    description: '点餐、服务、买单',
    icon: '🍽️',
    background: '#F7931E',
    category: 'daily',
    difficulty: 'easy',
    conversations: 18,
    progress: 78,
  },
  {
    id: '5',
    title: '购物',
    description: '选择、试穿、砍价',
    icon: '🛒',
    background: '#C44569',
    category: 'shopping',
    difficulty: 'easy',
    conversations: 16,
    progress: 38,
  },
  {
    id: '6',
    title: '工作',
    description: '面试、会议、同事',
    icon: '💼',
    background: '#6C5CE7',
    category: 'work',
    difficulty: 'hard',
    conversations: 22,
    progress: 82,
  },
  {
    id: '7',
    title: '闲聊',
    description: '',
    icon: '💬',
    background: '#A8E6CF',
    category: 'daily',
    difficulty: 'medium',
    conversations: 8,
    progress: 0,
  },
  {
    id: '8',
    title: '电话',
    description: '',
    icon: '📞',
    background: '#74B9FF',
    category: 'daily',
    difficulty: 'medium',
    conversations: 6,
    progress: 0,
  },
]

export const topicsHandlers = [
  // 获取热门话题列表
  http.get('/api/topics/hot', async ({ request }) => {
    await delay(500)
    // eslint-disable-next-line no-undef
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const difficulty = url.searchParams.get('difficulty')

    let filteredTopics = [...hotTopicsData]

    if (category) {
      filteredTopics = filteredTopics.filter(t => t.category === category)
    }

    if (difficulty) {
      filteredTopics = filteredTopics.filter(t => t.difficulty === difficulty)
    }

    return HttpResponse.json({
      code: 200,
      data: filteredTopics,
      message: 'success',
    })
  }),

  // 获取自定义话题列表
  http.get('/api/topics/custom', async () => {
    await delay(300)

    return HttpResponse.json({
      code: 200,
      data: customTopics,
      message: 'success',
    })
  }),

  // 创建自定义话题
  http.post('/api/topics/custom', async ({ request }) => {
    await delay(400)
    const body = (await request.json()) as {
      title: string
      description?: string
      icon: string
    }

    if (!body) {
      return HttpResponse.json(
        { code: 400, message: '参数不能为空' },
        { status: 400 }
      )
    }

    const newTopic = {
      id: `custom-${Date.now()}`,
      title: body.title,
      description: body.description || `0个对话 · 未练习`,
      icon: body.icon,
      conversations: 0,
      created: new Date().toISOString().split('T')[0],
      isCustom: true,
    }

    customTopics.push(newTopic)

    return HttpResponse.json({
      code: 200,
      data: newTopic,
      message: '创建成功',
    })
  }),

  // 更新自定义话题
  http.put('/api/topics/custom/:topicId', async ({ params, request }) => {
    await delay(300)
    const body = (await request.json()) as {
      title: string
      icon: string
    }
    const topicIndex = customTopics.findIndex(t => t.id === params.topicId)

    if (topicIndex === -1) {
      return HttpResponse.json(
        { code: 404, message: '话题不存在' },
        { status: 404 }
      )
    }

    if (!body) {
      return HttpResponse.json(
        { code: 400, message: '参数不能为空' },
        { status: 400 }
      )
    }

    customTopics[topicIndex] = {
      ...customTopics[topicIndex],
      title: body.title,
      icon: body.icon,
    }

    return HttpResponse.json({
      code: 200,
      data: customTopics[topicIndex],
      message: '更新成功',
    })
  }),

  // 删除自定义话题
  http.delete('/api/topics/custom/:topicId', async ({ params }) => {
    await delay(300)
    const topicIndex = customTopics.findIndex(t => t.id === params.topicId)

    if (topicIndex === -1) {
      return HttpResponse.json(
        { code: 404, message: '话题不存在' },
        { status: 404 }
      )
    }

    customTopics.splice(topicIndex, 1)

    return HttpResponse.json({
      code: 200,
      message: '删除成功',
    })
  }),

  // 获取学习进度
  http.get('/api/topics/progress', async () => {
    await delay(400)

    return HttpResponse.json({
      code: 200,
      data: topicProgress,
      message: 'success',
    })
  }),

  // 获取话题列表（兼容旧接口）
  http.get('/api/topics', async ({ request }) => {
    await delay(500)
    // eslint-disable-next-line no-undef
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const difficulty = url.searchParams.get('difficulty')

    let filteredTopics = [...hotTopicsData]

    if (category) {
      filteredTopics = filteredTopics.filter(t => t.category === category)
    }

    if (difficulty) {
      filteredTopics = filteredTopics.filter(t => t.difficulty === difficulty)
    }

    return HttpResponse.json({
      code: 200,
      data: filteredTopics,
      message: 'success',
    })
  }),

  // 获取话题详情
  http.get<TopicParams>('/api/topics/:topicId', async ({ params }) => {
    await delay(400)
    const topic = [...hotTopicsData, ...customTopics].find(
      t => t.id === params.topicId
    )

    if (!topic) {
      return HttpResponse.json(
        { code: 404, message: '话题不存在' },
        { status: 404 }
      )
    }

    // 获取相关话题（只从hotTopicsData中获取，因为customTopics没有category）
    const topicCategory = 'category' in topic ? topic.category : 'daily'
    const relatedTopics = hotTopicsData
      .filter(t => t.id !== topic.id && t.category === topicCategory)
      .slice(0, 3)

    // 添加更多详细内容
    const detailedTopic = {
      ...topic,
      introduction:
        'This topic will help you master essential English for this situation.',
      objectives: [
        'Learn key vocabulary and phrases',
        'Practice real-world conversations',
        'Improve pronunciation and fluency',
      ],
      resources: [
        {
          type: 'video',
          title: 'Introduction Video',
          url: '/mock-video/intro.mp4',
        },
        {
          type: 'audio',
          title: 'Pronunciation Guide',
          url: '/mock-audio/guide.mp3',
        },
        { type: 'pdf', title: 'Study Notes', url: '/mock-pdf/notes.pdf' },
      ],
      relatedTopics,
    }

    return HttpResponse.json({
      code: 200,
      data: detailedTopic,
      message: 'success',
    })
  }),

  // 开始学习话题
  http.post<TopicParams>('/api/topics/:topicId/start', async ({ params }) => {
    await delay(300)

    return HttpResponse.json({
      code: 200,
      data: {
        topicId: params.topicId,
        sessionId: `session-${Date.now()}`,
        startTime: new Date().toISOString(),
      },
      message: '开始学习',
    })
  }),

  // 完成课程
  http.post<LessonParams>(
    '/api/topics/:topicId/lessons/:lessonId/complete',
    async ({ params }) => {
      await delay(400)

      return HttpResponse.json({
        code: 200,
        data: {
          topicId: params.topicId,
          lessonId: params.lessonId,
          completed: true,
          pointsEarned: 20,
          nextLesson:
            'lesson-00' +
            (parseInt((params.lessonId as string).split('-')[1]) + 1),
        },
        message: '课程已完成',
      })
    }
  ),

  // 获取话题对话练习
  http.get<TopicParams>(
    '/api/topics/:topicId/conversations',
    async ({ params: _params }) => {
      await delay(500)

      const conversations = [
        {
          id: 'conv-001',
          scenario: 'Meeting someone new',
          difficulty: 'beginner',
          turns: [
            { speaker: 'A', text: 'Hi, nice to meet you!' },
            { speaker: 'B', text: "Nice to meet you too! What's your name?" },
            { speaker: 'A', text: "I'm Alex. How about you?" },
            { speaker: 'B', text: "I'm Emma. Where are you from?" },
          ],
          practicePoints: [
            'Greeting phrases',
            'Introducing yourself',
            'Asking about others',
          ],
        },
        {
          id: 'conv-002',
          scenario: 'Talking about hobbies',
          difficulty: 'intermediate',
          turns: [
            { speaker: 'A', text: 'What do you like to do in your free time?' },
            {
              speaker: 'B',
              text: 'I enjoy reading and hiking. How about you?',
            },
            { speaker: 'A', text: 'I love playing guitar and cooking.' },
            {
              speaker: 'B',
              text: 'That sounds interesting! How long have you been playing guitar?',
            },
          ],
          practicePoints: [
            'Discussing hobbies',
            'Expressing interests',
            'Follow-up questions',
          ],
        },
      ]

      return HttpResponse.json({
        code: 200,
        data: conversations,
        message: 'success',
      })
    }
  ),

  // 提交话题练习
  http.post<TopicParams>(
    '/api/topics/:topicId/practice',
    async ({ params, request }) => {
      await delay(600)
      const _body = (await request.json()) as TopicPracticeBody

      // 模拟AI评分
      const evaluation = {
        score: Math.floor(Math.random() * 20) + 80,
        feedback: {
          pronunciation: Math.floor(Math.random() * 20) + 80,
          fluency: Math.floor(Math.random() * 20) + 75,
          grammar: Math.floor(Math.random() * 20) + 85,
          vocabulary: Math.floor(Math.random() * 20) + 80,
        },
        suggestions: [
          'Good use of vocabulary!',
          'Try to speak more naturally',
          'Pay attention to the past tense',
        ],
        corrections: [
          {
            original: 'I go there yesterday',
            corrected: 'I went there yesterday',
          },
        ],
      }

      return HttpResponse.json({
        code: 200,
        data: {
          topicId: params.topicId,
          practiceId: `practice-${Date.now()}`,
          evaluation,
          pointsEarned: Math.floor(evaluation.score / 10),
        },
        message: '练习已提交',
      })
    }
  ),

  // 获取推荐话题
  http.get('/api/topics/recommendations', async () => {
    await delay(400)

    const recommendations = hotTopicsData
      .filter(t => t.progress < 100)
      .sort((a, b) => (a.progress || 0) - (b.progress || 0))
      .slice(0, 3)
      .map(t => ({
        ...t,
        reason: (t.progress || 0) > 0 ? '继续学习' : '新话题',
        estimatedTime: '15-20分钟',
      }))

    return HttpResponse.json({
      code: 200,
      data: recommendations,
      message: 'success',
    })
  }),

  // 获取话题分类
  http.get('/api/topics/categories', async () => {
    await delay(300)

    const categories = [
      { id: 'daily', name: '日常对话', icon: '💬', count: 15 },
      { id: 'business', name: '商务职场', icon: '💼', count: 10 },
      { id: 'lifestyle', name: '生活方式', icon: '🌟', count: 12 },
      { id: 'culture', name: '文化交流', icon: '🌍', count: 8 },
      { id: 'education', name: '教育学习', icon: '📚', count: 7 },
      { id: 'technology', name: '科技创新', icon: '💻', count: 6 },
    ]

    return HttpResponse.json({
      code: 200,
      data: categories,
      message: 'success',
    })
  }),
]

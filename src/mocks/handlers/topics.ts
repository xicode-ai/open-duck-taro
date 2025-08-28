import { http, HttpResponse, delay } from 'msw'
import type { TopicParams, LessonParams, TopicPracticeBody } from '../types'

// Mock话题数据
const topicsData = [
  {
    id: 'topic-001',
    title: '自我介绍',
    titleEn: 'Self Introduction',
    description: '学习如何用英语介绍自己',
    category: 'daily',
    difficulty: 'beginner',
    icon: '👋',
    progress: 100,
    completed: true,
    lessons: [
      {
        id: 'lesson-001',
        title: '基本信息',
        content: 'Learn to introduce your name, age, and where you are from.',
        completed: true,
      },
      {
        id: 'lesson-002',
        title: '兴趣爱好',
        content: 'Talk about your hobbies and interests.',
        completed: true,
      },
    ],
    vocabulary: ['name', 'age', 'hometown', 'hobby', 'interest'],
    keyPhrases: [
      'My name is...',
      "I'm from...",
      'I enjoy...',
      'In my free time, I...',
    ],
  },
  {
    id: 'topic-002',
    title: '日常生活',
    titleEn: 'Daily Life',
    description: '描述你的日常生活和习惯',
    category: 'daily',
    difficulty: 'beginner',
    icon: '☀️',
    progress: 60,
    completed: false,
    lessons: [
      {
        id: 'lesson-003',
        title: '早晨例行',
        content: 'Describe your morning routine.',
        completed: true,
      },
      {
        id: 'lesson-004',
        title: '工作学习',
        content: 'Talk about work or study.',
        completed: false,
      },
      {
        id: 'lesson-005',
        title: '晚间活动',
        content: 'Evening activities and relaxation.',
        completed: false,
      },
    ],
    vocabulary: ['wake up', 'breakfast', 'commute', 'work', 'dinner'],
    keyPhrases: [
      'I usually wake up at...',
      'After breakfast, I...',
      'In the evening, I like to...',
    ],
  },
  {
    id: 'topic-003',
    title: '旅行经历',
    titleEn: 'Travel Experiences',
    description: '分享你的旅行故事和计划',
    category: 'lifestyle',
    difficulty: 'intermediate',
    icon: '✈️',
    progress: 30,
    completed: false,
    lessons: [
      {
        id: 'lesson-006',
        title: '过去的旅行',
        content: 'Share your past travel experiences.',
        completed: true,
      },
      {
        id: 'lesson-007',
        title: '旅行计划',
        content: 'Discuss future travel plans.',
        completed: false,
      },
    ],
    vocabulary: ['destination', 'itinerary', 'accommodation', 'sightseeing'],
    keyPhrases: [
      "I've been to...",
      'The most memorable trip was...',
      "I'm planning to visit...",
    ],
  },
  {
    id: 'topic-004',
    title: '职场英语',
    titleEn: 'Workplace English',
    description: '商务和职场常用英语',
    category: 'business',
    difficulty: 'intermediate',
    icon: '💼',
    progress: 0,
    completed: false,
    lessons: [
      {
        id: 'lesson-008',
        title: '会议用语',
        content: 'Essential phrases for meetings.',
        completed: false,
      },
      {
        id: 'lesson-009',
        title: '邮件写作',
        content: 'Professional email writing.',
        completed: false,
      },
    ],
    vocabulary: ['meeting', 'agenda', 'deadline', 'proposal', 'collaboration'],
    keyPhrases: [
      "I'd like to propose...",
      'Could we schedule a meeting?',
      'Please find attached...',
    ],
  },
]

export const topicsHandlers = [
  // 获取话题列表
  http.get('/api/topics', async ({ request }) => {
    await delay(500)
    // eslint-disable-next-line no-undef
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const difficulty = url.searchParams.get('difficulty')

    let filteredTopics = [...topicsData]

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
    const topic = topicsData.find(t => t.id === params.topicId)

    if (!topic) {
      return HttpResponse.json(
        { code: 404, message: '话题不存在' },
        { status: 404 }
      )
    }

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
      relatedTopics: topicsData
        .filter(t => t.id !== topic.id && t.category === topic.category)
        .slice(0, 3),
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

    const recommendations = topicsData
      .filter(t => !t.completed)
      .sort((a, b) => a.progress - b.progress)
      .slice(0, 3)
      .map(t => ({
        ...t,
        reason: t.progress > 0 ? '继续学习' : '新话题',
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

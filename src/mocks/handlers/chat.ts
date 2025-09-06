import { http, HttpResponse, delay } from 'msw'
import { generateId } from '../../utils'
import type {
  ChatParams,
  SessionParams,
  ExtendedFormData,
  ChatSendBody,
} from '../types'

// Mock数据存储
const chatSessions = new Map()
const aiAssistants = [
  {
    id: 'emma-ai-001',
    name: 'Emma',
    nickname: 'AI外教',
    avatar: '🤖',
    status: 'online',
    level: 'native',
    accent: 'american',
    specialties: ['daily conversation', 'pronunciation', 'grammar'],
    introduction:
      "Hi! I'm Emma, your AI English tutor. Let's practice speaking English together!",
  },
]

// 生成模拟的AI回复
const generateAIResponse = (userMessage: string) => {
  const responses = [
    {
      text: "That's a great point! Could you elaborate on that?",
      suggestions: ['Tell me more', 'Give an example', 'Why do you think so?'],
    },
    {
      text: 'Excellent! Your pronunciation is getting better. Let me help you with a more natural expression.',
      correction: {
        original: userMessage,
        corrected: `Here's a more natural way to say it: "${userMessage}"`,
        explanation:
          'In English, we typically use this structure for better flow.',
      },
    },
    {
      text: 'I understand what you mean. Have you considered this perspective?',
      followUp: 'What are your thoughts on this approach?',
    },
    {
      text: 'Great job! You used the present perfect tense correctly there.',
      grammarTip:
        'Remember: Present perfect is used for actions that started in the past and continue to the present.',
    },
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}

// 生成语音URL（模拟）
const generateAudioUrl = (text: string) => {
  // 实际项目中这里应该调用TTS服务
  return `/mock-audio/${encodeURIComponent(text)}.mp3`
}

export const chatHandlers = [
  // 添加通配符匹配，确保能拦截各种URL模式
  http.post('*/chat/speech-to-text', async ({ request: _request }) => {
    await delay(1000)

    // 模拟语音识别结果
    const mockTexts = [
      "Hello, I'd like to practice speaking English.",
      'Can you help me with my pronunciation?',
      'I want to learn more about American culture.',
      'How do you say this in English?',
      "What's the difference between these two words?",
    ]

    return HttpResponse.json({
      code: 200,
      data: {
        text: mockTexts[Math.floor(Math.random() * mockTexts.length)],
        confidence: 0.95,
        language: 'en-US',
      },
      message: 'success',
    })
  }),

  http.post('*/chat/send', async ({ request }) => {
    await delay(800)
    const body = (await request.json()) as ChatSendBody

    const { sessionId, content, type, audioUrl, duration } = body

    // 生成用户消息ID
    const userMessageId = Date.now().toString()

    // 保存用户消息
    const _userMessage = {
      id: userMessageId,
      sessionId,
      role: 'user' as const,
      content,
      type,
      audioUrl,
      duration,
      timestamp: Date.now(),
    }

    const aiResponse = generateAIResponse(content)

    // 生成AI消息
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      sessionId,
      role: 'ai' as const,
      content: aiResponse.text,
      audioUrl: generateAudioUrl(aiResponse.text),
      duration: Math.floor(Math.random() * 5 + 3),
      timestamp: Date.now() + 100,
      suggestions: aiResponse.suggestions,
      correction: aiResponse.correction,
      grammarTip: aiResponse.grammarTip,
    }

    return HttpResponse.json({
      code: 200,
      data: aiMessage,
      message: 'success',
    })
  }),
  // 获取AI助手信息
  http.get<ChatParams>('/api/chat/assistant/:id', async ({ params }) => {
    await delay(300)
    const assistant = aiAssistants.find(a => a.id === params.id)
    if (!assistant) {
      return HttpResponse.json(
        { error: 'Assistant not found' },
        { status: 404 }
      )
    }
    return HttpResponse.json({
      code: 200,
      data: assistant,
      message: 'success',
    })
  }),

  // 获取聊天历史
  http.get<SessionParams>(
    '/api/chat/history/:sessionId',
    async ({ params }) => {
      await delay(500)
      const sessionId = params.sessionId as string

      // 如果没有历史，创建初始消息
      if (!chatSessions.has(sessionId)) {
        chatSessions.set(sessionId, [
          {
            id: generateId(),
            type: 'ai',
            content:
              "Hi! I'm Emma, your AI English tutor. Let's practice speaking English together! 🦆",
            timestamp: Date.now() - 1000 * 60 * 5, // 5分钟前
            audioUrl: generateAudioUrl("Hi! I'm Emma"),
            duration: 3,
          },
        ])
      }

      return HttpResponse.json({
        code: 200,
        data: {
          sessionId,
          messages: chatSessions.get(sessionId),
          assistant: aiAssistants[0],
        },
        message: 'success',
      })
    }
  ),

  // 发送消息（文本或语音）
  http.post('/chat/send', async ({ request }) => {
    await delay(800)
    const body = (await request.json()) as ChatSendBody

    const { sessionId, content, type, audioUrl, duration } = body

    // 获取或创建会话
    if (!chatSessions.has(sessionId)) {
      chatSessions.set(sessionId, [])
    }
    const messages = chatSessions.get(sessionId)

    // 添加用户消息
    const userMessage = {
      id: generateId(),
      type: 'user' as const,
      content,
      timestamp: Date.now(),
      audioUrl: type === 'voice' ? audioUrl : undefined,
      duration: type === 'voice' ? duration : undefined,
    }
    messages.push(userMessage)

    // 生成AI回复
    await delay(1500) // 模拟AI处理时间
    const aiResponse = generateAIResponse(content)
    const aiMessage = {
      id: generateId(),
      type: 'ai' as const,
      content: aiResponse.text,
      timestamp: Date.now(),
      audioUrl: generateAudioUrl(aiResponse.text),
      duration: Math.floor(aiResponse.text.length / 20), // 简单估算时长
      ...aiResponse,
    }
    messages.push(aiMessage)

    return HttpResponse.json({
      code: 200,
      data: {
        userMessage,
        aiMessage,
      },
      message: 'success',
    })
  }),

  // 语音转文字
  http.post('/chat/speech-to-text', async ({ request }) => {
    await delay(1000)
    const body = (await request.formData()) as unknown as ExtendedFormData
    const _audioFile = body.get('audio')

    // 模拟语音识别结果
    const mockTexts = [
      "Hello, I'd like to practice speaking English.",
      'Can you help me with my pronunciation?',
      'I want to learn more about American culture.',
      'How do you say this in English?',
      "What's the difference between these two words?",
    ]

    return HttpResponse.json({
      code: 200,
      data: {
        text: mockTexts[Math.floor(Math.random() * mockTexts.length)],
        confidence: 0.95,
        language: 'en-US',
      },
      message: 'success',
    })
  }),

  // 文字转语音
  http.post('/chat/text-to-speech', async ({ request }) => {
    await delay(500)
    const body = (await request.json()) as { text: string; voice?: string }

    return HttpResponse.json({
      code: 200,
      data: {
        audioUrl: generateAudioUrl(body.text),
        duration: Math.floor(body.text.length / 15),
        format: 'mp3',
      },
      message: 'success',
    })
  }),

  // 翻译消息
  http.post('/chat/translate', async ({ request }) => {
    await delay(600)
    const body = (await request.json()) as {
      text: string
      from?: string
      to?: string
    }

    // 简单的翻译映射
    const translations: Record<string, string> = {
      "Hi! I'm Emma, your AI English tutor. Let's practice speaking English together! 🦆":
        '嗨！我是Emma，你的AI英语老师。让我们一起练习说英语吧！🦆',
      "That's a great point! Could you elaborate on that?":
        '说得好！你能详细说明一下吗？',
      'Excellent! Your pronunciation is getting better.':
        '太棒了！你的发音越来越好了。',
      'I understand what you mean.': '我明白你的意思。',
      'Great job!': '做得好！',
    }

    const translatedText = translations[body.text] || `[翻译] ${body.text}`

    return HttpResponse.json({
      code: 200,
      data: {
        originalText: body.text,
        translatedText,
        from: body.from || 'en',
        to: body.to || 'zh',
      },
      message: 'success',
    })
  }),

  // 获取纠错和帮助
  http.post('/chat/correction', async ({ request }) => {
    await delay(800)
    const body = (await request.json()) as { text: string; context?: string }

    // 模拟纠错结果
    const corrections = [
      {
        type: 'grammar',
        original: body.text,
        corrected: `${body.text} (corrected)`,
        explanation: 'The verb tense should match the subject.',
        examples: ['I have been studying', 'She has been working'],
      },
      {
        type: 'vocabulary',
        original: body.text,
        suggestion: 'Consider using a more formal expression',
        alternatives: ['Furthermore', 'Additionally', 'Moreover'],
      },
      {
        type: 'pronunciation',
        word: 'pronunciation',
        phonetic: '/prəˌnʌnsiˈeɪʃən/',
        audioUrl: generateAudioUrl('pronunciation'),
        tips: 'Pay attention to the stress on the fourth syllable.',
      },
    ]

    return HttpResponse.json({
      code: 200,
      data: corrections[Math.floor(Math.random() * corrections.length)],
      message: 'success',
    })
  }),

  // 发送表情反馈
  http.post('/chat/feedback', async ({ request }) => {
    await delay(200)
    const body = (await request.json()) as {
      messageId: string
      emoji: string
      sessionId: string
    }

    return HttpResponse.json({
      code: 200,
      data: {
        messageId: body.messageId,
        emoji: body.emoji,
        recorded: true,
      },
      message: 'success',
    })
  }),

  // 获取AI状态
  http.get<ChatParams>('/api/chat/assistant-status/:id', async ({ params }) => {
    await delay(100)

    // 随机模拟不同状态
    const statuses = ['online', 'typing', 'thinking']
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

    return HttpResponse.json({
      code: 200,
      data: {
        assistantId: params.id,
        status: randomStatus,
        lastActive: Date.now(),
      },
      message: 'success',
    })
  }),

  // 获取翻译详情
  http.post('/chat/translation-detail', async ({ request }) => {
    await delay(800)
    const body = (await request.json()) as {
      messageId: string
      content: string
      messageType: 'user' | 'ai'
    }

    // 模拟翻译详情数据
    const translationDetails = [
      {
        original: body.content,
        translation: 'I plan to take a walk in the park',
        pronunciation: {
          planning: { phonetic: '/ˈplænɪŋ/', note: '注意双n的发音' },
          walk: { phonetic: '/wɔːk/', note: '长音o' },
          park: { phonetic: '/pɑːrk/', note: '重音在第一个音节' },
        },
        comparison: {
          userExpression: body.content,
          betterExpression: "I'm planning to go for a walk in the park",
        },
        improvements: [
          '"go for a walk" 比 "take a walk" 更自然地道',
          '"planning" 比 "plan" 更口语化',
          '"in the park" 表示在公园内部活动',
        ],
        vocabulary: [
          { word: 'go for a stroll', meaning: '悠闲散步' },
          { word: 'take a hike', meaning: '徒步' },
          { word: 'wander around', meaning: '四处走走' },
        ],
      },
      {
        original: body.content,
        translation: 'What about your weekend plans?',
        pronunciation: {
          weekend: { phonetic: '/ˈwiːkɛnd/', note: '重音在第一音节' },
          plans: { phonetic: '/plænz/', note: '复数s发z音' },
        },
        comparison: {
          userExpression: body.content,
          betterExpression: 'Do you have any plans for the weekend?',
        },
        improvements: [
          '疑问句更常用 "Do you have" 开头',
          '"for the weekend" 更地道',
          '语调应该上扬表示疑问',
        ],
        vocabulary: [
          { word: 'make plans', meaning: '制定计划' },
          { word: 'weekend getaway', meaning: '周末短途旅行' },
          { word: 'free time', meaning: '空闲时间' },
        ],
      },
    ]

    const result =
      translationDetails[Math.floor(Math.random() * translationDetails.length)]

    return HttpResponse.json({
      code: 200,
      data: result,
      message: 'success',
    })
  }),

  // 获取求助建议
  http.post('/chat/help-suggestion', async ({ request }) => {
    await delay(1000)
    const _body = (await request.json()) as {
      messageId: string
      content: string
    }

    // 模拟求助建议数据
    const helpSuggestions = [
      {
        status: '求助成功! 已为您提供地道表达建议，剩余次数: 2',
        suggestion: {
          recommended: "I'm planning to go for a walk in the park",
          reasons: [
            '"go for a walk" 比 "take a walk" 更自然地道',
            '"planning" 比 "plan" 更口语化',
            '现在进行时表示计划更合适',
          ],
        },
        pronunciation: {
          planning: { phonetic: '/ˈplænɪŋ/', note: '注意双n的发音' },
          walk: { phonetic: '/wɔːk/', note: '长音o' },
          park: { phonetic: '/pɑːrk/', note: '重音在第一个音节' },
        },
      },
      {
        status: '求助成功! 已为您提供地道表达建议，剩余次数: 1',
        suggestion: {
          recommended: 'How was your weekend? Did you do anything interesting?',
          reasons: [
            '"How was..." 比 "What about..." 更自然',
            '添加后续问题显得更关心',
            '使用过去时询问已发生的事情',
          ],
        },
        pronunciation: {
          weekend: { phonetic: '/ˈwiːkɛnd/', note: '重音在第一音节' },
          interesting: { phonetic: '/ˈɪntrəstɪŋ/', note: '注意第一个音节重读' },
        },
      },
    ]

    const result =
      helpSuggestions[Math.floor(Math.random() * helpSuggestions.length)]

    return HttpResponse.json({
      code: 200,
      data: result,
      message: 'success',
    })
  }),

  // 获取推荐话题
  http.get('/chat/suggested-topics', async () => {
    await delay(400)

    const topics = [
      {
        id: '1',
        title: 'Daily Routines',
        description: 'Talk about your daily activities',
        difficulty: 'beginner',
        questions: [
          'What time do you usually wake up?',
          'What do you have for breakfast?',
          'How do you commute to work?',
        ],
      },
      {
        id: '2',
        title: 'Hobbies and Interests',
        description: 'Discuss what you like to do in your free time',
        difficulty: 'intermediate',
        questions: [
          'What are your hobbies?',
          'How did you get interested in it?',
          'How often do you practice?',
        ],
      },
      {
        id: '3',
        title: 'Travel Experiences',
        description: 'Share your travel stories and plans',
        difficulty: 'advanced',
        questions: [
          'What was your most memorable trip?',
          'Where would you like to visit next?',
          'What do you enjoy most about traveling?',
        ],
      },
    ]

    return HttpResponse.json({
      code: 200,
      data: topics,
      message: 'success',
    })
  }),

  // 获取话题分类和具体话题列表（直接路径匹配）
  http.get('/chat/topic-categories', async ({ request }) => {
    console.log('🔧 MSW直接路径拦截到话题分类请求:', request.url)
    console.log('🔧 请求方法:', request.method)
    console.log('🔧 请求头:', Object.fromEntries(request.headers.entries()))
    await delay(300)

    const categories = [
      {
        id: 'casual',
        name: '闲聊话题',
        color: '#7c3aed',
        description: '日常轻松聊天话题',
        topics: [
          '你经历过的文化差异是什么',
          '你上个假期如何放松的',
          '你认为城市发展应该保护老建筑吗',
          '你养过宠物吗',
          '你如何看待在线学习',
          '你最喜欢的电影类型是什么',
          '你平时有什么兴趣爱好',
          '你对环保有什么看法',
          '你喜欢哪种类型的音乐',
          '你觉得现代生活节奏怎么样',
        ],
      },
      {
        id: 'ielts-part1',
        name: 'IELTS Part 1',
        color: '#059669',
        description: '雅思口语第一部分话题',
        topics: [
          '描述你的家乡',
          '谈谈你的工作或学习',
          '你平时的休闲活动',
          '你最喜欢的季节',
          '你的日常作息',
          '谈谈你的朋友',
          '你喜欢的食物',
          '你的购物习惯',
          '你如何使用手机',
          '你对未来的计划',
        ],
      },
      {
        id: 'ielts-part2',
        name: 'IELTS Part 2',
        color: '#dc2626',
        description: '雅思口语第二部分话题',
        topics: [
          '描述一个你熟悉的人',
          '描述一个你喜欢的地方',
          '描述一次难忘的经历',
          '描述你学过的一项技能',
          '描述一本书或电影',
          '描述你的一个目标',
          '描述一次成功的经历',
          '描述你收到的礼物',
          '描述一项运动或活动',
          '描述你想改变的一件事',
        ],
      },
      {
        id: 'business',
        name: '商务英语',
        color: '#f59e0b',
        description: '职场和商务相关话题',
        topics: [
          '介绍你的公司',
          '谈论工作压力',
          '描述团队合作',
          '讨论商务会议',
          '谈论职业发展',
          '描述客户服务',
          '讨论市场趋势',
          '谈论企业文化',
          '描述项目管理',
          '讨论商务礼仪',
        ],
      },
    ]

    return HttpResponse.json({
      code: 200,
      data: categories,
      message: 'success',
    })
  }),

  // 获取话题分类和具体话题列表（支持通配符匹配）
  http.get('*/chat/topic-categories', async ({ request }) => {
    console.log('🔧 MSW通配符拦截到话题分类请求:', request.url)
    console.log('🔧 请求方法:', request.method)
    console.log('🔧 请求头:', Object.fromEntries(request.headers.entries()))
    await delay(300)

    const categories = [
      {
        id: 'casual',
        name: '闲聊话题',
        color: '#7c3aed',
        topics: [
          '你经历过的文化差异是什么',
          '你上个假期如何放松的',
          '你认为城市发展应该保护老建筑吗',
          '你养过宠物吗',
          '你对哪种新兴科技感兴趣',
          '你喜欢和家人一块去旅行吗',
          '你周末一般怎么过',
          '你有没有崇拜的明星',
          '你最近有没有突破自我的事情',
          '你喜欢在家吃饭还是出去吃饭',
        ],
      },
      {
        id: 'ielts_part1',
        name: '雅思Part1',
        color: '#059669',
        topics: [
          'Do you like rainy days?',
          'What do you usually do on weekends?',
          'Do you prefer to live in the city or countryside?',
          'What kind of music do you like?',
          'Do you like cooking?',
          'What is your favorite season?',
          'Do you like taking photos?',
          'How do you usually travel?',
          'Do you like reading books?',
          'What sports do you like?',
        ],
      },
      {
        id: 'ielts_part2',
        name: '雅思Part2',
        color: '#dc2626',
        topics: [
          'Describe a person who inspired you',
          'Describe a place you want to visit',
          'Describe a skill you learned recently',
          'Describe an important decision you made',
          'Describe a memorable journey',
          'Describe your ideal job',
          'Describe a book that influenced you',
          'Describe a traditional festival in your country',
          'Describe a challenge you overcame',
          'Describe your favorite movie',
        ],
      },
      {
        id: 'business',
        name: '商务英语',
        color: '#f59e0b',
        topics: [
          'Tell me about your work experience',
          'How do you handle difficult customers?',
          'Describe a successful project you worked on',
          'What are your career goals?',
          'How do you manage your time effectively?',
          'Describe your ideal working environment',
          'How do you deal with workplace conflicts?',
          'What skills are important for your job?',
          'How do you stay motivated at work?',
          'Describe a presentation you gave',
        ],
      },
    ]

    return HttpResponse.json({
      code: 200,
      data: categories,
      message: 'success',
    })
  }),

  // 选择话题并开始对话（支持通配符匹配）
  http.post('*/chat/select-topic', async ({ request }) => {
    console.log('🔧 MSW拦截到话题选择请求:', request.url)
    await delay(500)
    const body = (await request.json()) as { topic: string; category: string }
    console.log('🔧 选择的话题:', body)

    // 根据不同话题生成对应的开场白
    const topicIntroductions: Record<string, string> = {
      你经历过的文化差异是什么:
        "That's an interesting topic! Cultural differences can be fascinating. Can you tell me about a specific cultural difference you've encountered?",
      你上个假期如何放松的:
        'I love talking about vacations! How did you spend your last holiday? Did you do anything special to relax?',
      'Do you like rainy days?':
        "Rainy days can be quite peaceful or gloomy depending on the person. What's your opinion on rainy weather?",
      'Describe a person who inspired you':
        'This sounds like it will be a meaningful conversation. Can you tell me about someone who has inspired you in your life?',
    }

    const introduction =
      topicIntroductions[body.topic] ||
      `Great choice! Let's talk about "${body.topic}". What are your thoughts on this topic?`

    return HttpResponse.json({
      code: 200,
      data: {
        topic: body.topic,
        category: body.category,
        introduction,
        audioUrl: generateAudioUrl(introduction),
        duration: Math.floor(introduction.length / 15),
      },
      message: 'success',
    })
  }),

  // 获取特定分类的话题列表（直接路径匹配）
  http.get('/chat/topics/:categoryId', async ({ params, request }) => {
    console.log('🔧 MSW直接路径拦截到获取分类话题请求:', params.categoryId)
    console.log('🔧 请求URL:', request.url)
    console.log('🔧 请求方法:', request.method)
    await delay(200)

    const categoryTopics: Record<string, string[]> = {
      casual: [
        '你经历过的文化差异是什么',
        '你上个假期如何放松的',
        '你认为城市发展应该保护老建筑吗',
        '你养过宠物吗',
        '你如何看待在线学习',
        '你最喜欢的电影类型是什么',
        '你平时有什么兴趣爱好',
        '你对环保有什么看法',
        '你喜欢哪种类型的音乐',
        '你觉得现代生活节奏怎么样',
      ],
      'ielts-part1': [
        '描述你的家乡',
        '谈谈你的工作或学习',
        '你平时的休闲活动',
        '你最喜欢的季节',
        '你的日常作息',
        '谈谈你的朋友',
        '你喜欢的食物',
        '你的购物习惯',
        '你如何使用手机',
        '你对未来的计划',
      ],
      'ielts-part2': [
        '描述一个你熟悉的人',
        '描述一个你喜欢的地方',
        '描述一次难忘的经历',
        '描述你学过的一项技能',
        '描述一本书或电影',
        '描述你的一个目标',
        '描述一次成功的经历',
        '描述你收到的礼物',
        '描述一项运动或活动',
        '描述你想改变的一件事',
      ],
      business: [
        '介绍你的公司',
        '谈论工作压力',
        '描述团队合作',
        '讨论商务会议',
        '谈论职业发展',
        '描述客户服务',
        '讨论市场趋势',
        '谈论企业文化',
        '描述项目管理',
        '讨论商务礼仪',
      ],
    }

    const categoryId = params.categoryId as string
    const topics = categoryTopics[categoryId] || []

    console.log('🔧 返回分类话题数据:', {
      categoryId,
      topics: topics.length,
      firstTopic: topics[0],
    })

    return HttpResponse.json({
      code: 200,
      data: {
        categoryId,
        topics,
        total: topics.length,
      },
      message: 'success',
    })
  }),

  // 获取特定分类的话题列表（支持通配符匹配）
  http.get('*/chat/topics/:categoryId', async ({ params, request }) => {
    console.log('🔧 MSW通配符拦截到获取分类话题请求:', params.categoryId)
    console.log('🔧 请求URL:', request.url)
    console.log('🔧 请求方法:', request.method)
    await delay(200)

    const categoryTopics: Record<string, string[]> = {
      casual: [
        '你经历过的文化差异是什么',
        '你上个假期如何放松的',
        '你认为城市发展应该保护老建筑吗',
        '你养过宠物吗',
        '你对哪种新兴科技感兴趣',
        '你喜欢和家人一块去旅行吗',
        '你周末一般怎么过',
        '你有没有崇拜的明星',
        '你最近有没有突破自我的事情',
        '你喜欢在家吃饭还是出去吃饭',
      ],
      ielts_part1: [
        'Do you like rainy days?',
        'What do you usually do on weekends?',
        'Do you prefer to live in the city or countryside?',
        'What kind of music do you like?',
        'Do you like cooking?',
        'What is your favorite season?',
        'Do you like taking photos?',
        'How do you usually travel?',
        'Do you like reading books?',
        'What sports do you like?',
      ],
      ielts_part2: [
        'Describe a person who inspired you',
        'Describe a place you want to visit',
        'Describe a skill you learned recently',
        'Describe an important decision you made',
        'Describe a memorable journey',
        'Describe your ideal job',
        'Describe a book that influenced you',
        'Describe a traditional festival in your country',
        'Describe a challenge you overcame',
        'Describe your favorite movie',
      ],
      business: [
        'Tell me about your work experience',
        'How do you handle difficult customers?',
        'Describe a successful project you worked on',
        'What are your career goals?',
        'How do you manage your time effectively?',
        'Describe your ideal working environment',
        'How do you deal with workplace conflicts?',
        'What skills are important for your job?',
        'How do you stay motivated at work?',
        'Describe a presentation you gave',
      ],
    }

    const topics = categoryTopics[params.categoryId as string] || []

    return HttpResponse.json({
      code: 200,
      data: {
        categoryId: params.categoryId,
        topics,
        total: topics.length,
      },
      message: 'success',
    })
  }),

  // 获取话题详情（包含引导问题和建议）
  http.get('/chat/topic-detail/:topicId', async ({ params }) => {
    console.log('🔧 MSW拦截到话题详情请求:', params.topicId)
    await delay(300)

    const topicDetails: Record<
      string,
      {
        id: string
        title: string
        category: string
        difficulty: string
        estimatedTime: string
        description: string
        guideQuestions: string[]
        vocabulary: { word: string; meaning: string }[]
        tips: string[]
      }
    > = {
      'cultural-differences': {
        id: 'cultural-differences',
        title: '你经历过的文化差异是什么',
        category: 'casual',
        difficulty: 'intermediate',
        estimatedTime: '5-10分钟',
        description: '讨论不同文化背景下的差异和体验',
        guideQuestions: [
          '你在什么情况下遇到了文化差异？',
          '这种差异给你带来了什么感受？',
          '你是如何适应或处理这种差异的？',
          '这种经历对你有什么影响？',
        ],
        vocabulary: [
          { word: 'cultural shock', meaning: '文化冲击' },
          { word: 'adaptation', meaning: '适应' },
          { word: 'tradition', meaning: '传统' },
          { word: 'custom', meaning: '习俗' },
        ],
        tips: [
          '可以分享具体的例子',
          '描述你的感受和想法',
          '谈谈你从中学到了什么',
        ],
      },
      'weekend-activities': {
        id: 'weekend-activities',
        title: '你周末一般怎么过',
        category: 'casual',
        difficulty: 'beginner',
        estimatedTime: '3-5分钟',
        description: '分享你的周末活动和休闲方式',
        guideQuestions: [
          '你通常周末做什么？',
          '你最喜欢哪种周末活动？',
          '你周末会和谁一起度过？',
          '你理想中的周末是什么样的？',
        ],
        vocabulary: [
          { word: 'leisure', meaning: '休闲' },
          { word: 'relaxation', meaning: '放松' },
          { word: 'hobby', meaning: '爱好' },
          { word: 'recreation', meaning: '娱乐' },
        ],
        tips: ['可以描述具体的活动', '分享你的感受', '谈谈这些活动对你的意义'],
      },
    }

    const topicDetail = topicDetails[params.topicId as string] || {
      id: params.topicId,
      title: '话题详情',
      category: 'general',
      difficulty: 'intermediate',
      estimatedTime: '5分钟',
      description: '这是一个有趣的话题，让我们开始讨论吧！',
      guideQuestions: [
        '你对这个话题有什么看法？',
        '你能分享一些相关的经历吗？',
        '这个话题让你想到了什么？',
      ],
      vocabulary: [],
      tips: ['自由表达你的想法', '可以分享个人经历'],
    }

    return HttpResponse.json({
      code: 200,
      data: topicDetail,
      message: 'success',
    })
  }),

  // 获取随机话题（支持通配符匹配）
  http.get('*/chat/random-topic', async ({ request }) => {
    console.log('🔧 MSW拦截到随机话题请求')
    await delay(200)

    // 解析查询参数
    const url = request.url
    const categoryMatch = url.match(/[?&]category=([^&]*)/)
    const category = categoryMatch ? decodeURIComponent(categoryMatch[1]) : null

    const allTopics = {
      casual: [
        '你经历过的文化差异是什么',
        '你上个假期如何放松的',
        '你认为城市发展应该保护老建筑吗',
        '你养过宠物吗',
        '你对哪种新兴科技感兴趣',
      ],
      ielts_part1: [
        'Do you like rainy days?',
        'What do you usually do on weekends?',
        'Do you prefer to live in the city or countryside?',
        'What kind of music do you like?',
        'Do you like cooking?',
      ],
      ielts_part2: [
        'Describe a person who inspired you',
        'Describe a place you want to visit',
        'Describe a skill you learned recently',
        'Describe an important decision you made',
        'Describe a memorable journey',
      ],
      business: [
        'Tell me about your work experience',
        'How do you handle difficult customers?',
        'Describe a successful project you worked on',
        'What are your career goals?',
        'How do you manage your time effectively?',
      ],
    }

    let topics: string[] = []
    if (category && allTopics[category as keyof typeof allTopics]) {
      topics = allTopics[category as keyof typeof allTopics]
    } else {
      // 如果没有指定分类，从所有话题中随机选择
      topics = Object.values(allTopics).flat()
    }

    const randomTopic = topics[Math.floor(Math.random() * topics.length)]

    return HttpResponse.json({
      code: 200,
      data: {
        topic: randomTopic,
        category: category || 'random',
      },
      message: 'success',
    })
  }),

  // 获取话题统计信息
  http.get('/chat/topic-stats', async () => {
    console.log('🔧 MSW拦截到话题统计请求')
    await delay(150)

    return HttpResponse.json({
      code: 200,
      data: {
        totalTopics: 40,
        categories: {
          casual: 10,
          ielts_part1: 10,
          ielts_part2: 10,
          business: 10,
        },
        popularTopics: [
          '你经历过的文化差异是什么',
          'Do you like rainy days?',
          'Describe a person who inspired you',
          'Tell me about your work experience',
        ],
        recentTopics: [
          '你周末一般怎么过',
          'What is your favorite season?',
          'Describe a memorable journey',
          'How do you stay motivated at work?',
        ],
      },
      message: 'success',
    })
  }),
]

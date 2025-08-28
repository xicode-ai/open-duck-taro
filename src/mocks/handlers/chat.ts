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
]

/* eslint-disable no-undef */
import { http, HttpResponse, delay } from 'msw'
import type { ExtendedFormData, TranslateParams } from '../types'

// Mock翻译历史
interface TranslateHistoryItem {
  id: string
  originalText: string
  translatedText: string
  from: string
  to: string
  mode: string
  timestamp: string
  pronunciation?: string | null
  audioUrl: string
  alternativeTranslations: string[]
  examples: Array<{ original: string; translated: string }>
}

const translateHistory: TranslateHistoryItem[] = []

export const translateHandlers = [
  // 文本翻译
  http.post('/api/translate', async ({ request }) => {
    await delay(600)
    const body = (await request.json()) as {
      text: string
      from?: string
      to?: string
      mode?: 'text' | 'voice' | 'image'
    }

    // 简单的翻译模拟
    const translations: Record<string, string> = {
      Hello: '你好',
      'Thank you': '谢谢',
      'Good morning': '早上好',
      'How are you?': '你好吗？',
      你好: 'Hello',
      谢谢: 'Thank you',
      早上好: 'Good morning',
    }

    const translatedText =
      translations[body.text] ||
      (body.from === 'zh'
        ? `[Translation] ${body.text}`
        : `[翻译] ${body.text}`)

    const result = {
      id: `trans-${Date.now()}`,
      originalText: body.text,
      translatedText,
      from: body.from || 'auto',
      to: body.to || (body.from === 'zh' ? 'en' : 'zh'),
      mode: body.mode || 'text',
      timestamp: new Date().toISOString(),
      pronunciation: body.to === 'en' ? '/prəˌnʌnsiˈeɪʃən/' : null,
      audioUrl: `/mock-audio/translation-${Date.now()}.mp3`,
      alternativeTranslations: [
        translatedText + ' (formal)',
        translatedText + ' (casual)',
      ],
      examples: [
        {
          original: `This is how you use "${body.text}"`,
          translated: `这是如何使用 "${translatedText}"`,
        },
      ],
    }

    // 添加到历史
    translateHistory.unshift(result)

    return HttpResponse.json({
      code: 200,
      data: result,
      message: 'success',
    })
  }),

  // 获取翻译历史
  http.get('/api/translate/history', async ({ request }) => {
    await delay(400)
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20')

    const start = (page - 1) * pageSize
    const end = start + pageSize

    return HttpResponse.json({
      code: 200,
      data: {
        list: translateHistory.slice(start, end),
        total: translateHistory.length,
        page,
        pageSize,
      },
      message: 'success',
    })
  }),

  // 删除翻译历史
  http.delete<TranslateParams>(
    '/api/translate/history/:id',
    async ({ params }) => {
      await delay(200)
      const index = translateHistory.findIndex(item => item.id === params.id)

      if (index > -1) {
        translateHistory.splice(index, 1)
      }

      return HttpResponse.json({
        code: 200,
        message: '删除成功',
      })
    }
  ),

  // 清空翻译历史
  http.delete('/api/translate/history', async () => {
    await delay(300)
    translateHistory.length = 0

    return HttpResponse.json({
      code: 200,
      message: '历史已清空',
    })
  }),

  // 收藏翻译
  http.post('/api/translate/favorite', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as { translationId: string }

    return HttpResponse.json({
      code: 200,
      data: {
        favorited: true,
        translationId: body.translationId,
      },
      message: '已收藏',
    })
  }),

  // 获取收藏列表
  http.get('/api/translate/favorites', async () => {
    await delay(400)

    const favorites = translateHistory.slice(0, 5).map(item => ({
      ...item,
      favorited: true,
      favoritedAt: new Date().toISOString(),
    }))

    return HttpResponse.json({
      code: 200,
      data: favorites,
      message: 'success',
    })
  }),

  // 图片翻译
  http.post('/api/translate/image', async ({ request }) => {
    await delay(1000)
    const formData = (await request.formData()) as unknown as ExtendedFormData
    const _image = formData.get('image')

    // 模拟图片文字识别和翻译
    const result = {
      id: `img-trans-${Date.now()}`,
      detectedText: 'Hello World\nWelcome to OpenDuck',
      translatedText: '你好世界\n欢迎来到OpenDuck',
      language: 'en',
      confidence: 0.95,
      regions: [
        {
          text: 'Hello World',
          translation: '你好世界',
          boundingBox: { x: 10, y: 10, width: 100, height: 30 },
        },
        {
          text: 'Welcome to OpenDuck',
          translation: '欢迎来到OpenDuck',
          boundingBox: { x: 10, y: 50, width: 150, height: 30 },
        },
      ],
    }

    return HttpResponse.json({
      code: 200,
      data: result,
      message: 'success',
    })
  }),

  // 语音翻译
  http.post('/api/translate/voice', async ({ request }) => {
    await delay(1200)
    const formData = (await request.formData()) as unknown as ExtendedFormData
    const _audio = formData.get('audio')

    // 模拟语音识别和翻译
    const result = {
      id: `voice-trans-${Date.now()}`,
      recognizedText: 'How are you doing today?',
      translatedText: '你今天过得怎么样？',
      sourceLanguage: 'en',
      targetLanguage: 'zh',
      confidence: 0.92,
      duration: 3.5,
      audioUrl: `/mock-audio/voice-translation-${Date.now()}.mp3`,
    }

    return HttpResponse.json({
      code: 200,
      data: result,
      message: 'success',
    })
  }),

  // 获取支持的语言
  http.get('/api/translate/languages', async () => {
    await delay(200)

    const languages = [
      { code: 'auto', name: '自动检测' },
      { code: 'zh', name: '中文' },
      { code: 'en', name: 'English' },
      { code: 'ja', name: '日本語' },
      { code: 'ko', name: '한국어' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' },
      { code: 'de', name: 'Deutsch' },
      { code: 'ru', name: 'Русский' },
      { code: 'ar', name: 'العربية' },
    ]

    return HttpResponse.json({
      code: 200,
      data: languages,
      message: 'success',
    })
  }),
]

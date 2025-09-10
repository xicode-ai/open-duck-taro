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

    // 根据输入内容返回不同的翻译结果
    let standardTranslation = ''
    let colloquialTranslation = ''
    let comparisonNotes: Array<{
      id: string
      point: string
      standard: string
      colloquial: string
      explanation: string
    }> = []
    let relatedPhrases: Array<{
      id: string
      chinese: string
      english: string
      pinyin?: string
    }> = []

    // 检查输入内容并生成相应的翻译
    if (
      body.text.includes('咖啡') ||
      body.text.toLowerCase().includes('coffee')
    ) {
      standardTranslation =
        body.from === 'zh'
          ? "I want to go to a coffee shop to buy a latte, but I don't know how to order in English."
          : '我想去咖啡店买一杯拿铁，但不知道怎么用英语点单。'

      colloquialTranslation =
        body.from === 'zh'
          ? "Hey, I'd like to grab a latte from the coffee shop, but I'm not sure how to order it in English."
          : '嘿，我想从咖啡店来一杯拿铁，但不太确定怎么用英语点单。'

      comparisonNotes =
        body.from === 'zh'
          ? [
              {
                id: '1',
                point: '"grab a latte"',
                standard: '"buy a latte"',
                colloquial: '"grab a latte"',
                explanation: '"grab a latte" 比 "buy a latte" 更口语化，更自然',
              },
              {
                id: '2',
                point: '"I\'m not sure"',
                standard: '"I don\'t know"',
                colloquial: '"I\'m not sure"',
                explanation:
                  '"I\'m not sure" 比 "I don\'t know" 更礼貌，更委婉',
              },
            ]
          : [
              {
                id: '1',
                point: '嘿',
                standard: '你好',
                colloquial: '嘿',
                explanation: '"嘿" 比 "你好" 更随意亲近，适合朋友间使用',
              },
              {
                id: '2',
                point: '来一杯',
                standard: '买一杯',
                colloquial: '来一杯',
                explanation: '"来一杯" 是更地道的中文表达，"买一杯" 稍显生硬',
              },
            ]

      relatedPhrases = [
        {
          id: '1',
          chinese: '请给我一杯拿铁，好吗？',
          english: 'Can I have a latte, please?',
          pinyin: 'qǐng gěi wǒ yī bēi ná tiě, hǎo ma?',
        },
        {
          id: '2',
          chinese: '我想点一杯咖啡。',
          english: "I'd like to order a coffee.",
          pinyin: 'wǒ xiǎng diǎn yī bēi kā fēi',
        },
        {
          id: '3',
          chinese: '你有什么推荐吗？',
          english: 'What would you recommend?',
          pinyin: 'nǐ yǒu shén me tuī jiàn ma?',
        },
      ]
    } else if (
      body.text.includes('你好') ||
      body.text.toLowerCase().includes('hello')
    ) {
      standardTranslation =
        body.from === 'zh' ? 'Hello, nice to meet you.' : '你好，很高兴认识你。'

      colloquialTranslation =
        body.from === 'zh'
          ? 'Hey there! Great to meet you!'
          : '嗨！很高兴见到你！'

      comparisonNotes =
        body.from === 'zh'
          ? [
              {
                id: '1',
                point: '"Hey there"',
                standard: '"Hello"',
                colloquial: '"Hey there"',
                explanation: '"Hey there" 比 "Hello" 更随意亲切',
              },
              {
                id: '2',
                point: '"Great to meet you"',
                standard: '"nice to meet you"',
                colloquial: '"Great to meet you"',
                explanation: '"Great to meet you" 比 "nice to meet you" 更热情',
              },
            ]
          : [
              {
                id: '1',
                point: '嗨',
                standard: '你好',
                colloquial: '嗨',
                explanation: '"嗨" 比 "你好" 更随意亲近',
              },
              {
                id: '2',
                point: '很高兴见到你',
                standard: '很高兴认识你',
                colloquial: '很高兴见到你',
                explanation: '"很高兴见到你" 比 "很高兴认识你" 更直接热情',
              },
            ]

      relatedPhrases = [
        {
          id: '1',
          chinese: '早上好',
          english: 'Good morning',
          pinyin: 'zǎo shàng hǎo',
        },
        {
          id: '2',
          chinese: '晚上好',
          english: 'Good evening',
          pinyin: 'wǎn shàng hǎo',
        },
        {
          id: '3',
          chinese: '你好吗？',
          english: 'How are you?',
          pinyin: 'nǐ hǎo ma?',
        },
      ]
    } else {
      // 默认翻译
      standardTranslation =
        body.from === 'zh'
          ? `[Standard Translation] ${body.text}`
          : `[标准翻译] ${body.text}`

      colloquialTranslation =
        body.from === 'zh'
          ? `[Colloquial Translation] ${body.text}`
          : `[口语翻译] ${body.text}`

      // 添加默认对比说明
      comparisonNotes =
        body.from === 'zh'
          ? [
              {
                id: '1',
                point: 'Colloquial',
                standard: 'Standard Translation',
                colloquial: 'Colloquial Translation',
                explanation:
                  'Colloquial Translation 比 Standard Translation 更自然口语化',
              },
            ]
          : [
              {
                id: '1',
                point: '口语翻译',
                standard: '标准翻译',
                colloquial: '口语翻译',
                explanation: '口语翻译 比 标准翻译 更自然生动',
              },
            ]

      relatedPhrases = [
        {
          id: '1',
          chinese: '谢谢你',
          english: 'Thank you',
          pinyin: 'xiè xiè nǐ',
        },
        {
          id: '2',
          chinese: '不客气',
          english: "You're welcome",
          pinyin: 'bù kè qì',
        },
      ]
    }

    const result = {
      id: `trans-${Date.now()}`,
      originalText: body.text,
      standardTranslation,
      colloquialTranslation,
      comparisonNotes: comparisonNotes.length > 0 ? comparisonNotes : undefined,
      relatedPhrases,
      from: body.from || 'auto',
      to: body.to || (body.from === 'zh' ? 'en' : 'zh'),
      mode: body.mode || 'text',
      timestamp: new Date().toISOString(),
      audioUrl: `/mock-audio/translation-${Date.now()}.mp3`,
    }

    // 添加到历史（简化版）
    translateHistory.unshift({
      ...result,
      translatedText: standardTranslation,
      pronunciation: body.to === 'en' ? '/prəˌnʌnsiˈeɪʃən/' : null,
      alternativeTranslations: [standardTranslation, colloquialTranslation],
      examples: [],
    })

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

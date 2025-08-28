/* eslint-disable no-undef */
import { http, HttpResponse, delay } from 'msw'
import type { BookParams, WordParams } from '../types'

// Mock词汇数据
const vocabularyData = {
  dailyWords: [
    {
      id: 'word-001',
      word: 'perseverance',
      pronunciation: '/ˌpɜːrsɪˈvɪərəns/',
      meaning: '坚持不懈，毅力',
      example: 'Success requires perseverance and hard work.',
      exampleTranslation: '成功需要坚持不懈和努力工作。',
      audioUrl: '/mock-audio/perseverance.mp3',
      difficulty: 'advanced',
      tags: ['character', 'positive'],
      learned: false,
      reviewCount: 0,
    },
    {
      id: 'word-002',
      word: 'accomplish',
      pronunciation: '/əˈkʌmplɪʃ/',
      meaning: '完成，实现',
      example: 'She accomplished her goal of learning English.',
      exampleTranslation: '她实现了学习英语的目标。',
      audioUrl: '/mock-audio/accomplish.mp3',
      difficulty: 'intermediate',
      tags: ['action', 'achievement'],
      learned: false,
      reviewCount: 0,
    },
    {
      id: 'word-003',
      word: 'opportunity',
      pronunciation: '/ˌɒpəˈtjuːnəti/',
      meaning: '机会，时机',
      example: 'This is a great opportunity to practice English.',
      exampleTranslation: '这是练习英语的好机会。',
      audioUrl: '/mock-audio/opportunity.mp3',
      difficulty: 'intermediate',
      tags: ['noun', 'common'],
      learned: true,
      reviewCount: 3,
    },
  ],

  wordBooks: [
    {
      id: 'book-001',
      name: '日常对话3000词',
      description: '最常用的日常对话词汇',
      wordCount: 3000,
      learnedCount: 523,
      category: 'daily',
      difficulty: 'beginner',
      coverImage: '📘',
    },
    {
      id: 'book-002',
      name: '商务英语核心词汇',
      description: '职场和商务场合必备词汇',
      wordCount: 2000,
      learnedCount: 186,
      category: 'business',
      difficulty: 'intermediate',
      coverImage: '💼',
    },
    {
      id: 'book-003',
      name: '托福雅思高频词',
      description: '出国考试高频词汇',
      wordCount: 5000,
      learnedCount: 0,
      category: 'exam',
      difficulty: 'advanced',
      coverImage: '🎓',
    },
  ],
}

export const vocabularyHandlers = [
  // 获取每日词汇
  http.get('/api/vocabulary/daily', async ({ request }) => {
    await delay(500)
    const url = new URL(request.url)
    const date =
      url.searchParams.get('date') || new Date().toISOString().split('T')[0]

    return HttpResponse.json({
      code: 200,
      data: {
        date,
        words: vocabularyData.dailyWords,
        completed: vocabularyData.dailyWords.filter(w => w.learned).length,
        total: vocabularyData.dailyWords.length,
      },
      message: 'success',
    })
  }),

  // 获取词汇书列表
  http.get('/api/vocabulary/books', async () => {
    await delay(400)

    return HttpResponse.json({
      code: 200,
      data: vocabularyData.wordBooks,
      message: 'success',
    })
  }),

  // 获取词汇书详情
  http.get<BookParams>('/api/vocabulary/books/:bookId', async ({ params }) => {
    await delay(500)
    const book = vocabularyData.wordBooks.find(b => b.id === params.bookId)

    if (!book) {
      return HttpResponse.json(
        { code: 404, message: '词汇书不存在' },
        { status: 404 }
      )
    }

    // 生成词汇列表
    const words = Array.from({ length: 20 }, (_, i) => ({
      id: `word-book-${i}`,
      word: `word${i + 1}`,
      pronunciation: `/wɜːrd/`,
      meaning: `单词${i + 1}的含义`,
      learned: i < 10,
      difficulty: ['easy', 'medium', 'hard'][i % 3],
    }))

    return HttpResponse.json({
      code: 200,
      data: {
        ...book,
        words,
        chapters: [
          { id: 'ch1', name: '基础篇', wordCount: 500, completed: 186 },
          { id: 'ch2', name: '进阶篇', wordCount: 800, completed: 237 },
          { id: 'ch3', name: '高级篇', wordCount: 1200, completed: 100 },
        ],
      },
      message: 'success',
    })
  }),

  // 标记单词已学习
  http.post('/api/vocabulary/learn', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as {
      wordId: string
      bookId?: string
    }

    // 更新学习状态
    const word = vocabularyData.dailyWords.find(w => w.id === body.wordId)
    if (word) {
      word.learned = true
      word.reviewCount += 1
    }

    return HttpResponse.json({
      code: 200,
      data: {
        learned: true,
        pointsEarned: 5,
        nextReviewDate: new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      message: '已标记为已学习',
    })
  }),

  // 获取单词详情
  http.get<WordParams>('/api/vocabulary/word/:wordId', async ({ params }) => {
    await delay(400)
    const word = vocabularyData.dailyWords.find(w => w.id === params.wordId)

    if (!word) {
      return HttpResponse.json(
        { code: 404, message: '单词不存在' },
        { status: 404 }
      )
    }

    // 添加更多详细信息
    const detailedWord = {
      ...word,
      synonyms: ['persistence', 'determination', 'tenacity'],
      antonyms: ['giving up', 'quitting'],
      relatedWords: ['persevere', 'persevering', 'perseverant'],
      moreExamples: [
        {
          sentence: 'His perseverance paid off in the end.',
          translation: '他的坚持最终得到了回报。',
        },
        {
          sentence: 'It takes perseverance to master a new language.',
          translation: '掌握一门新语言需要毅力。',
        },
      ],
      etymology: 'From Latin perseverare, meaning "to persist"',
      collocations: [
        'show perseverance',
        'require perseverance',
        'lack perseverance',
      ],
    }

    return HttpResponse.json({
      code: 200,
      data: detailedWord,
      message: 'success',
    })
  }),

  // 搜索单词
  http.get('/api/vocabulary/search', async ({ request }) => {
    await delay(600)
    const url = new URL(request.url)
    const query = url.searchParams.get('q') || ''

    // 模拟搜索结果
    const results = [
      {
        word: query,
        pronunciation: '/prəˌnʌnsiˈeɪʃən/',
        meaning: '搜索结果的含义',
        quickDefinition: '简要定义',
        partOfSpeech: 'noun',
      },
      {
        word: query + 'ing',
        pronunciation: '/prəˌnʌnsiˈeɪʃənɪŋ/',
        meaning: '相关词汇',
        quickDefinition: '动名词形式',
        partOfSpeech: 'gerund',
      },
    ]

    return HttpResponse.json({
      code: 200,
      data: {
        query,
        results,
        suggestions: ['suggestion1', 'suggestion2'],
      },
      message: 'success',
    })
  }),

  // 获取复习列表
  http.get('/api/vocabulary/review', async () => {
    await delay(500)

    const reviewWords = vocabularyData.dailyWords
      .filter(w => w.learned)
      .map(w => ({
        ...w,
        lastReviewedAt: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        nextReviewAt: new Date(
          Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        masteryLevel: Math.floor(Math.random() * 5) + 1,
      }))

    return HttpResponse.json({
      code: 200,
      data: {
        todayReview: reviewWords.slice(0, 5),
        upcomingReview: reviewWords.slice(5, 10),
        overdue: reviewWords.slice(10, 12),
      },
      message: 'success',
    })
  }),

  // 提交复习结果
  http.post('/api/vocabulary/review/submit', async ({ request }) => {
    await delay(400)
    const body = (await request.json()) as {
      wordId: string
      correct: boolean
      responseTime: number
    }

    return HttpResponse.json({
      code: 200,
      data: {
        masteryLevel: body.correct ? 4 : 2,
        nextReviewDate: new Date(
          Date.now() + (body.correct ? 3 : 1) * 24 * 60 * 60 * 1000
        ).toISOString(),
        pointsEarned: body.correct ? 3 : 1,
      },
      message: '复习结果已记录',
    })
  }),

  // 获取学习进度统计
  http.get('/api/vocabulary/progress', async () => {
    await delay(500)

    return HttpResponse.json({
      code: 200,
      data: {
        totalWords: 523,
        todayWords: 12,
        weekWords: 68,
        monthWords: 234,
        masteredWords: 186,
        reviewingWords: 237,
        newWords: 100,
        streakDays: 7,
        accuracyRate: 0.85,
        averageResponseTime: 3.2, // 秒
        wordsByDifficulty: {
          beginner: 234,
          intermediate: 189,
          advanced: 100,
        },
        wordsByCategory: {
          daily: 200,
          business: 150,
          academic: 100,
          exam: 73,
        },
      },
      message: 'success',
    })
  }),
]

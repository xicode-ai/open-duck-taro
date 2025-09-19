import { http, HttpResponse, delay } from 'msw'
import type { BookParams, WordParams } from '../types'
import type { WordKnowledgeLevel } from '@/types'

// Mock词汇数据
const vocabularyData = {
  // 学习阶段数据
  learningStages: [
    {
      id: 'beginner',
      name: '萌芽期',
      ageRange: '3-6岁',
      icon: '🌱',
      bgColor: '#dcfce7',
      isPremium: false,
      description: '适合初学者的基础词汇',
      wordCount: 500,
    },
    {
      id: 'foundation',
      name: '基础期',
      ageRange: '6-12岁',
      icon: '📚',
      bgColor: '#dbeafe',
      isPremium: false,
      description: '小学阶段常用词汇',
      wordCount: 1200,
    },
    {
      id: 'development',
      name: '发展期',
      ageRange: '12-15岁',
      icon: '🚀',
      bgColor: '#e0e7ff',
      isPremium: true,
      description: '中学阶段进阶词汇',
      wordCount: 2000,
    },
    {
      id: 'acceleration',
      name: '加速期',
      ageRange: '15-18岁',
      icon: '⚡',
      bgColor: '#fef3c7',
      isPremium: true,
      description: '高中阶段重点词汇',
      wordCount: 3500,
    },
    {
      id: 'mastery',
      name: '精通期',
      ageRange: '18-30岁',
      icon: '🏆',
      bgColor: '#fbbf24',
      isPremium: true,
      description: '大学和职场核心词汇',
      wordCount: 5000,
    },
    {
      id: 'expert',
      name: '大师期',
      ageRange: '30岁+',
      icon: '🧘',
      bgColor: '#c7d2fe',
      isPremium: true,
      description: '专业领域高级词汇',
      wordCount: 8000,
    },
  ],

  // 学习说明数据
  studyNotes: [
    {
      id: 'note-1',
      icon: '✅',
      text: '萌芽期和基础期免费开放，适合初学者',
      type: 'info',
    },
    {
      id: 'note-2',
      icon: '👑',
      text: '其他阶段需要开通会员，解锁更多高级功能',
      type: 'premium',
    },
    {
      id: 'note-3',
      icon: '📖',
      text: '每个阶段都有针对性的词汇和例句',
      type: 'feature',
    },
    {
      id: 'note-4',
      icon: '🎯',
      text: '采用语境学习法，提高记忆效果',
      type: 'method',
    },
  ],
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

  // 分阶段单词学习数据
  studyWords: {
    beginner: [
      {
        id: 'word-beginner-001',
        word: 'apple',
        pronunciation: { us: '/ˈæpl/', uk: '/ˈæpl/' },
        meaning: '苹果',
        partOfSpeech: 'noun',
        example: {
          english: 'I eat an apple every day.',
          chinese: '我每天吃一个苹果。',
        },
        level: 'preschool',
        audioUrl: {
          us: '/mock-audio/apple-us.mp3',
          uk: '/mock-audio/apple-uk.mp3',
        },
        difficulty: 'easy',
        tags: ['food', 'fruit'],
        stage: 'beginner',
        isFavorited: false,
      },
      {
        id: 'word-beginner-002',
        word: 'book',
        pronunciation: { us: '/bʊk/', uk: '/bʊk/' },
        meaning: '书，书本',
        partOfSpeech: 'noun',
        example: {
          english: 'She is reading a book.',
          chinese: '她正在读一本书。',
        },
        level: 'preschool',
        audioUrl: {
          us: '/mock-audio/book-us.mp3',
          uk: '/mock-audio/book-uk.mp3',
        },
        difficulty: 'easy',
        tags: ['education', 'object'],
        stage: 'beginner',
        isFavorited: false,
      },
      {
        id: 'word-beginner-003',
        word: 'cat',
        pronunciation: { us: '/kæt/', uk: '/kæt/' },
        meaning: '猫',
        partOfSpeech: 'noun',
        example: {
          english: 'The cat is sleeping on the sofa.',
          chinese: '猫正在沙发上睡觉。',
        },
        level: 'preschool',
        audioUrl: {
          us: '/mock-audio/cat-us.mp3',
          uk: '/mock-audio/cat-uk.mp3',
        },
        difficulty: 'easy',
        tags: ['animal', 'pet'],
        stage: 'beginner',
        isFavorited: true,
      },
    ],
    expert: [
      {
        id: 'word-expert-001',
        word: 'immense',
        pronunciation: { us: '/ɪˈmens/', uk: '/ɪˈmens/' },
        meaning: '巨大的，极大的',
        partOfSpeech: 'adjective',
        example: {
          english: 'He inherited an immense fortune.',
          chinese: '他继承了巨额财富。',
        },
        level: 'master',
        audioUrl: {
          us: '/mock-audio/immense-us.mp3',
          uk: '/mock-audio/immense-uk.mp3',
        },
        difficulty: 'hard',
        tags: ['descriptive', 'advanced'],
        stage: 'expert',
        isFavorited: false,
      },
      {
        id: 'word-expert-002',
        word: 'profound',
        pronunciation: { us: '/prəˈfaʊnd/', uk: '/prəˈfaʊnd/' },
        meaning: '深刻的，深奥的',
        partOfSpeech: 'adjective',
        example: {
          english: 'She had a profound impact on my life.',
          chinese: '她对我的生活产生了深刻的影响。',
        },
        level: 'master',
        audioUrl: {
          us: '/mock-audio/profound-us.mp3',
          uk: '/mock-audio/profound-uk.mp3',
        },
        difficulty: 'hard',
        tags: ['descriptive', 'advanced'],
        stage: 'expert',
        isFavorited: false,
      },
      {
        id: 'word-expert-003',
        word: 'sophisticated',
        pronunciation: { us: '/səˈfɪstɪkeɪtɪd/', uk: '/səˈfɪstɪkeɪtɪd/' },
        meaning: '复杂的，精密的',
        partOfSpeech: 'adjective',
        example: {
          english: 'This is a sophisticated piece of equipment.',
          chinese: '这是一件精密的设备。',
        },
        level: 'master',
        audioUrl: {
          us: '/mock-audio/sophisticated-us.mp3',
          uk: '/mock-audio/sophisticated-uk.mp3',
        },
        difficulty: 'hard',
        tags: ['descriptive', 'advanced'],
        stage: 'expert',
        isFavorited: true,
      },
    ],
  },

  // 学习历史记录
  studyHistory: [
    {
      id: 'history-001',
      wordId: 'word-beginner-003',
      word: 'cat',
      meaning: '猫',
      knowledgeLevel: 'known' as WordKnowledgeLevel,
      studiedAt: '2024-01-20T09:30:00Z',
      stage: 'beginner',
      isFavorited: true,
      responseTime: 2500,
    },
    {
      id: 'history-002',
      wordId: 'word-beginner-002',
      word: 'book',
      meaning: '书，书本',
      knowledgeLevel: 'vague' as WordKnowledgeLevel,
      studiedAt: '2024-01-20T09:25:00Z',
      stage: 'beginner',
      isFavorited: false,
      responseTime: 4200,
    },
    {
      id: 'history-003',
      wordId: 'word-beginner-001',
      word: 'apple',
      meaning: '苹果',
      knowledgeLevel: 'known' as WordKnowledgeLevel,
      studiedAt: '2024-01-20T09:20:00Z',
      stage: 'beginner',
      isFavorited: false,
      responseTime: 1800,
    },
    {
      id: 'history-004',
      wordId: 'word-expert-003',
      word: 'sophisticated',
      meaning: '复杂的，精密的',
      knowledgeLevel: 'vague' as WordKnowledgeLevel,
      studiedAt: '2024-01-19T15:45:00Z',
      stage: 'expert',
      isFavorited: true,
      responseTime: 6500,
    },
    {
      id: 'history-005',
      wordId: 'word-expert-001',
      word: 'immense',
      meaning: '巨大的，极大的',
      knowledgeLevel: 'known' as WordKnowledgeLevel,
      studiedAt: '2024-01-19T15:30:00Z',
      stage: 'expert',
      isFavorited: false,
      responseTime: 3200,
    },
  ],

  // 今日学习进度
  dailyProgress: {
    date: '2024-01-20',
    studiedWords: 12,
    masteredWords: 8,
    continuousDays: 5,
    targetWords: 20,
  },
}

export const vocabularyHandlers = [
  // 获取学习阶段列表
  http.get('/api/vocabulary/stages', async () => {
    await delay(400)

    return HttpResponse.json({
      code: 200,
      data: vocabularyData.learningStages,
      message: 'success',
    })
  }),

  // 获取学习说明
  http.get('/api/vocabulary/study-notes', async () => {
    await delay(300)

    return HttpResponse.json({
      code: 200,
      data: vocabularyData.studyNotes,
      message: 'success',
    })
  }),
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

  // ===== 新增：单词学习相关API =====

  // 获取单词学习列表（根据阶段）
  http.get('/api/vocabulary/study-words/:stage', async ({ params }) => {
    await delay(600)
    const { stage } = params

    const stageWords =
      vocabularyData.studyWords[
        stage as keyof typeof vocabularyData.studyWords
      ] || []

    // 过滤掉已经认识的单词（模拟认识的单词不再出现）
    const studiedWordIds = vocabularyData.studyHistory
      .filter(h => h.knowledgeLevel === 'known')
      .map(h => h.wordId)

    const availableWords = stageWords.filter(
      word => !studiedWordIds.includes(word.id)
    )

    return HttpResponse.json({
      code: 200,
      data: {
        stage,
        words: availableWords,
        totalWords: stageWords.length,
        remainingWords: availableWords.length,
      },
      message: 'success',
    })
  }),

  // 获取单个学习单词详情
  http.get('/api/vocabulary/study-word/:wordId', async ({ params }) => {
    await delay(300)
    const { wordId } = params

    // 在所有阶段中查找单词
    let word = null
    for (const stageWords of Object.values(vocabularyData.studyWords)) {
      word = stageWords.find(w => w.id === wordId)
      if (word) break
    }

    if (!word) {
      return HttpResponse.json(
        { code: 404, message: '单词不存在' },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      code: 200,
      data: word,
      message: 'success',
    })
  }),

  // 提交单词学习记录
  http.post('/api/vocabulary/study-record', async ({ request }) => {
    await delay(400)
    const body = (await request.json()) as {
      wordId: string
      knowledgeLevel: WordKnowledgeLevel
      stage: string
      responseTime?: number
    }

    // 创建学习记录
    const record = {
      id: `history-${Date.now()}`,
      wordId: body.wordId,
      word: '', // 需要从词汇数据中获取
      meaning: '',
      knowledgeLevel: body.knowledgeLevel,
      studiedAt: new Date().toISOString(),
      stage: body.stage,
      isFavorited: false,
      responseTime:
        body.responseTime || Math.floor(Math.random() * 5000) + 1000,
    }

    // 找到对应的单词信息
    for (const stageWords of Object.values(vocabularyData.studyWords)) {
      const word = stageWords.find(w => w.id === body.wordId)
      if (word) {
        record.word = word.word
        record.meaning = word.meaning
        record.isFavorited = word.isFavorited || false
        break
      }
    }

    // 添加到历史记录
    vocabularyData.studyHistory.unshift(record)

    // 更新今日进度
    vocabularyData.dailyProgress.studiedWords += 1
    if (body.knowledgeLevel === 'known') {
      vocabularyData.dailyProgress.masteredWords += 1
    }

    return HttpResponse.json({
      code: 200,
      data: {
        record,
        pointsEarned: body.knowledgeLevel === 'known' ? 10 : 5,
        nextWord: null, // 下一个单词信息
      },
      message: '学习记录已保存',
    })
  }),

  // 获取学习历史记录（分页）
  http.get('/api/vocabulary/study-history', async ({ request }) => {
    await delay(500)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 10
    const type = url.searchParams.get('type') // 'all' | 'favorites'

    let filteredHistory = vocabularyData.studyHistory
    if (type === 'favorites') {
      filteredHistory = vocabularyData.studyHistory.filter(h => h.isFavorited)
    }

    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedList = filteredHistory.slice(startIndex, endIndex)

    return HttpResponse.json({
      code: 200,
      data: {
        list: paginatedList,
        total: filteredHistory.length,
        page,
        pageSize,
        hasMore: endIndex < filteredHistory.length,
      },
      message: 'success',
    })
  }),

  // 获取今日学习进度
  http.get('/api/vocabulary/daily-progress', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const date =
      url.searchParams.get('date') || new Date().toISOString().split('T')[0]

    // 如果查询的不是今天，模拟返回历史数据
    let progress = vocabularyData.dailyProgress
    if (date !== '2024-01-20') {
      progress = {
        date,
        studiedWords: Math.floor(Math.random() * 25),
        masteredWords: Math.floor(Math.random() * 15),
        continuousDays: Math.floor(Math.random() * 30),
        targetWords: 20,
      }
    }

    return HttpResponse.json({
      code: 200,
      data: progress,
      message: 'success',
    })
  }),

  // 切换单词收藏状态
  http.post('/api/vocabulary/toggle-favorite', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as {
      wordId: string
      isFavorited: boolean
    }

    // 更新单词的收藏状态
    for (const stageWords of Object.values(vocabularyData.studyWords)) {
      const word = stageWords.find(w => w.id === body.wordId)
      if (word) {
        word.isFavorited = body.isFavorited
        break
      }
    }

    // 更新历史记录中的收藏状态
    const historyRecord = vocabularyData.studyHistory.find(
      h => h.wordId === body.wordId
    )
    if (historyRecord) {
      historyRecord.isFavorited = body.isFavorited
    }

    return HttpResponse.json({
      code: 200,
      data: {
        wordId: body.wordId,
        isFavorited: body.isFavorited,
      },
      message: body.isFavorited ? '已添加到收藏' : '已取消收藏',
    })
  }),

  // 获取收藏单词列表
  http.get('/api/vocabulary/favorites', async ({ request }) => {
    await delay(400)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 10

    // 从所有阶段中找到收藏的单词
    const favoriteWords: typeof vocabularyData.studyWords.beginner = []
    for (const stageWords of Object.values(vocabularyData.studyWords)) {
      const stageFavorites = stageWords.filter(w => w.isFavorited)
      favoriteWords.push(...stageFavorites)
    }

    // 按收藏时间倒序排序（模拟）
    favoriteWords.sort((a, b) => b.id.localeCompare(a.id))

    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedList = favoriteWords.slice(startIndex, endIndex)

    return HttpResponse.json({
      code: 200,
      data: {
        list: paginatedList,
        total: favoriteWords.length,
        page,
        pageSize,
        hasMore: endIndex < favoriteWords.length,
      },
      message: 'success',
    })
  }),
]

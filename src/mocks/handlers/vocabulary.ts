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
      // 20个初学者单词
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
        isFavorited: false,
      },
      {
        id: 'word-beginner-004',
        word: 'dog',
        pronunciation: { us: '/dɔːɡ/', uk: '/dɒɡ/' },
        meaning: '狗',
        partOfSpeech: 'noun',
        example: {
          english: 'The dog is running in the park.',
          chinese: '狗在公园里跑步。',
        },
        level: 'preschool',
        audioUrl: {
          us: '/mock-audio/dog-us.mp3',
          uk: '/mock-audio/dog-uk.mp3',
        },
        difficulty: 'easy',
        tags: ['animal', 'pet'],
        stage: 'beginner',
        isFavorited: false,
      },
      {
        id: 'word-beginner-005',
        word: 'water',
        pronunciation: { us: '/ˈwɔːtər/', uk: '/ˈwɔːtə(r)/' },
        meaning: '水',
        partOfSpeech: 'noun',
        example: {
          english: 'Please give me a glass of water.',
          chinese: '请给我一杯水。',
        },
        level: 'preschool',
        audioUrl: {
          us: '/mock-audio/water-us.mp3',
          uk: '/mock-audio/water-uk.mp3',
        },
        difficulty: 'easy',
        tags: ['drink', 'basic'],
        stage: 'beginner',
        isFavorited: false,
      },
      {
        id: 'word-beginner-006',
        word: 'house',
        pronunciation: { us: '/haʊs/', uk: '/haʊs/' },
        meaning: '房子',
        partOfSpeech: 'noun',
        example: {
          english: 'This is my house.',
          chinese: '这是我的房子。',
        },
        level: 'preschool',
        audioUrl: {
          us: '/mock-audio/house-us.mp3',
          uk: '/mock-audio/house-uk.mp3',
        },
        difficulty: 'easy',
        tags: ['building', 'home'],
        stage: 'beginner',
        isFavorited: false,
      },
      {
        id: 'word-beginner-007',
        word: 'car',
        pronunciation: { us: '/kɑːr/', uk: '/kɑː(r)/' },
        meaning: '汽车',
        partOfSpeech: 'noun',
        example: {
          english: 'My father drives a red car.',
          chinese: '我爸爸开一辆红色的汽车。',
        },
        level: 'preschool',
        audioUrl: {
          us: '/mock-audio/car-us.mp3',
          uk: '/mock-audio/car-uk.mp3',
        },
        difficulty: 'easy',
        tags: ['transportation', 'vehicle'],
        stage: 'beginner',
        isFavorited: false,
      },
      {
        id: 'word-beginner-008',
        word: 'sun',
        pronunciation: { us: '/sʌn/', uk: '/sʌn/' },
        meaning: '太阳',
        partOfSpeech: 'noun',
        example: {
          english: 'The sun is shining brightly.',
          chinese: '太阳照耀得很明亮。',
        },
        level: 'preschool',
        audioUrl: {
          us: '/mock-audio/sun-us.mp3',
          uk: '/mock-audio/sun-uk.mp3',
        },
        difficulty: 'easy',
        tags: ['nature', 'weather'],
        stage: 'beginner',
        isFavorited: false,
      },
      {
        id: 'word-beginner-009',
        word: 'tree',
        pronunciation: { us: '/triː/', uk: '/triː/' },
        meaning: '树',
        partOfSpeech: 'noun',
        example: {
          english: 'There is a big tree in the garden.',
          chinese: '花园里有一棵大树。',
        },
        level: 'preschool',
        audioUrl: {
          us: '/mock-audio/tree-us.mp3',
          uk: '/mock-audio/tree-uk.mp3',
        },
        difficulty: 'easy',
        tags: ['nature', 'plant'],
        stage: 'beginner',
        isFavorited: false,
      },
      {
        id: 'word-beginner-010',
        word: 'bird',
        pronunciation: { us: '/bɜːrd/', uk: '/bɜːd/' },
        meaning: '鸟',
        partOfSpeech: 'noun',
        example: {
          english: 'I can see a bird flying in the sky.',
          chinese: '我能看到一只鸟在天空中飞翔。',
        },
        level: 'preschool',
        audioUrl: {
          us: '/mock-audio/bird-us.mp3',
          uk: '/mock-audio/bird-uk.mp3',
        },
        difficulty: 'easy',
        tags: ['animal', 'nature'],
        stage: 'beginner',
        isFavorited: false,
      },
      {
        id: 'word-beginner-011',
        word: 'fish',
        pronunciation: { us: '/fɪʃ/', uk: '/fɪʃ/' },
        meaning: '鱼',
        partOfSpeech: 'noun',
        example: {
          english: 'There are many fish in the sea.',
          chinese: '海里有很多鱼。',
        },
        level: 'preschool',
        audioUrl: {
          us: '/mock-audio/fish-us.mp3',
          uk: '/mock-audio/fish-uk.mp3',
        },
        difficulty: 'easy',
        tags: ['animal', 'sea'],
        stage: 'beginner',
        isFavorited: false,
      },
      {
        id: 'word-beginner-012',
        word: 'milk',
        pronunciation: { us: '/mɪlk/', uk: '/mɪlk/' },
        meaning: '牛奶',
        partOfSpeech: 'noun',
        example: {
          english: 'I drink milk every morning.',
          chinese: '我每天早上喝牛奶。',
        },
        level: 'preschool',
        audioUrl: {
          us: '/mock-audio/milk-us.mp3',
          uk: '/mock-audio/milk-uk.mp3',
        },
        difficulty: 'easy',
        tags: ['drink', 'food'],
        stage: 'beginner',
        isFavorited: false,
      },
      {
        id: 'word-beginner-013',
        word: 'bread',
        pronunciation: { us: '/bred/', uk: '/bred/' },
        meaning: '面包',
        partOfSpeech: 'noun',
        example: {
          english: 'I eat bread for breakfast.',
          chinese: '我早餐吃面包。',
        },
        level: 'preschool',
        audioUrl: {
          us: '/mock-audio/bread-us.mp3',
          uk: '/mock-audio/bread-uk.mp3',
        },
        difficulty: 'easy',
        tags: ['food', 'breakfast'],
        stage: 'beginner',
        isFavorited: false,
      },
      {
        id: 'word-beginner-014',
        word: 'ball',
        pronunciation: { us: '/bɔːl/', uk: '/bɔːl/' },
        meaning: '球',
        partOfSpeech: 'noun',
        example: {
          english: 'The children are playing with a ball.',
          chinese: '孩子们在玩球。',
        },
        level: 'preschool',
        audioUrl: {
          us: '/mock-audio/ball-us.mp3',
          uk: '/mock-audio/ball-uk.mp3',
        },
        difficulty: 'easy',
        tags: ['toy', 'sport'],
        stage: 'beginner',
        isFavorited: false,
      },
      {
        id: 'word-beginner-015',
        word: 'red',
        pronunciation: { us: '/red/', uk: '/red/' },
        meaning: '红色的',
        partOfSpeech: 'adjective',
        example: {
          english: 'I like the red flower.',
          chinese: '我喜欢这朵红花。',
        },
        level: 'preschool',
        audioUrl: {
          us: '/mock-audio/red-us.mp3',
          uk: '/mock-audio/red-uk.mp3',
        },
        difficulty: 'easy',
        tags: ['color', 'adjective'],
        stage: 'beginner',
        isFavorited: false,
      },
      {
        id: 'word-beginner-016',
        word: 'blue',
        pronunciation: { us: '/bluː/', uk: '/bluː/' },
        meaning: '蓝色的',
        partOfSpeech: 'adjective',
        example: {
          english: 'The sky is blue today.',
          chinese: '今天天空是蓝色的。',
        },
        level: 'preschool',
        audioUrl: {
          us: '/mock-audio/blue-us.mp3',
          uk: '/mock-audio/blue-uk.mp3',
        },
        difficulty: 'easy',
        tags: ['color', 'adjective'],
        stage: 'beginner',
        isFavorited: false,
      },
      {
        id: 'word-beginner-017',
        word: 'big',
        pronunciation: { us: '/bɪɡ/', uk: '/bɪɡ/' },
        meaning: '大的',
        partOfSpeech: 'adjective',
        example: {
          english: 'This is a big house.',
          chinese: '这是一座大房子。',
        },
        level: 'preschool',
        audioUrl: {
          us: '/mock-audio/big-us.mp3',
          uk: '/mock-audio/big-uk.mp3',
        },
        difficulty: 'easy',
        tags: ['size', 'adjective'],
        stage: 'beginner',
        isFavorited: false,
      },
      {
        id: 'word-beginner-018',
        word: 'small',
        pronunciation: { us: '/smɔːl/', uk: '/smɔːl/' },
        meaning: '小的',
        partOfSpeech: 'adjective',
        example: {
          english: 'The mouse is very small.',
          chinese: '老鼠非常小。',
        },
        level: 'preschool',
        audioUrl: {
          us: '/mock-audio/small-us.mp3',
          uk: '/mock-audio/small-uk.mp3',
        },
        difficulty: 'easy',
        tags: ['size', 'adjective'],
        stage: 'beginner',
        isFavorited: false,
      },
      {
        id: 'word-beginner-019',
        word: 'happy',
        pronunciation: { us: '/ˈhæpi/', uk: '/ˈhæpi/' },
        meaning: '快乐的',
        partOfSpeech: 'adjective',
        example: {
          english: 'I am very happy today.',
          chinese: '我今天很快乐。',
        },
        level: 'preschool',
        audioUrl: {
          us: '/mock-audio/happy-us.mp3',
          uk: '/mock-audio/happy-uk.mp3',
        },
        difficulty: 'easy',
        tags: ['emotion', 'adjective'],
        stage: 'beginner',
        isFavorited: false,
      },
      {
        id: 'word-beginner-020',
        word: 'love',
        pronunciation: { us: '/lʌv/', uk: '/lʌv/' },
        meaning: '爱',
        partOfSpeech: 'verb',
        example: {
          english: 'I love my family.',
          chinese: '我爱我的家人。',
        },
        level: 'preschool',
        audioUrl: {
          us: '/mock-audio/love-us.mp3',
          uk: '/mock-audio/love-uk.mp3',
        },
        difficulty: 'easy',
        tags: ['emotion', 'verb'],
        stage: 'beginner',
        isFavorited: false,
      },
    ],
    expert: [
      // 20个专家级单词
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
        isFavorited: false,
      },
      {
        id: 'word-expert-004',
        word: 'comprehensive',
        pronunciation: { us: '/ˌkɑːmprɪˈhensɪv/', uk: '/ˌkɒmprɪˈhensɪv/' },
        meaning: '全面的，综合的',
        partOfSpeech: 'adjective',
        example: {
          english: 'We need a comprehensive solution to this problem.',
          chinese: '我们需要一个全面的解决方案来解决这个问题。',
        },
        level: 'master',
        audioUrl: {
          us: '/mock-audio/comprehensive-us.mp3',
          uk: '/mock-audio/comprehensive-uk.mp3',
        },
        difficulty: 'hard',
        tags: ['descriptive', 'academic'],
        stage: 'expert',
        isFavorited: false,
      },
      {
        id: 'word-expert-005',
        word: 'intricate',
        pronunciation: { us: '/ˈɪntrɪkət/', uk: '/ˈɪntrɪkət/' },
        meaning: '复杂精细的',
        partOfSpeech: 'adjective',
        example: {
          english: 'The watch has an intricate mechanism.',
          chinese: '这块手表有复杂精细的机械装置。',
        },
        level: 'master',
        audioUrl: {
          us: '/mock-audio/intricate-us.mp3',
          uk: '/mock-audio/intricate-uk.mp3',
        },
        difficulty: 'hard',
        tags: ['descriptive', 'technical'],
        stage: 'expert',
        isFavorited: false,
      },
      {
        id: 'word-expert-006',
        word: 'eloquent',
        pronunciation: { us: '/ˈeləkwənt/', uk: '/ˈeləkwənt/' },
        meaning: '雄辩的，有说服力的',
        partOfSpeech: 'adjective',
        example: {
          english: 'She gave an eloquent speech at the conference.',
          chinese: '她在会议上发表了一个雄辩的演讲。',
        },
        level: 'master',
        audioUrl: {
          us: '/mock-audio/eloquent-us.mp3',
          uk: '/mock-audio/eloquent-uk.mp3',
        },
        difficulty: 'hard',
        tags: ['communication', 'skill'],
        stage: 'expert',
        isFavorited: false,
      },
      {
        id: 'word-expert-007',
        word: 'meticulous',
        pronunciation: { us: '/məˈtɪkjələs/', uk: '/məˈtɪkjələs/' },
        meaning: '一丝不苟的',
        partOfSpeech: 'adjective',
        example: {
          english: 'He is meticulous in his attention to detail.',
          chinese: '他对细节的关注一丝不苟。',
        },
        level: 'master',
        audioUrl: {
          us: '/mock-audio/meticulous-us.mp3',
          uk: '/mock-audio/meticulous-uk.mp3',
        },
        difficulty: 'hard',
        tags: ['character', 'precision'],
        stage: 'expert',
        isFavorited: false,
      },
      {
        id: 'word-expert-008',
        word: 'resilient',
        pronunciation: { us: '/rɪˈzɪliənt/', uk: '/rɪˈzɪliənt/' },
        meaning: '有弹性的，能迅速恢复的',
        partOfSpeech: 'adjective',
        example: {
          english: 'She is remarkably resilient in the face of adversity.',
          chinese: '面对逆境，她表现出惊人的恢复能力。',
        },
        level: 'master',
        audioUrl: {
          us: '/mock-audio/resilient-us.mp3',
          uk: '/mock-audio/resilient-uk.mp3',
        },
        difficulty: 'hard',
        tags: ['character', 'strength'],
        stage: 'expert',
        isFavorited: false,
      },
      {
        id: 'word-expert-009',
        word: 'unprecedented',
        pronunciation: { us: '/ʌnˈpresɪdentɪd/', uk: '/ʌnˈpresɪdentɪd/' },
        meaning: '史无前例的',
        partOfSpeech: 'adjective',
        example: {
          english: 'This is an unprecedented situation in our company.',
          chinese: '这在我们公司是史无前例的情况。',
        },
        level: 'master',
        audioUrl: {
          us: '/mock-audio/unprecedented-us.mp3',
          uk: '/mock-audio/unprecedented-uk.mp3',
        },
        difficulty: 'hard',
        tags: ['descriptive', 'unique'],
        stage: 'expert',
        isFavorited: false,
      },
      {
        id: 'word-expert-010',
        word: 'paradigm',
        pronunciation: { us: '/ˈpærədaɪm/', uk: '/ˈpærədaɪm/' },
        meaning: '范式，模式',
        partOfSpeech: 'noun',
        example: {
          english: 'This represents a new paradigm in technology.',
          chinese: '这代表了技术领域的新范式。',
        },
        level: 'master',
        audioUrl: {
          us: '/mock-audio/paradigm-us.mp3',
          uk: '/mock-audio/paradigm-uk.mp3',
        },
        difficulty: 'hard',
        tags: ['concept', 'academic'],
        stage: 'expert',
        isFavorited: false,
      },
      {
        id: 'word-expert-011',
        word: 'ubiquitous',
        pronunciation: { us: '/juːˈbɪkwɪtəs/', uk: '/juːˈbɪkwɪtəs/' },
        meaning: '无处不在的',
        partOfSpeech: 'adjective',
        example: {
          english: 'Smartphones have become ubiquitous in modern life.',
          chinese: '智能手机在现代生活中已经无处不在。',
        },
        level: 'master',
        audioUrl: {
          us: '/mock-audio/ubiquitous-us.mp3',
          uk: '/mock-audio/ubiquitous-uk.mp3',
        },
        difficulty: 'hard',
        tags: ['descriptive', 'prevalence'],
        stage: 'expert',
        isFavorited: false,
      },
      {
        id: 'word-expert-012',
        word: 'ambiguous',
        pronunciation: { us: '/æmˈbɪɡjuəs/', uk: '/æmˈbɪɡjuəs/' },
        meaning: '模糊的，有歧义的',
        partOfSpeech: 'adjective',
        example: {
          english: 'The contract terms were deliberately ambiguous.',
          chinese: '合同条款故意写得模糊不清。',
        },
        level: 'master',
        audioUrl: {
          us: '/mock-audio/ambiguous-us.mp3',
          uk: '/mock-audio/ambiguous-uk.mp3',
        },
        difficulty: 'hard',
        tags: ['clarity', 'communication'],
        stage: 'expert',
        isFavorited: false,
      },
      {
        id: 'word-expert-013',
        word: 'scrutinize',
        pronunciation: { us: '/ˈskruːtənaɪz/', uk: '/ˈskruːtənaɪz/' },
        meaning: '仔细检查，审视',
        partOfSpeech: 'verb',
        example: {
          english: 'The committee will scrutinize the proposal carefully.',
          chinese: '委员会将仔细审视这项提案。',
        },
        level: 'master',
        audioUrl: {
          us: '/mock-audio/scrutinize-us.mp3',
          uk: '/mock-audio/scrutinize-uk.mp3',
        },
        difficulty: 'hard',
        tags: ['action', 'examination'],
        stage: 'expert',
        isFavorited: false,
      },
      {
        id: 'word-expert-014',
        word: 'innovative',
        pronunciation: { us: '/ˈɪnəveɪtɪv/', uk: '/ˈɪnəveɪtɪv/' },
        meaning: '创新的',
        partOfSpeech: 'adjective',
        example: {
          english: 'They developed an innovative approach to the problem.',
          chinese: '他们开发了解决问题的创新方法。',
        },
        level: 'master',
        audioUrl: {
          us: '/mock-audio/innovative-us.mp3',
          uk: '/mock-audio/innovative-uk.mp3',
        },
        difficulty: 'hard',
        tags: ['creativity', 'progress'],
        stage: 'expert',
        isFavorited: false,
      },
      {
        id: 'word-expert-015',
        word: 'facilitate',
        pronunciation: { us: '/fəˈsɪlɪteɪt/', uk: '/fəˈsɪlɪteɪt/' },
        meaning: '促进，使便利',
        partOfSpeech: 'verb',
        example: {
          english: 'Technology can facilitate communication between people.',
          chinese: '技术可以促进人们之间的交流。',
        },
        level: 'master',
        audioUrl: {
          us: '/mock-audio/facilitate-us.mp3',
          uk: '/mock-audio/facilitate-uk.mp3',
        },
        difficulty: 'hard',
        tags: ['action', 'assistance'],
        stage: 'expert',
        isFavorited: false,
      },
      {
        id: 'word-expert-016',
        word: 'deteriorate',
        pronunciation: { us: '/dɪˈtɪriəreɪt/', uk: '/dɪˈtɪəriəreɪt/' },
        meaning: '恶化，变质',
        partOfSpeech: 'verb',
        example: {
          english: 'The situation began to deteriorate rapidly.',
          chinese: '情况开始迅速恶化。',
        },
        level: 'master',
        audioUrl: {
          us: '/mock-audio/deteriorate-us.mp3',
          uk: '/mock-audio/deteriorate-uk.mp3',
        },
        difficulty: 'hard',
        tags: ['change', 'decline'],
        stage: 'expert',
        isFavorited: false,
      },
      {
        id: 'word-expert-017',
        word: 'substantial',
        pronunciation: { us: '/səbˈstænʃəl/', uk: '/səbˈstænʃəl/' },
        meaning: '大量的，实质的',
        partOfSpeech: 'adjective',
        example: {
          english: 'There has been substantial progress in this field.',
          chinese: '这个领域已经取得了实质性进展。',
        },
        level: 'master',
        audioUrl: {
          us: '/mock-audio/substantial-us.mp3',
          uk: '/mock-audio/substantial-uk.mp3',
        },
        difficulty: 'hard',
        tags: ['quantity', 'significance'],
        stage: 'expert',
        isFavorited: false,
      },
      {
        id: 'word-expert-018',
        word: 'versatile',
        pronunciation: { us: '/ˈvɜːrsətaɪl/', uk: '/ˈvɜːsətaɪl/' },
        meaning: '多才多艺的，用途广泛的',
        partOfSpeech: 'adjective',
        example: {
          english: 'She is a versatile actress who can play many roles.',
          chinese: '她是一位多才多艺的女演员，能够胜任许多角色。',
        },
        level: 'master',
        audioUrl: {
          us: '/mock-audio/versatile-us.mp3',
          uk: '/mock-audio/versatile-uk.mp3',
        },
        difficulty: 'hard',
        tags: ['ability', 'flexibility'],
        stage: 'expert',
        isFavorited: false,
      },
      {
        id: 'word-expert-019',
        word: 'contemplate',
        pronunciation: { us: '/ˈkɑːntəmpleɪt/', uk: '/ˈkɒntəmpleɪt/' },
        meaning: '沉思，考虑',
        partOfSpeech: 'verb',
        example: {
          english: 'He sat quietly contemplating his future.',
          chinese: '他静静地坐着思考自己的未来。',
        },
        level: 'master',
        audioUrl: {
          us: '/mock-audio/contemplate-us.mp3',
          uk: '/mock-audio/contemplate-uk.mp3',
        },
        difficulty: 'hard',
        tags: ['thinking', 'reflection'],
        stage: 'expert',
        isFavorited: false,
      },
      {
        id: 'word-expert-020',
        word: 'perpetual',
        pronunciation: { us: '/pərˈpetʃuəl/', uk: '/pəˈpetʃuəl/' },
        meaning: '永久的，持续的',
        partOfSpeech: 'adjective',
        example: {
          english: 'He seemed to live in perpetual fear of failure.',
          chinese: '他似乎生活在对失败的持续恐惧中。',
        },
        level: 'master',
        audioUrl: {
          us: '/mock-audio/perpetual-us.mp3',
          uk: '/mock-audio/perpetual-uk.mp3',
        },
        difficulty: 'hard',
        tags: ['duration', 'continuity'],
        stage: 'expert',
        isFavorited: false,
      },
    ],
  },

  // 学习历史记录 - 初始为空，学习后才会生成数据
  studyHistory: [] as Array<{
    id: string
    wordId: string
    word: string
    meaning: string
    knowledgeLevel: WordKnowledgeLevel
    studiedAt: string
    stage: string
    isFavorited: boolean
    responseTime: number
  }>,

  // 今日学习进度
  dailyProgress: {
    date: '2024-01-20',
    knownCount: 0, // 认识的单词数量
    vagueCount: 0, // 模糊的单词数量
    unknownCount: 0, // 不认识的单词数量
    totalStudied: 0, // 总学习数量
    continuousDays: 1, // 连续学习天数
    targetWords: 20, // 目标单词数
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

    // 更新今日进度 - 按认识程度分类
    vocabularyData.dailyProgress.totalStudied += 1

    switch (body.knowledgeLevel) {
      case 'known':
        vocabularyData.dailyProgress.knownCount += 1
        break
      case 'vague':
        vocabularyData.dailyProgress.vagueCount += 1
        break
      case 'unknown':
        vocabularyData.dailyProgress.unknownCount += 1
        break
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
    await delay(300) // 减少延迟，提升用户体验
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 10
    const type = url.searchParams.get('type') // 'all' | 'favorites'
    const knowledgeLevel = url.searchParams.get('knowledgeLevel') // 按认识程度筛选

    // 使用真实的学习历史数据
    let filteredHistory = [...vocabularyData.studyHistory]

    // 按类型筛选
    if (type === 'favorites') {
      filteredHistory = filteredHistory.filter(h => h.isFavorited)
    }

    // 按认识程度筛选
    if (knowledgeLevel && knowledgeLevel !== 'all') {
      filteredHistory = filteredHistory.filter(
        h => h.knowledgeLevel === knowledgeLevel
      )
    }

    // 按时间倒序排序
    filteredHistory.sort(
      (a, b) =>
        new Date(b.studiedAt).getTime() - new Date(a.studiedAt).getTime()
    )

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

    // 返回当前的学习进度数据
    const progress = {
      ...vocabularyData.dailyProgress,
      date,
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

  // 更新单词认识度
  http.post('/api/vocabulary/update-knowledge-level', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as {
      wordId: string
      knowledgeLevel: WordKnowledgeLevel
    }

    // 更新历史记录中的认识度
    const historyRecords = vocabularyData.studyHistory.filter(
      h => h.wordId === body.wordId
    )
    historyRecords.forEach(record => {
      record.knowledgeLevel = body.knowledgeLevel
    })

    return HttpResponse.json({
      code: 200,
      data: {
        wordId: body.wordId,
        knowledgeLevel: body.knowledgeLevel,
        updatedRecords: historyRecords.length,
      },
      message: '认识度已更新',
    })
  }),
]

import type {
  User,
  ChatMessage,
  Topic,
  Vocabulary,
  TranslationResult,
  PhotoStory,
} from '@/types'

// 模拟用户数据
export const mockUser: User = {
  id: 'user_001',
  nickname: '开口鸭用户',
  avatar: 'https://img.icons8.com/color/96/000000/duck.png',
  level: 'elementary',
  points: 1250,
  studyDays: 15,
}

// 模拟话题数据
export const mockTopics: Topic[] = [
  {
    id: '1',
    title: '咖啡店点餐',
    description: '学习在咖啡店如何点餐和与店员交流',
    category: 'daily',
    level: 'elementary',
    difficulty: 'easy',
    icon: '☕',
    dialogues: [
      {
        id: '1-1',
        speaker: 'A',
        english: 'Good morning! What can I get for you today?',
        chinese: '早上好！今天我能为您做些什么？',
        audioUrl: 'mock-audio-1-1',
      },
      {
        id: '1-2',
        speaker: 'B',
        english: "I'd like a large cappuccino, please.",
        chinese: '我要一杯大杯的卡布奇诺，谢谢。',
        audioUrl: 'mock-audio-1-2',
      },
      {
        id: '1-3',
        speaker: 'A',
        english: 'Would you like anything else with that?',
        chinese: '还需要其他什么吗？',
        audioUrl: 'mock-audio-1-3',
      },
      {
        id: '1-4',
        speaker: 'B',
        english: 'No, that will be all. Thank you.',
        chinese: '不用了，就这些。谢谢。',
        audioUrl: 'mock-audio-1-4',
      },
    ],
  },
  {
    id: '2',
    title: '机场登机',
    description: '学习在机场办理登机手续的英语对话',
    category: 'travel',
    level: 'middle',
    difficulty: 'medium',
    icon: '✈️',
    dialogues: [
      {
        id: '2-1',
        speaker: 'A',
        english: 'May I see your passport and boarding pass?',
        chinese: '请出示您的护照和登机牌。',
        audioUrl: 'mock-audio-2-1',
      },
      {
        id: '2-2',
        speaker: 'B',
        english: 'Here you are.',
        chinese: '给您。',
        audioUrl: 'mock-audio-2-2',
      },
      {
        id: '2-3',
        speaker: 'A',
        english: 'Thank you. Your flight will depart from Gate 15.',
        chinese: '谢谢。您的航班将从15号登机口起飞。',
        audioUrl: 'mock-audio-2-3',
      },
    ],
  },
  {
    id: '3',
    title: '健身房对话',
    description: '在健身房与教练和其他会员的交流',
    category: 'health',
    level: 'elementary',
    difficulty: 'easy',
    icon: '💪',
    dialogues: [
      {
        id: '3-1',
        speaker: 'A',
        english: 'Is this your first time at the gym?',
        chinese: '这是您第一次来健身房吗？',
        audioUrl: 'mock-audio-3-1',
      },
      {
        id: '3-2',
        speaker: 'B',
        english: 'Yes, could you show me how to use this machine?',
        chinese: '是的，您能教我如何使用这台机器吗？',
        audioUrl: 'mock-audio-3-2',
      },
    ],
  },
  {
    id: '4',
    title: '商务会议',
    description: '参加商务会议时的常用表达',
    category: 'business',
    level: 'high',
    difficulty: 'hard',
    icon: '💼',
    dialogues: [
      {
        id: '4-1',
        speaker: 'A',
        english: 'Let me start by introducing the agenda for today.',
        chinese: '让我先介绍今天的议程。',
        audioUrl: 'mock-audio-4-1',
      },
      {
        id: '4-2',
        speaker: 'B',
        english: 'That sounds good. What are the main points?',
        chinese: '听起来不错。主要要点是什么？',
        audioUrl: 'mock-audio-4-2',
      },
    ],
  },
  {
    id: '5',
    title: '餐厅用餐',
    description: '在餐厅点餐和用餐的英语对话',
    category: 'food',
    level: 'elementary',
    difficulty: 'easy',
    icon: '🍽️',
    dialogues: [
      {
        id: '5-1',
        speaker: 'A',
        english: 'Welcome! How many people in your party?',
        chinese: '欢迎！您们有几位？',
        audioUrl: 'mock-audio-5-1',
      },
      {
        id: '5-2',
        speaker: 'B',
        english: 'Just two, please.',
        chinese: '就两位，谢谢。',
        audioUrl: 'mock-audio-5-2',
      },
    ],
  },
  {
    id: '6',
    title: '购物对话',
    description: '在商店购物的英语表达',
    category: 'daily',
    level: 'elementary',
    difficulty: 'easy',
    icon: '🛍️',
    dialogues: [
      {
        id: '6-1',
        speaker: 'A',
        english: 'Can I help you find something?',
        chinese: '需要我帮您找什么吗？',
        audioUrl: 'mock-audio-6-1',
      },
      {
        id: '6-2',
        speaker: 'B',
        english: "Yes, I'm looking for a gift for my friend.",
        chinese: '是的，我在为朋友找礼物。',
        audioUrl: 'mock-audio-6-2',
      },
    ],
  },
]

// 模拟单词数据
export const mockVocabularies: Vocabulary[] = [
  {
    id: '1',
    word: 'immense',
    pronunciation: { us: '/ɪˈmens/', uk: '/ɪˈmens/' },
    meaning: 'adj. 极大的，巨大的',
    partOfSpeech: 'adjective',
    example: {
      english: 'He inherited an immense fortune.',
      chinese: '他继承了巨额财富。',
    },
    level: 'university',
    audioUrl: { us: 'mock-us-audio', uk: 'mock-uk-audio' },
  },
  {
    id: '2',
    word: 'brilliant',
    pronunciation: { us: '/ˈbrɪljənt/', uk: '/ˈbrɪljənt/' },
    meaning: 'adj. 聪明的，出色的',
    partOfSpeech: 'adjective',
    example: {
      english: 'She gave a brilliant performance.',
      chinese: '她表现得非常出色。',
    },
    level: 'high',
    audioUrl: { us: 'mock-us-audio', uk: 'mock-uk-audio' },
  },
  {
    id: '3',
    word: 'adventure',
    pronunciation: { us: '/ədˈventʃər/', uk: '/ədˈventʃə(r)/' },
    meaning: 'n. 冒险，历险',
    partOfSpeech: 'noun',
    example: {
      english: 'They went on an exciting adventure.',
      chinese: '他们进行了一次刺激的冒险。',
    },
    level: 'middle',
    audioUrl: { us: 'mock-us-audio', uk: 'mock-uk-audio' },
  },
  {
    id: '4',
    word: 'happy',
    pronunciation: { us: '/ˈhæpi/', uk: '/ˈhæpi/' },
    meaning: 'adj. 高兴的，快乐的',
    partOfSpeech: 'adjective',
    example: {
      english: 'I am very happy today.',
      chinese: '我今天很开心。',
    },
    level: 'elementary',
    audioUrl: { us: 'mock-us-audio', uk: 'mock-uk-audio' },
  },
  {
    id: '5',
    word: 'beautiful',
    pronunciation: { us: '/ˈbjuːtɪfl/', uk: '/ˈbjuːtɪfl/' },
    meaning: 'adj. 美丽的，漂亮的',
    partOfSpeech: 'adjective',
    example: {
      english: 'What a beautiful day!',
      chinese: '多么美好的一天！',
    },
    level: 'elementary',
    audioUrl: { us: 'mock-us-audio', uk: 'mock-uk-audio' },
  },
  {
    id: '6',
    word: 'determination',
    pronunciation: { us: '/dɪˌtɜːmɪˈneɪʃn/', uk: '/dɪˌtɜːmɪˈneɪʃn/' },
    meaning: 'n. 决心，毅力',
    partOfSpeech: 'noun',
    example: {
      english: 'Her determination to succeed is inspiring.',
      chinese: '她成功的决心令人鼓舞。',
    },
    level: 'high',
    audioUrl: { us: 'mock-us-audio', uk: 'mock-uk-audio' },
  },
  {
    id: '7',
    word: 'curious',
    pronunciation: { us: '/ˈkjʊəriəs/', uk: '/ˈkjʊəriəs/' },
    meaning: 'adj. 好奇的，求知欲强的',
    partOfSpeech: 'adjective',
    example: {
      english: 'Children are naturally curious about the world.',
      chinese: '孩子们天生对世界充满好奇。',
    },
    level: 'middle',
    audioUrl: { us: 'mock-us-audio', uk: 'mock-uk-audio' },
  },
  {
    id: '8',
    word: 'generous',
    pronunciation: { us: '/ˈdʒenərəs/', uk: '/ˈdʒenərəs/' },
    meaning: 'adj. 慷慨的，大方的',
    partOfSpeech: 'adjective',
    example: {
      english: 'She is very generous with her time and money.',
      chinese: '她在时间和金钱方面都很慷慨。',
    },
    level: 'high',
    audioUrl: { us: 'mock-us-audio', uk: 'mock-uk-audio' },
  },
]

// 模拟翻译历史数据
export const mockTranslationHistory: TranslationResult[] = [
  {
    id: 'trans-1',
    originalText: '你好，很高兴认识你',
    standardTranslation: "Hello, it's a pleasure to meet you.",
    colloquialTranslation: 'Hi, nice to meet you!',
    relatedPhrases: [],
    audioUrl: 'mock-audio-translation-1',
  },
  {
    id: 'trans-2',
    originalText: '今天天气怎么样？',
    standardTranslation: 'How is the weather today?',
    colloquialTranslation: "What's the weather like today?",
    relatedPhrases: [],
    audioUrl: 'mock-audio-translation-2',
  },
  {
    id: 'trans-3',
    originalText: '我想学习英语',
    standardTranslation: 'I would like to learn English.',
    colloquialTranslation: 'I want to learn English.',
    relatedPhrases: [],
    audioUrl: 'mock-audio-translation-3',
  },
]

// 模拟拍照短文历史数据
export const mockPhotoStories: PhotoStory[] = [
  {
    id: '1',
    imageUrl: 'https://img.icons8.com/color/96/000000/camera.png',
    story:
      "This is a beautiful sunset over the mountains. The golden light creates a magical atmosphere that makes you feel peaceful and grateful for nature's beauty.",
    audioUrl: 'mock-audio-story-1',
    createdAt: Date.now() - 86400000, // 1天前
  },
  {
    id: '2',
    imageUrl: 'https://img.icons8.com/color/96/000000/camera.png',
    story:
      "A cozy coffee shop with warm lighting and comfortable seating. It's the perfect place to relax, read a book, or catch up with friends over a cup of coffee.",
    audioUrl: 'mock-audio-story-2',
    createdAt: Date.now() - 172800000, // 2天前
  },
]

// 模拟聊天消息数据
export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    content: 'Hello! How can I help you practice English today?',
    type: 'user',
    // sender: 'ai', // 不再需要sender字段
    timestamp: Date.now() - 300000, // 5分钟前
    translation: '你好！今天我能帮你练习英语吗？',
  },
  {
    id: '2',
    content: 'I want to practice speaking English',
    type: 'user',
    // sender: 'user', // 不再需要sender字段
    timestamp: Date.now() - 240000, // 4分钟前
    translation: '我想练习说英语',
  },
  {
    id: '3',
    content:
      "Great! Let's start with some basic conversation. What's your name?",
    type: 'user',
    // sender: 'ai', // 不再需要sender字段
    timestamp: Date.now() - 180000, // 3分钟前
    translation: '很好！让我们从基本对话开始。你叫什么名字？',
  },
]

// 模拟API响应延迟
export const mockApiDelay = (ms = 1000) =>
  new Promise(resolve => setTimeout(resolve, ms))

// 模拟API错误
export const mockApiError = (message = '请求失败') =>
  Promise.reject(new Error(message))

// 模拟成功响应
export const mockApiSuccess = <T>(data: T, delay = 1000) =>
  mockApiDelay(delay).then(() => ({
    code: 200,
    message: 'success',
    data,
  }))

// 导出所有模拟数据
export default {
  user: mockUser,
  topics: mockTopics,
  vocabularies: mockVocabularies,
  translationHistory: mockTranslationHistory,
  photoStories: mockPhotoStories,
  chatMessages: mockChatMessages,
  delay: mockApiDelay,
  error: mockApiError,
  success: mockApiSuccess,
}

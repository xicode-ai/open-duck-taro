/* eslint-disable no-undef */
import { http, HttpResponse, delay } from 'msw'
import type {
  ExtendedFormData,
  StoryParams,
  ProgressUpdateBody,
} from '../types'

// Mock图片故事数据
const photoStories = [
  {
    id: 'story-001',
    title: 'A Day in the Park',
    titleCn: '公园里的一天',
    description: 'Enjoying nature and outdoor activities',
    thumbnail:
      'https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=400',
    images: [
      {
        id: 'img-001',
        url: 'https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=800',
        caption: 'The sun was shining brightly in the morning.',
        captionCn: '早晨阳光明媚。',
        vocabulary: ['sun', 'shining', 'brightly', 'morning'],
        audioUrl: '/mock-audio/story-001-1.mp3',
      },
      {
        id: 'img-002',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        caption: 'Children were playing on the grass.',
        captionCn: '孩子们在草地上玩耍。',
        vocabulary: ['children', 'playing', 'grass'],
        audioUrl: '/mock-audio/story-001-2.mp3',
      },
      {
        id: 'img-003',
        url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
        caption: 'We had a picnic under the tree.',
        captionCn: '我们在树下野餐。',
        vocabulary: ['picnic', 'under', 'tree'],
        audioUrl: '/mock-audio/story-001-3.mp3',
      },
    ],
    difficulty: 'beginner',
    category: 'daily life',
    duration: 5,
    wordCount: 45,
    completed: false,
    progress: 0,
    createdAt: '2024-03-20',
  },
  {
    id: 'story-002',
    title: 'Cooking Adventure',
    titleCn: '烹饪冒险',
    description: 'Learning to make a delicious meal',
    thumbnail:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    images: [
      {
        id: 'img-004',
        url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
        caption: 'First, we prepare all the ingredients.',
        captionCn: '首先，我们准备所有的食材。',
        vocabulary: ['prepare', 'ingredients'],
        audioUrl: '/mock-audio/story-002-1.mp3',
      },
      {
        id: 'img-005',
        url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
        caption: 'Then we start cooking in the kitchen.',
        captionCn: '然后我们在厨房开始烹饪。',
        vocabulary: ['cooking', 'kitchen'],
        audioUrl: '/mock-audio/story-002-2.mp3',
      },
    ],
    difficulty: 'intermediate',
    category: 'lifestyle',
    duration: 8,
    wordCount: 68,
    completed: true,
    progress: 100,
    createdAt: '2024-03-18',
  },
]

export const photoStoryHandlers = [
  // 获取图片故事列表
  http.get('/api/photo-stories', async ({ request }) => {
    await delay(500)
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const difficulty = url.searchParams.get('difficulty')

    let filtered = [...photoStories]

    if (category) {
      filtered = filtered.filter(s => s.category === category)
    }

    if (difficulty) {
      filtered = filtered.filter(s => s.difficulty === difficulty)
    }

    return HttpResponse.json({
      code: 200,
      data: filtered,
      message: 'success',
    })
  }),

  // 获取图片故事详情
  http.get<StoryParams>('/api/photo-stories/:storyId', async ({ params }) => {
    await delay(400)
    const story = photoStories.find(s => s.id === params.storyId)

    if (!story) {
      return HttpResponse.json(
        { code: 404, message: '故事不存在' },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      code: 200,
      data: story,
      message: 'success',
    })
  }),

  // 创建图片故事
  http.post('/api/photo-stories', async ({ request }) => {
    await delay(800)
    const formData = (await request.formData()) as unknown as ExtendedFormData
    const title = formData.get('title') as string
    const images = formData.getAll('images')

    const newStory = {
      id: `story-${Date.now()}`,
      title,
      titleCn: '新故事',
      description: 'User created story',
      thumbnail: 'https://via.placeholder.com/400',
      images: images.map((img, index) => ({
        id: `img-${Date.now()}-${index}`,
        url: `/mock-images/story-${Date.now()}-${index}.jpg`, // 模拟图片URL
        caption: '',
        captionCn: '',
        vocabulary: [],
        audioUrl: '',
      })),
      difficulty: 'intermediate',
      category: 'custom',
      duration: 0,
      wordCount: 0,
      completed: false,
      progress: 0,
      createdAt: new Date().toISOString(),
      userCreated: true,
    }

    photoStories.push(newStory)

    return HttpResponse.json({
      code: 200,
      data: newStory,
      message: '故事创建成功',
    })
  }),

  // 更新故事进度
  http.put(
    '/api/photo-stories/:storyId/progress',
    async ({ params, request }) => {
      await delay(300)
      const body = (await request.json()) as ProgressUpdateBody
      const story = photoStories.find(s => s.id === params.storyId)

      if (story) {
        story.progress = body.progress
        if (body.progress === 100) {
          story.completed = true
        }
      }

      return HttpResponse.json({
        code: 200,
        data: {
          storyId: params.storyId,
          progress: body.progress,
          completed: body.progress === 100,
          pointsEarned: body.progress === 100 ? 20 : 5,
        },
        message: 'success',
      })
    }
  ),

  // AI生成图片描述
  http.post('/api/photo-stories/generate-caption', async ({ request }) => {
    await delay(1000)
    const formData = (await request.formData()) as unknown as ExtendedFormData
    const _image = formData.get('image')

    // 模拟AI生成的描述
    const captions = [
      {
        english: 'A beautiful sunny day with clear blue sky.',
        chinese: '美丽晴朗的一天，天空湛蓝。',
        vocabulary: ['beautiful', 'sunny', 'clear', 'blue', 'sky'],
      },
      {
        english: 'People are enjoying their time together.',
        chinese: '人们在一起享受美好时光。',
        vocabulary: ['people', 'enjoying', 'time', 'together'],
      },
      {
        english: 'Nature shows its wonderful colors.',
        chinese: '大自然展现出它美妙的色彩。',
        vocabulary: ['nature', 'shows', 'wonderful', 'colors'],
      },
    ]

    const randomCaption = captions[Math.floor(Math.random() * captions.length)]

    return HttpResponse.json({
      code: 200,
      data: {
        caption: randomCaption.english,
        captionCn: randomCaption.chinese,
        vocabulary: randomCaption.vocabulary,
        confidence: 0.92,
        alternatives: [
          'The scene looks peaceful and calm.',
          'What a wonderful moment captured in time.',
        ],
      },
      message: 'success',
    })
  }),

  // 获取推荐图片故事
  http.get('/api/photo-stories/recommendations', async () => {
    await delay(400)

    const recommendations = photoStories.slice(0, 3).map(story => ({
      ...story,
      recommendReason: story.completed ? '继续学习' : '热门推荐',
    }))

    return HttpResponse.json({
      code: 200,
      data: recommendations,
      message: 'success',
    })
  }),

  // 获取故事分类
  http.get('/api/photo-stories/categories', async () => {
    await delay(200)

    const categories = [
      { id: 'daily-life', name: '日常生活', icon: '🏠', count: 15 },
      { id: 'nature', name: '自然风光', icon: '🌳', count: 12 },
      { id: 'food', name: '美食料理', icon: '🍽️', count: 10 },
      { id: 'travel', name: '旅行见闻', icon: '✈️', count: 18 },
      { id: 'culture', name: '文化习俗', icon: '🎭', count: 8 },
      { id: 'sports', name: '运动健身', icon: '⚽', count: 6 },
      { id: 'custom', name: '自定义', icon: '✨', count: 3 },
    ]

    return HttpResponse.json({
      code: 200,
      data: categories,
      message: 'success',
    })
  }),

  // 删除图片故事
  http.delete<StoryParams>(
    '/api/photo-stories/:storyId',
    async ({ params }) => {
      await delay(300)
      const index = photoStories.findIndex(s => s.id === params.storyId)

      if (index > -1) {
        photoStories.splice(index, 1)
      }

      return HttpResponse.json({
        code: 200,
        message: '删除成功',
      })
    }
  ),

  // 分享图片故事
  http.post<StoryParams>(
    '/api/photo-stories/:storyId/share',
    async ({ params }) => {
      await delay(400)

      return HttpResponse.json({
        code: 200,
        data: {
          shareUrl: `https://openduck.com/story/${params.storyId}`,
          shareCode:
            'DUCK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        message: '分享链接已生成',
      })
    }
  ),

  // 收藏图片故事
  http.post<StoryParams>(
    '/api/photo-stories/:storyId/favorite',
    async ({ params }) => {
      await delay(200)

      return HttpResponse.json({
        code: 200,
        data: {
          storyId: params.storyId,
          favorited: true,
        },
        message: '已收藏',
      })
    }
  ),
]

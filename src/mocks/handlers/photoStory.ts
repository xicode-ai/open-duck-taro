import { http, HttpResponse, delay } from 'msw'
import type {
  PhotoStory,
  PhotoStoryScore,
  GenerateStoryRequest,
  // GenerateStoryResponse,
  SpeechScoreRequest,
  SpeechScoreResponse,
  // PhotoStoryHistoryParams,
  PhotoStoryHistoryResponse,
  ApiResponse,
} from '../../types'

// 模拟存储的照片故事数据
let photoStories: PhotoStory[] = [
  {
    id: 'story-001',
    imageUrl:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    title: '咖啡店场景',
    titleCn: '咖啡店场景',
    standardStory:
      'This is a cozy coffee shop with warm lighting and comfortable seating. There are several customers enjoying their drinks while working on laptops or chatting with friends. The barista behind the counter is preparing fresh coffee, and the aroma fills the entire space. Large windows let in natural light, creating a welcoming atmosphere perfect for relaxation or productivity.',
    standardStoryCn:
      '这是一家温馨的咖啡店，有着温暖的灯光和舒适的座椅。几位顾客一边享受着饮品，一边用笔记本电脑工作或与朋友聊天。柜台后的咖啡师正在制作新鲜咖啡，香气弥漫整个空间。大窗户让自然光洒进来，营造出非常适合放松或工作的温馨氛围。',
    nativeStory:
      "What a lovely little café! The vibe here is so chill with all these soft lights and comfy chairs. You've got people scattered around - some folks tapping away on their laptops, others just hanging out and catching up over coffee. The barista's working his magic behind the counter, and man, that coffee smell is incredible! Those big windows really brighten up the place - it's the perfect spot to either get some work done or just kick back and relax.",
    nativeStoryCn:
      '多么可爱的小咖啡厅啊！这里的氛围很轻松，有柔和的灯光和舒适的椅子。你可以看到人们分散坐着——有些人在笔记本电脑上忙碌，其他人只是闲逛，边喝咖啡边聊天。咖啡师在柜台后面施展魔法，天哪，那咖啡香味太棒了！那些大窗户真的照亮了这个地方——这是工作或放松的完美场所。',
    sentences: [
      {
        id: 'sent-001',
        sentence:
          'This is a cozy coffee shop with warm lighting and comfortable seating.',
        sentenceCn: '这是一家温馨的咖啡店，有着温暖的灯光和舒适的座椅。',
        audioUrl: '/mock-audio/sent-001.mp3',
        practiced: true,
        score: 85,
        order: 1,
      },
      {
        id: 'sent-002',
        sentence:
          'There are several customers enjoying their drinks while working on laptops.',
        sentenceCn: '几位顾客一边享受着饮品，一边用笔记本电脑工作。',
        audioUrl: '/mock-audio/sent-002.mp3',
        practiced: true,
        score: 88,
        order: 2,
      },
      {
        id: 'sent-003',
        sentence: 'The barista behind the counter is preparing fresh coffee.',
        sentenceCn: '柜台后的咖啡师正在制作新鲜咖啡。',
        audioUrl: '/mock-audio/sent-003.mp3',
        practiced: false,
        order: 3,
      },
      {
        id: 'sent-004',
        sentence:
          'Large windows let in natural light, creating a welcoming atmosphere.',
        sentenceCn: '大窗户让自然光洒进来，营造出温馨的氛围。',
        audioUrl: '/mock-audio/sent-004.mp3',
        practiced: false,
        order: 4,
      },
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    score: {
      overall: 85,
      grade: 'B+',
      accuracy: 82,
      fluency: 90,
      speed: 75,
      completeness: 88,
      feedback: '发音清晰，继续加油！',
    },
    status: 'completed',
    isFavorite: true,
    favoritedAt: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: 'story-002',
    imageUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    title: '公园风景',
    titleCn: '公园风景',
    standardStory:
      'A beautiful park with green trees and a peaceful walking path. The morning sun shines through the leaves, creating dancing shadows on the ground. People are enjoying their morning exercise, some jogging, others practicing tai chi.',
    standardStoryCn:
      '一个美丽的公园，绿树成荫，小径幽静。早晨的阳光透过树叶，在地面上创造出舞动的影子。人们正在享受晨练，有些人在慢跑，其他人在练太极。',
    nativeStory:
      "What a gorgeous park! The trees are so green and lush, and this walking path is super peaceful. You can see the morning sun peeking through the leaves - it's making these cool shadow patterns on the ground. There are people out getting their exercise on - some are jogging, and I even spotted a group doing tai chi over there.",
    nativeStoryCn:
      '多么美丽的公园啊！树木如此翠绿茂盛，这条步行道超级宁静。你可以看到晨光透过树叶——在地上形成了很酷的影子图案。有人在外面锻炼——有些人在慢跑，我甚至看到那边有一群人在打太极。',
    sentences: [
      {
        id: 'sent-005',
        sentence:
          'A beautiful park with green trees and a peaceful walking path.',
        sentenceCn: '一个美丽的公园，绿树成荫，小径幽静。',
        audioUrl: '/mock-audio/sent-005.mp3',
        practiced: true,
        score: 78,
        order: 1,
      },
      {
        id: 'sent-006',
        sentence: 'The morning sun shines through the leaves.',
        sentenceCn: '早晨的阳光透过树叶。',
        audioUrl: '/mock-audio/sent-006.mp3',
        practiced: false,
        order: 2,
      },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    score: {
      overall: 78,
      grade: 'B',
      accuracy: 75,
      fluency: 80,
      speed: 78,
      completeness: 79,
      feedback: '发音不错，注意语速控制。',
    },
    status: 'practicing',
    isFavorite: false,
  },
  {
    id: 'story-003',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    title: '餐厅美食',
    titleCn: '餐厅美食',
    standardStory:
      'A delicious meal served on a wooden table with beautiful presentation. The colorful vegetables and perfectly cooked meat create an appetizing display. Steam rises from the hot dish, and the restaurant atmosphere is warm and inviting.',
    standardStoryCn:
      '木桌上精美摆盘的美味佳肴。五彩缤纷的蔬菜和烹饪完美的肉类创造了令人垂涎的展示。热腾腾的菜肴冒着蒸汽，餐厅氛围温暖而诱人。',
    nativeStory:
      "Oh wow, this food looks amazing! They've really gone all out with the presentation - check out those colorful veggies and that perfectly cooked meat. You can see the steam coming off the dish, so you know it's fresh from the kitchen. The whole restaurant has this warm, cozy feel to it that just makes you want to dig in!",
    nativeStoryCn:
      '哇，这食物看起来太棒了！他们在摆盘上真的很用心——看看那些五颜六色的蔬菜和烹饪完美的肉。你可以看到菜肴冒着热气，所以你知道这是刚从厨房出来的。整个餐厅都有这种温暖、舒适的感觉，让你忍不住想大快朵颐！',
    sentences: [
      {
        id: 'sent-007',
        sentence: 'A delicious meal served on a wooden table.',
        sentenceCn: '木桌上的美味佳肴。',
        audioUrl: '/mock-audio/sent-007.mp3',
        practiced: true,
        score: 92,
        order: 1,
      },
      {
        id: 'sent-008',
        sentence: 'The colorful vegetables create an appetizing display.',
        sentenceCn: '五彩缤纷的蔬菜创造了令人垂涎的展示。',
        audioUrl: '/mock-audio/sent-008.mp3',
        practiced: true,
        score: 90,
        order: 2,
      },
      {
        id: 'sent-009',
        sentence: 'Steam rises from the hot dish.',
        sentenceCn: '热腾腾的菜肴冒着蒸汽。',
        audioUrl: '/mock-audio/sent-009.mp3',
        practiced: true,
        score: 94,
        order: 3,
      },
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    score: {
      overall: 92,
      grade: 'A',
      accuracy: 90,
      fluency: 93,
      speed: 91,
      completeness: 94,
      feedback: '发音非常棒！继续保持！',
    },
    status: 'completed',
    isFavorite: true,
    favoritedAt: new Date(Date.now() - 100000000).toISOString(),
  },
  {
    id: 'story-004',
    imageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    title: '城市街景',
    titleCn: '城市街景',
    standardStory:
      'A busy city street with modern buildings and people walking by. The urban landscape showcases the energy of city life.',
    standardStoryCn:
      '繁忙的城市街道，现代建筑林立，行人匆匆。都市景观展示了城市生活的活力。',
    nativeStory:
      "The city's buzzing with energy! You've got all these modern buildings towering overhead and people rushing about their day.",
    nativeStoryCn:
      '这座城市充满活力！现代建筑高耸入云，人们忙碌地度过他们的一天。',
    sentences: [
      {
        id: 'sent-010',
        sentence: 'A busy city street with modern buildings.',
        sentenceCn: '繁忙的城市街道，现代建筑林立。',
        audioUrl: '/mock-audio/sent-010.mp3',
        practiced: false,
        order: 1,
      },
    ],
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    status: 'generated',
    isFavorite: false,
  },
]

export const photoStoryHandlers = [
  // 生成照片短文
  http.post<never, GenerateStoryRequest>(
    '/api/photo-story/generate',
    async ({ request }) => {
      await delay(2000) // 模拟AI生成延迟
      const body = await request.json()

      // 随机生成短文内容
      const stories = [
        {
          title: 'Coffee Shop Scene',
          titleCn: '咖啡店场景',
          standard:
            'This is a cozy coffee shop with warm lighting and comfortable seating. Customers are enjoying their beverages while working or socializing. The atmosphere is perfect for both productivity and relaxation.',
          native:
            "What a lovely café! The vibe here is so chill with soft lights and comfy seats. People are sipping their coffee while working on laptops or catching up with friends. It's the perfect spot to get stuff done or just unwind.",
        },
        {
          title: 'Park Morning',
          titleCn: '公园早晨',
          standard:
            'The park is beautiful in the morning with fresh air and green trees. Birds are singing and people are exercising. The sunlight filters through the leaves creating a peaceful atmosphere.',
          native:
            "The park's gorgeous this morning! Fresh air, green trees everywhere, and you can hear birds chirping. There are folks out jogging and doing tai chi. The sun's peeking through the leaves - it's so peaceful!",
        },
        {
          title: 'Street Food Market',
          titleCn: '街头美食市场',
          standard:
            'This vibrant street food market offers a variety of delicious local dishes. Vendors are busy preparing food while customers explore different stalls. The aroma of spices and grilled food fills the air.',
          native:
            "This street food market is buzzing! You've got all these amazing smells - spices, grilled meat, fresh veggies. Vendors are cooking up a storm and people are wandering around trying everything. The energy here is incredible!",
        },
      ]

      const randomStory = stories[Math.floor(Math.random() * stories.length)]

      // 将句子分解为练习单元
      const standardSentences = randomStory.standard
        .split('. ')
        .filter(s => s.length > 0)
      const sentences = standardSentences.map((sentence, index) => ({
        id: `sent-${Date.now()}-${index}`,
        sentence: sentence + (sentence.endsWith('.') ? '' : '.'),
        sentenceCn: `这是第${index + 1}句的中文翻译。`,
        audioUrl: `/mock-audio/sent-${Date.now()}-${index}.mp3`,
        practiced: false,
        order: index + 1,
      }))

      const newStory: PhotoStory = {
        id: `story-${Date.now()}`,
        imageUrl: body.imageBase64?.startsWith('data:')
          ? body.imageBase64
          : `https://images.unsplash.com/photo-${Date.now()}?w=800`,
        imageBase64: body.imageBase64,
        title: randomStory.title,
        titleCn: randomStory.titleCn,
        standardStory: randomStory.standard,
        standardStoryCn: '这是标准短文的中文翻译。' + randomStory.standard,
        nativeStory: randomStory.native,
        nativeStoryCn: '这是地道短文的中文翻译。' + randomStory.native,
        sentences,
        createdAt: new Date().toISOString(),
        status: 'generated',
      }

      // 添加到存储
      photoStories.unshift(newStory)

      return HttpResponse.json<ApiResponse<PhotoStory>>({
        code: 200,
        message: 'success',
        data: newStory,
      })
    }
  ),

  // 语音评分
  http.post<never, SpeechScoreRequest>(
    '/api/photo-story/speech-score',
    async ({ request }) => {
      await delay(1500) // 模拟评分延迟
      const body = await request.json()

      // 生成随机评分
      const baseScore = 70 + Math.floor(Math.random() * 25) // 70-95分

      const score: PhotoStoryScore = {
        overall: baseScore,
        grade:
          baseScore >= 95
            ? 'A+'
            : baseScore >= 90
              ? 'A'
              : baseScore >= 85
                ? 'B+'
                : baseScore >= 80
                  ? 'B'
                  : baseScore >= 75
                    ? 'C+'
                    : 'C',
        accuracy: baseScore - 5 + Math.floor(Math.random() * 10),
        fluency: baseScore - 3 + Math.floor(Math.random() * 8),
        speed: baseScore - 4 + Math.floor(Math.random() * 9),
        completeness: baseScore - 2 + Math.floor(Math.random() * 7),
        feedback:
          baseScore >= 90
            ? '发音非常棒！继续保持！'
            : baseScore >= 80
              ? '发音不错，继续加油！'
              : baseScore >= 70
                ? '还需要多练习，注意发音准确度。'
                : '建议多听多练，提升发音水平。',
      }

      // 生成单词级别的评分
      const words = body.expectedText.split(' ')
      const detailScores = {
        words: words.map(word => ({
          word,
          score: 70 + Math.floor(Math.random() * 30),
          feedback: Math.random() > 0.7 ? '注意元音发音' : undefined,
        })),
      }

      const response: SpeechScoreResponse = {
        score,
        detailScores,
      }

      return HttpResponse.json<ApiResponse<SpeechScoreResponse>>({
        code: 200,
        message: 'success',
        data: response,
      })
    }
  ),

  // 获取历史记录（分页）
  http.get('/api/photo-story/history', async ({ request }) => {
    await delay(500)
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')

    // 按时间倒序排序
    const sortedStories = [...photoStories].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // 分页
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const items = sortedStories.slice(startIndex, endIndex)

    const response: PhotoStoryHistoryResponse = {
      items,
      hasMore: endIndex < sortedStories.length,
      total: sortedStories.length,
    }

    return HttpResponse.json<ApiResponse<PhotoStoryHistoryResponse>>({
      code: 200,
      message: 'success',
      data: response,
    })
  }),

  // 获取单个故事详情
  http.get<{ id: string }>(
    '/api/photo-story/detail/:id',
    async ({ params }) => {
      await delay(300)
      const { id } = params
      const story = photoStories.find(s => s.id === id)

      if (!story) {
        return new HttpResponse(
          JSON.stringify({
            code: 404,
            message: '故事不存在',
            data: null,
          }),
          {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }

      return HttpResponse.json<ApiResponse<PhotoStory>>({
        code: 200,
        message: 'success',
        data: story,
      })
    }
  ),

  // 保存练习记录
  http.post('/api/photo-story/save', async ({ request }) => {
    await delay(500)
    const story = (await request.json()) as PhotoStory

    // 更新存储中的故事
    const index = photoStories.findIndex(s => s.id === story.id)
    if (index !== -1) {
      photoStories[index] = {
        ...story,
        status: 'completed',
      }
    }

    return HttpResponse.json<ApiResponse<void>>({
      code: 200,
      message: '保存成功',
      data: undefined,
    })
  }),

  // 删除故事
  http.delete('/api/photo-story/:id', async ({ params }) => {
    await delay(300)
    const { id } = params as { id: string }

    const index = photoStories.findIndex(s => s.id === id)
    if (index !== -1) {
      photoStories.splice(index, 1)
    }

    return HttpResponse.json<ApiResponse<void>>({
      code: 200,
      message: '删除成功',
      data: undefined,
    })
  }),

  // 收藏/取消收藏
  http.post('/api/photo-story/:id/favorite', async ({ params, request }) => {
    await delay(200)
    const { id } = params as { id: string }
    const { isFavorite } = (await request.json()) as { isFavorite: boolean }

    const story = photoStories.find(s => s.id === id)
    if (story) {
      story.isFavorite = isFavorite
      story.favoritedAt = isFavorite ? new Date().toISOString() : undefined
    }

    return HttpResponse.json<ApiResponse<void>>({
      code: 200,
      message: isFavorite ? '已收藏' : '已取消收藏',
      data: undefined,
    })
  }),

  // 获取音频文件（模拟）
  http.get('/mock-audio/:filename', async () => {
    await delay(100)
    // 返回模拟的音频数据
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    })
  }),
]

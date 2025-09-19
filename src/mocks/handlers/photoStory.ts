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

// 模拟存储的照片故事数据 - 初始为空，只包含用户实际生成的内容
let photoStories: PhotoStory[] = []

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

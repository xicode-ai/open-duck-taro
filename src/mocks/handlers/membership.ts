import { http, HttpResponse, delay } from 'msw'
import type { OrderParams } from '../types'

export const membershipHandlers = [
  // 获取会员套餐列表
  http.get('/api/membership/plans', async () => {
    await delay(400)

    const plans = [
      {
        id: 'basic',
        name: '基础版',
        price: 0,
        currency: 'CNY',
        period: 'forever',
        features: [
          '每日30分钟学习时长',
          '基础词汇学习',
          '10个免费话题',
          '基础学习统计',
          '社区支持',
        ],
        limitations: [
          'AI对话限制10次/天',
          '翻译限制50次/天',
          '无法下载学习资料',
        ],
        current: true,
      },
      {
        id: 'plus',
        name: 'Plus会员',
        price: 19.9,
        originalPrice: 29.9,
        currency: 'CNY',
        period: 'month',
        features: [
          '无限学习时长',
          '全部词汇书解锁',
          '50+专业话题',
          '详细学习报告',
          'AI对话无限制',
          '翻译无限制',
          '离线学习包',
          '优先客服支持',
        ],
        limitations: [],
        recommended: true,
        discount: 33,
      },
      {
        id: 'pro',
        name: 'Pro会员',
        price: 168,
        originalPrice: 358.8,
        currency: 'CNY',
        period: 'year',
        features: [
          'Plus会员所有权益',
          '1对1 AI私教定制',
          '专属学习计划',
          '发音纠正指导',
          '商务英语专项',
          '考试备考资料',
          'PDF导出功能',
          '专属学习顾问',
        ],
        limitations: [],
        bestValue: true,
        discount: 53,
        saveAmount: 190.8,
      },
    ]

    return HttpResponse.json({
      code: 200,
      data: plans,
      message: 'success',
    })
  }),

  // 获取当前会员信息
  http.get('/api/membership/current', async () => {
    await delay(300)

    const membership = {
      type: 'basic',
      status: 'active',
      startDate: '2024-01-01',
      endDate: null,
      autoRenew: false,
      benefits: {
        dailyMinutes: 30,
        aiChats: 10,
        translations: 50,
        topics: 10,
        vocabularyBooks: 1,
      },
      usage: {
        todayMinutes: 25,
        todayAiChats: 7,
        todayTranslations: 23,
      },
    }

    return HttpResponse.json({
      code: 200,
      data: membership,
      message: 'success',
    })
  }),

  // 购买会员
  http.post('/api/membership/purchase', async ({ request }) => {
    await delay(800)
    const body = (await request.json()) as {
      planId: string
      paymentMethod: string
      duration?: number
    }

    // 模拟支付流程
    const orderId = `ORDER-${Date.now()}`

    return HttpResponse.json({
      code: 200,
      data: {
        orderId,
        planId: body.planId,
        amount: body.planId === 'plus' ? 19.9 : 168,
        paymentUrl: `/mock-payment/${orderId}`,
        status: 'pending',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30分钟后过期
      },
      message: '订单创建成功',
    })
  }),

  // 检查订单状态
  http.get<OrderParams>(
    '/api/membership/order/:orderId',
    async ({ params }) => {
      await delay(500)

      return HttpResponse.json({
        code: 200,
        data: {
          orderId: params.orderId,
          status: Math.random() > 0.5 ? 'completed' : 'pending',
          planId: 'plus',
          amount: 19.9,
          paidAt: new Date().toISOString(),
          membershipActivated: true,
        },
        message: 'success',
      })
    }
  ),

  // 取消会员
  http.post('/api/membership/cancel', async () => {
    await delay(500)

    return HttpResponse.json({
      code: 200,
      data: {
        cancelled: true,
        effectiveDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        refundable: false,
      },
      message: '会员已取消，将在当前周期结束后失效',
    })
  }),

  // 获取会员权益对比
  http.get('/api/membership/comparison', async () => {
    await delay(400)

    const comparison = [
      {
        feature: '每日学习时长',
        basic: '30分钟',
        plus: '无限制',
        pro: '无限制',
      },
      {
        feature: 'AI对话次数',
        basic: '10次/天',
        plus: '无限制',
        pro: '无限制',
      },
      {
        feature: '翻译次数',
        basic: '50次/天',
        plus: '无限制',
        pro: '无限制',
      },
      {
        feature: '学习话题',
        basic: '10个',
        plus: '50+个',
        pro: '100+个',
      },
      {
        feature: '词汇书',
        basic: '基础词汇',
        plus: '全部解锁',
        pro: '全部解锁+专属',
      },
      {
        feature: '学习报告',
        basic: '基础统计',
        plus: '详细报告',
        pro: '深度分析',
      },
      {
        feature: '离线学习',
        basic: '❌',
        plus: '✅',
        pro: '✅',
      },
      {
        feature: '1对1指导',
        basic: '❌',
        plus: '❌',
        pro: '✅',
      },
      {
        feature: '定制计划',
        basic: '❌',
        plus: '❌',
        pro: '✅',
      },
      {
        feature: '客服支持',
        basic: '社区',
        plus: '优先',
        pro: '专属顾问',
      },
    ]

    return HttpResponse.json({
      code: 200,
      data: comparison,
      message: 'success',
    })
  }),

  // 获取会员活动和优惠
  http.get('/api/membership/promotions', async () => {
    await delay(300)

    const promotions = [
      {
        id: 'promo-001',
        title: '新用户专享',
        description: '首月仅需9.9元',
        discount: 50,
        code: 'NEW50',
        validUntil: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicable: ['plus'],
      },
      {
        id: 'promo-002',
        title: '年度特惠',
        description: '年付立减100元',
        discount: 100,
        code: 'YEAR100',
        validUntil: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicable: ['pro'],
      },
    ]

    return HttpResponse.json({
      code: 200,
      data: promotions,
      message: 'success',
    })
  }),

  // 获取支付方式
  http.get('/api/membership/payment-methods', async () => {
    await delay(200)

    const methods = [
      {
        id: 'alipay',
        name: '支付宝',
        icon: '💰',
        enabled: true,
      },
      {
        id: 'wechat',
        name: '微信支付',
        icon: '💚',
        enabled: true,
      },
      {
        id: 'card',
        name: '银行卡',
        icon: '💳',
        enabled: true,
      },
      {
        id: 'apple',
        name: 'Apple Pay',
        icon: '🍎',
        enabled: false,
      },
    ]

    return HttpResponse.json({
      code: 200,
      data: methods,
      message: 'success',
    })
  }),
]

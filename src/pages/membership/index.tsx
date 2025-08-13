import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { AtIcon, AtButton, AtModal, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui'
import ErrorBoundary from '@/components/ErrorBoundary'
import './index.scss'

interface MembershipPlan {
  id: string
  name: string
  price: number
  originalPrice?: number
  period: string
  features: string[]
  popular?: boolean
  savings?: string
}

interface MembershipInfo {
  level: 'free' | 'basic' | 'pro' | 'premium'
  expireDate: string
  features: string[]
  price: number
}

const Membership = () => {
  const [membershipInfo, setMembershipInfo] = useState<MembershipInfo | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const membershipPlans: MembershipPlan[] = [
    {
      id: 'monthly',
      name: '月度会员',
      price: 39,
      period: '月',
      features: ['无限次AI对话练习', '专业发音评分系统', '高级话题课程解锁', '个性化学习计划'],
    },
    {
      id: 'yearly',
      name: '年度会员',
      price: 199,
      originalPrice: 468,
      period: '年',
      features: [
        '无限次AI对话练习',
        '专业发音评分系统',
        '高级话题课程解锁',
        '个性化学习计划',
        '离线下载功能',
        '专属客服支持',
        '优先体验新功能',
      ],
      popular: true,
      savings: '节省60%',
    },
    {
      id: 'lifetime',
      name: '终身会员',
      price: 999,
      period: '终身',
      features: ['所有Pro功能', '终身免费更新', '专属学习顾问', 'VIP学习社群', '定制学习方案'],
    },
  ]

  const freeFeatures = ['基础AI对话练习（每日5次）', '基础话题课程', '单词学习', '基础翻译功能']

  const loadMembershipInfo = async () => {
    setIsLoading(true)
    // 这里应该调用真实的API
    // const info = await membershipApi.getMembershipInfo()
    // setMembershipInfo(info.data)

    // 模拟数据
    setMembershipInfo({
      level: 'free',
      expireDate: '',
      features: freeFeatures,
      price: 0,
    })
    setIsLoading(false)
  }

  useEffect(() => {
    loadMembershipInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePlanSelect = (plan: MembershipPlan) => {
    setSelectedPlan(plan)
    setShowPurchaseModal(true)
  }

  const handlePurchase = async () => {
    if (!selectedPlan) return

    setIsLoading(true)
    // 这里应该调用真实的购买API
    // const result = await membershipApi.purchaseMembership(selectedPlan.id, 'wechat')

    // 模拟购买流程
    await new Promise(resolve => setTimeout(resolve, 2000))

    Taro.showToast({ title: '购买成功！', icon: 'success' })
    setShowPurchaseModal(false)

    // 重新加载会员信息
    loadMembershipInfo()
    setIsLoading(false)
  }

  const getCurrentLevelText = () => {
    if (!membershipInfo) return '免费用户'

    const levelMap = {
      free: '免费用户',
      basic: '基础会员',
      pro: 'Pro会员',
      premium: '高级会员',
    }
    return levelMap[membershipInfo.level]
  }

  const getCurrentLevelColor = () => {
    if (!membershipInfo) return '#999999'

    const colorMap = {
      free: '#999999',
      basic: '#4A90E2',
      pro: '#50C878',
      premium: '#9B59B6',
    }
    return colorMap[membershipInfo.level]
  }

  const renderPlanCard = (plan: MembershipPlan) => (
    <View
      key={plan.id}
      className={`plan-card ${plan.popular ? 'popular' : ''}`}
      onClick={() => handlePlanSelect(plan)}
    >
      {plan.popular && <View className="popular-badge">最受欢迎</View>}

      <View className="plan-header">
        <Text className="plan-name">{plan.name}</Text>
        <View className="plan-price">
          <Text className="price-currency">¥</Text>
          <Text className="price-amount">{plan.price}</Text>
          <Text className="price-unit">/{plan.period}</Text>
        </View>
        {plan.originalPrice && <Text className="original-price">¥{plan.originalPrice}</Text>}
        {plan.savings && <Text className="savings-text">{plan.savings}</Text>}
      </View>

      <View className="plan-features">
        {plan.features.map(feature => (
          <View key={feature} className="plan-feature-item">
            <AtIcon value="check" size="16" color="#50C878" />
            <Text className="feature-text">{feature}</Text>
          </View>
        ))}
      </View>

      <AtButton type="primary" className="select-plan-btn" size="small">
        选择此方案
      </AtButton>
    </View>
  )

  return (
    <ErrorBoundary>
      <View className="membership-page">
        <ScrollView className="content-area" scrollY>
          {/* 当前会员状态 */}
          <View className="current-status-section">
            <View className="status-card">
              <View className="status-header">
                <Text className="status-title">当前状态</Text>
                <View className="status-badge" style={{ backgroundColor: getCurrentLevelColor() }}>
                  {getCurrentLevelText()}
                </View>
              </View>

              {membershipInfo?.level !== 'free' && (
                <View className="expire-info">
                  <Text className="expire-text">到期时间：{membershipInfo?.expireDate}</Text>
                </View>
              )}
            </View>
          </View>

          {/* 功能对比 */}
          <View className="comparison-section">
            <Text className="section-title">功能对比</Text>

            <View className="comparison-table">
              <View className="table-header">
                <Text className="header-feature">功能</Text>
                <Text className="header-free">免费版</Text>
                <Text className="header-pro">Pro版</Text>
              </View>

              <View className="table-row">
                <Text className="row-feature">AI对话练习</Text>
                <Text className="row-free">每日5次</Text>
                <Text className="row-pro">无限次</Text>
              </View>

              <View className="table-row">
                <Text className="row-feature">发音评分</Text>
                <Text className="row-free">基础版</Text>
                <Text className="row-pro">专业版</Text>
              </View>

              <View className="table-row">
                <Text className="row-feature">话题课程</Text>
                <Text className="row-free">基础话题</Text>
                <Text className="row-pro">全部话题</Text>
              </View>

              <View className="table-row">
                <Text className="row-feature">离线下载</Text>
                <Text className="row-free">不支持</Text>
                <Text className="row-pro">支持</Text>
              </View>

              <View className="table-row">
                <Text className="row-feature">客服支持</Text>
                <Text className="row-free">社区支持</Text>
                <Text className="row-pro">专属客服</Text>
              </View>
            </View>
          </View>

          {/* 会员方案 */}
          <View className="plans-section">
            <Text className="section-title">选择适合您的方案</Text>
            <View className="plans-grid">{membershipPlans.map(renderPlanCard)}</View>
          </View>

          {/* 常见问题 */}
          <View className="faq-section">
            <Text className="section-title">常见问题</Text>

            <View className="faq-item">
              <Text className="faq-question">Q: 可以随时取消会员吗？</Text>
              <Text className="faq-answer">
                A: 是的，您可以随时取消会员，已付费的会员权益在到期前仍然有效。
              </Text>
            </View>

            <View className="faq-item">
              <Text className="faq-question">Q: 支持哪些支付方式？</Text>
              <Text className="faq-answer">A: 支持微信支付、支付宝、银行卡等多种支付方式。</Text>
            </View>

            <View className="faq-item">
              <Text className="faq-question">Q: 会员可以退款吗？</Text>
              <Text className="faq-answer">
                A: 根据相关法律法规，虚拟商品不支持退款，但您可以联系客服处理特殊情况。
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* 购买确认弹窗 */}
        <AtModal isOpened={showPurchaseModal}>
          <AtModalHeader>确认购买</AtModalHeader>
          <AtModalContent>
            <View className="purchase-confirm">
              <Text className="confirm-plan">{selectedPlan?.name}</Text>
              <Text className="confirm-price">¥{selectedPlan?.price}</Text>
              <Text className="confirm-period">/{selectedPlan?.period}</Text>
              <Text className="confirm-features">
                包含功能：{selectedPlan?.features.join('、')}
              </Text>
            </View>
          </AtModalContent>
          <AtModalAction>
            <AtButton onClick={() => setShowPurchaseModal(false)}>取消</AtButton>
            <AtButton type="primary" onClick={handlePurchase} loading={isLoading}>
              确认购买
            </AtButton>
          </AtModalAction>
        </AtModal>
      </View>
    </ErrorBoundary>
  )
}

export default Membership

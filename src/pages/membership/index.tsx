import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { AtIcon, AtButton, AtModal } from 'taro-ui'
import { safeAsync, safeEventHandler } from '@/utils'
import { withPageErrorBoundary } from '@/components/ErrorBoundary/PageErrorBoundary'
import { CustomNavBar, GradientCard } from '../../components/common'
import './index.scss'

interface MembershipPlan {
  id: string
  name: string
  price: number
  originalPrice?: number
  period: string
  features: string[]
  popular?: boolean
  badge?: string
  gradient: 'primary' | 'orange' | 'purple'
}

const Membership = () => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPlan] = useState('free')

  const membershipPlans: MembershipPlan[] = [
    {
      id: 'monthly',
      name: '月度Pro',
      price: 39,
      period: '月',
      features: [
        '无限次AI对话',
        '专业发音评分',
        '全部话题解锁',
        '学习数据分析',
      ],
      gradient: 'primary',
    },
    {
      id: 'yearly',
      name: '年度Pro',
      price: 199,
      originalPrice: 468,
      period: '年',
      features: [
        '月度Pro所有功能',
        '离线学习模式',
        '专属客服支持',
        '优先新功能体验',
        '学习成就徽章',
      ],
      popular: true,
      badge: '最受欢迎',
      gradient: 'orange',
    },
    {
      id: 'lifetime',
      name: '终身Pro',
      price: 999,
      period: '终身',
      features: [
        '永久享受所有功能',
        '终身免费更新',
        '专属学习顾问',
        'VIP学习社群',
        '个人定制课程',
      ],
      gradient: 'purple',
    },
  ]

  // 会员权益对比数据
  const memberBenefits = [
    {
      icon: '💬',
      title: '无限AI对话',
      free: '每日5次',
      pro: '无限制',
    },
    {
      icon: '🎯',
      title: '发音评分',
      free: '基础版',
      pro: '专业版',
    },
    {
      icon: '📚',
      title: '话题课程',
      free: '基础话题',
      pro: '全部话题',
    },
    {
      icon: '📊',
      title: '学习报告',
      free: '简单统计',
      pro: '详细分析',
    },
    {
      icon: '💾',
      title: '离线功能',
      free: '不支持',
      pro: '完全支持',
    },
  ]

  const handlePlanSelect = safeEventHandler((plan: MembershipPlan) => {
    setSelectedPlan(plan)
    setShowPurchaseModal(true)
  }, 'plan-select')

  const handlePurchase = safeAsync(async () => {
    if (!selectedPlan) return

    setIsLoading(true)
    // 模拟购买流程
    await new Promise(resolve => setTimeout(resolve, 2000))

    Taro.showToast({ title: '购买成功！', icon: 'success' })
    setShowPurchaseModal(false)
    setIsLoading(false)
  }, 'api')

  // 返回上一页
  const _handleBack = safeEventHandler(() => {
    Taro.navigateBack()
  }, 'back')

  return (
    <View className="membership-page">
      <CustomNavBar title="开通会员" backgroundColor="#FFD700" />
      <ScrollView className="content-area" scrollY>
        {/* Hero区域 */}
        <View className="hero-section">
          <View className="hero-icon">
            <Text className="crown-emoji">👑</Text>
          </View>
          <Text className="hero-title">升级Pro会员</Text>
          <Text className="hero-subtitle">解锁全部功能，让英语学习更高效</Text>
        </View>

        {/* 当前状态卡片 */}
        <View className="status-section">
          <View className="status-card">
            <View className="status-content">
              <Text className="status-label">当前版本</Text>
              <Text className="status-value">
                {currentPlan === 'free' ? '免费版' : 'Pro版'}
              </Text>
              {currentPlan === 'free' && (
                <Text className="status-desc">升级Pro解锁更多功能</Text>
              )}
            </View>
            <View className="status-icon">
              <Text className="status-emoji">
                {currentPlan === 'free' ? '🔒' : '🔓'}
              </Text>
            </View>
          </View>
        </View>

        {/* 会员权益对比 */}
        <View className="benefits-section">
          <Text className="section-title">Pro会员权益</Text>
          <View className="benefits-list">
            {memberBenefits.map((benefit, index) => (
              <View key={index} className="benefit-item">
                <View className="benefit-icon">
                  <Text className="benefit-emoji">{benefit.icon}</Text>
                </View>
                <View className="benefit-content">
                  <Text className="benefit-title">{benefit.title}</Text>
                  <View className="benefit-comparison">
                    <Text className="benefit-free">免费：{benefit.free}</Text>
                    <Text className="benefit-pro">Pro：{benefit.pro}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 价格方案 */}
        <View className="plans-section">
          <Text className="section-title">选择订阅方案</Text>
          <View className="plans-container">
            {membershipPlans.map(plan => (
              <GradientCard
                key={plan.id}
                className={`plan-card ${plan.popular ? 'popular' : ''}`}
                gradient={plan.gradient}
              >
                {plan.badge && (
                  <View className="plan-badge">
                    <Text className="badge-text">{plan.badge}</Text>
                  </View>
                )}

                <View className="plan-header">
                  <Text className="plan-name">{plan.name}</Text>
                  <View className="plan-price">
                    <Text className="price-symbol">¥</Text>
                    <Text className="price-amount">{plan.price}</Text>
                    <Text className="price-period">/{plan.period}</Text>
                  </View>
                  {plan.originalPrice && (
                    <Text className="original-price">
                      原价 ¥{plan.originalPrice}
                    </Text>
                  )}
                </View>

                <View className="plan-features">
                  {plan.features.map((feature, index) => (
                    <View key={index} className="feature-item">
                      <AtIcon value="check" size="14" color="white" />
                      <Text className="feature-text">{feature}</Text>
                    </View>
                  ))}
                </View>

                <View className="plan-action">
                  <AtButton
                    className="plan-btn"
                    onClick={() => handlePlanSelect(plan)}
                  >
                    选择此方案
                  </AtButton>
                </View>
              </GradientCard>
            ))}
          </View>
        </View>

        {/* 特色功能展示 */}
        <View className="features-showcase">
          <Text className="section-title">Pro版专享功能</Text>
          <View className="showcase-grid">
            <View className="showcase-item">
              <Text className="showcase-icon">🎯</Text>
              <Text className="showcase-title">智能学习计划</Text>
              <Text className="showcase-desc">
                基于你的水平制定个性化学习路径
              </Text>
            </View>
            <View className="showcase-item">
              <Text className="showcase-icon">📊</Text>
              <Text className="showcase-title">详细学习报告</Text>
              <Text className="showcase-desc">
                深度分析学习数据，追踪进步轨迹
              </Text>
            </View>
            <View className="showcase-item">
              <Text className="showcase-icon">🏆</Text>
              <Text className="showcase-title">成就系统</Text>
              <Text className="showcase-desc">获得学习徽章，激励持续进步</Text>
            </View>
            <View className="showcase-item">
              <Text className="showcase-icon">💬</Text>
              <Text className="showcase-title">专属客服</Text>
              <Text className="showcase-desc">7x24小时专业客服支持</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 购买确认弹窗 */}
      <AtModal
        isOpened={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
      >
        <View className="purchase-modal">
          <View className="modal-header">
            <Text className="modal-title">确认购买</Text>
          </View>
          <View className="modal-content">
            <Text className="plan-name">{selectedPlan?.name}</Text>
            <View className="price-info">
              <Text className="price-text">¥{selectedPlan?.price}</Text>
              <Text className="period-text">/{selectedPlan?.period}</Text>
            </View>
          </View>
          <View className="modal-actions">
            <AtButton
              className="cancel-btn"
              onClick={() => setShowPurchaseModal(false)}
            >
              取消
            </AtButton>
            <AtButton
              type="primary"
              className="confirm-btn"
              onClick={handlePurchase}
              loading={isLoading}
            >
              确认支付
            </AtButton>
          </View>
        </View>
      </AtModal>
    </View>
  )
}

export default withPageErrorBoundary(Membership, {
  pageName: '会员中心',
  enableErrorReporting: true,
  showRetry: true,
  onError: (error, errorInfo) => {
    console.log('会员中心页面发生错误:', error, errorInfo)
  },
})

import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import CustomNavBar from '../../components/common/CustomNavBar'
import { useUserStore } from '../../stores/user'
import './index.scss'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  period: string
  discount?: string
  features: string[]
  recommended?: boolean
}

const MembershipPage = () => {
  const { upgradeMembership } = useUserStore()

  const [selectedPlan, setSelectedPlan] = useState('yearly')
  const [selectedPayment, setSelectedPayment] = useState('wechat')
  const [isPurchasing, setIsPurchasing] = useState(false)

  // 会员权益
  const benefits = [
    {
      icon: '🚀',
      title: '无限使用',
      description: '所有功能无限制使用',
    },
    {
      icon: '🎯',
      title: '自定义话题',
      description: '创建专属对话话题',
    },
    {
      icon: '📊',
      title: '详细报告',
      description: '专业学习分析报告',
    },
    {
      icon: '🎓',
      title: '专属计划',
      description: '个性化学习计划',
    },
    {
      icon: '⚡',
      title: '优先支持',
      description: '专属客服优先响应',
    },
    {
      icon: '🔄',
      title: '数据同步',
      description: '多设备数据同步',
    },
  ]

  // 功能对比数据
  const comparisonFeatures = [
    { feature: '每日对话次数', free: '10次', premium: '无限制' },
    { feature: '翻译功能', free: '3次/天', premium: '无限制' },
    { feature: '拍照短文', free: '3次/天', premium: '无限制' },
    { feature: '自定义话题', free: '✗', premium: '✓' },
    { feature: '学习报告', free: '基础版', premium: '专业版' },
    { feature: '广告', free: '有广告', premium: '无广告' },
    { feature: '客服支持', free: '普通', premium: '优先' },
  ]

  // 套餐计划
  const plans: Plan[] = [
    {
      id: 'monthly',
      name: '月度会员',
      description: '按月订阅，随时取消',
      price: 29,
      period: '月',
      features: [
        '所有功能无限使用',
        '创建自定义话题',
        '详细学习报告',
        '无广告体验',
        '优先客服支持',
      ],
    },
    {
      id: 'yearly',
      name: '年度会员',
      description: '性价比最高，推荐选择',
      price: 198,
      originalPrice: 348,
      period: '年',
      discount: '限时43%OFF',
      recommended: true,
      features: [
        '所有月度会员权益',
        '专属学习计划定制',
        '多设备数据同步',
        '学习成果认证',
        '专属学习社群',
        '定期功能更新抢先体验',
      ],
    },
    {
      id: 'lifetime',
      name: '终身会员',
      description: '一次购买，终身享用',
      price: 599,
      originalPrice: 999,
      period: '终身',
      discount: '限时40%OFF',
      features: [
        '所有会员权益永久享用',
        'AI学习助手个性化训练',
        '专业口语水平认证',
        '定期线上学习活动',
        '终身免费功能更新',
        '专属VIP客服通道',
      ],
    },
  ]

  // 支付方式
  const paymentMethods = [
    { id: 'wechat', name: '微信支付', icon: '💚' },
    { id: 'alipay', name: '支付宝', icon: '💙' },
  ]

  // 选择套餐
  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
  }

  // 选择支付方式
  const handleSelectPayment = (paymentId: string) => {
    setSelectedPayment(paymentId)
  }

  // 购买会员
  const handlePurchase = async () => {
    const plan = plans.find(p => p.id === selectedPlan)
    if (!plan) return

    setIsPurchasing(true)

    try {
      // 模拟支付流程
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 模拟支付成功
      const success = Math.random() > 0.2 // 80% 成功率

      if (success) {
        // 升级会员
        await upgradeMembership({
          isPremium: true,
          type: selectedPlan as 'monthly' | 'yearly' | 'lifetime',
          expiredAt:
            selectedPlan === 'lifetime'
              ? Date.now() + 100 * 365 * 24 * 60 * 60 * 1000 // 100年后
              : selectedPlan === 'yearly'
                ? Date.now() + 365 * 24 * 60 * 60 * 1000 // 1年后
                : Date.now() + 30 * 24 * 60 * 60 * 1000, // 1个月后
        })

        Taro.showModal({
          title: '购买成功！',
          content: `恭喜您成功开通${plan.name}！现在可以无限制使用所有功能了。`,
          showCancel: false,
          confirmText: '开始体验',
          success: () => {
            Taro.switchTab({ url: '/pages/index/index' })
          },
        })
      } else {
        throw new Error('支付失败')
      }
    } catch (error) {
      console.error('购买会员失败:', error)
      Taro.showModal({
        title: '购买失败',
        content: '支付过程中发生错误，请稍后重试。如有问题请联系客服。',
        showCancel: false,
        confirmText: '知道了',
      })
    } finally {
      setIsPurchasing(false)
    }
  }

  const selectedPlanData = plans.find(p => p.id === selectedPlan)

  return (
    <View className="membership-page">
      {/* 导航栏 */}
      <CustomNavBar
        title="开口鸭会员"
        backgroundColor="#FFD700"
        textColor="#333"
        renderRight={
          <View
            className="nav-right-btn"
            onClick={() =>
              Taro.showModal({
                title: '客服联系方式',
                content: '微信：openduck-support\n邮箱：service@openduck.com',
                showCancel: false,
              })
            }
          >
            <AtIcon value="help" size="20" color="#333" />
          </View>
        }
      />

      {/* 会员权益 */}
      <View className="benefits-section">
        <Text className="section-title">会员专享权益</Text>
        <Text className="section-subtitle">让学习更高效，体验更完美</Text>

        <View className="benefits-grid">
          {benefits.map((benefit, index) => (
            <View key={index} className="benefit-item">
              <Text className="benefit-icon">{benefit.icon}</Text>
              <Text className="benefit-title">{benefit.title}</Text>
              <Text className="benefit-desc">{benefit.description}</Text>
            </View>
          ))}
        </View>

        {/* 功能对比 */}
        <View className="comparison-card">
          <Text className="comparison-title">功能对比</Text>

          <View className="comparison-table">
            <View className="table-header">
              <Text className="header-cell feature">功能特性</Text>
              <Text className="header-cell free">免费版</Text>
              <Text className="header-cell premium">会员版</Text>
            </View>

            <View className="table-rows">
              {comparisonFeatures.map((item, index) => (
                <View key={index} className="table-row">
                  <Text className="row-cell feature">{item.feature}</Text>
                  <View className="row-cell free">
                    {item.free === '✗' ? (
                      <AtIcon value="close" className="close-icon" />
                    ) : (
                      <Text>{item.free}</Text>
                    )}
                  </View>
                  <View className="row-cell premium">
                    {item.premium === '✓' ? (
                      <AtIcon value="check" className="check-icon" />
                    ) : item.premium === '无限制' ? (
                      <View
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8rpx',
                        }}
                      >
                        <Text className="crown-icon">👑</Text>
                        <Text>无限</Text>
                      </View>
                    ) : (
                      <Text>{item.premium}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* 套餐选择 */}
      <View className="plans-section">
        <Text className="plans-title">选择套餐</Text>

        <View className="plans-grid">
          {plans.map(plan => (
            <View
              key={plan.id}
              className={`plan-card ${plan.recommended ? 'recommended' : ''} ${selectedPlan === plan.id ? 'selected' : ''}`}
              onClick={() => handleSelectPlan(plan.id)}
            >
              {plan.recommended && (
                <View className="recommend-badge">推荐</View>
              )}

              <View className="plan-header">
                <Text className="plan-name">{plan.name}</Text>
                <Text className="plan-desc">{plan.description}</Text>
              </View>

              <View className="plan-price">
                <View className="price-container">
                  <Text className="currency">¥</Text>
                  <Text className="amount">{plan.price}</Text>
                  <Text className="period">/{plan.period}</Text>
                </View>

                {plan.originalPrice && (
                  <Text className="original-price">
                    原价 ¥{plan.originalPrice}
                  </Text>
                )}

                {plan.discount && (
                  <Text className="discount-label">{plan.discount}</Text>
                )}
              </View>

              <View className="plan-features">
                {plan.features.map((feature, index) => (
                  <View key={index} className="feature-item">
                    <AtIcon value="check" className="feature-icon" />
                    <Text>{feature}</Text>
                  </View>
                ))}
              </View>

              <View
                className={`select-btn ${selectedPlan === plan.id ? 'primary' : 'secondary'}`}
              >
                {selectedPlan === plan.id ? '已选择' : '选择此套餐'}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 支付区域 */}
      <View className="payment-section">
        <View className="payment-methods">
          <Text className="methods-title">支付方式</Text>

          <View className="methods-list">
            {paymentMethods.map(method => (
              <View
                key={method.id}
                className={`method-item ${selectedPayment === method.id ? 'selected' : ''}`}
                onClick={() => handleSelectPayment(method.id)}
              >
                <Text className="method-icon">{method.icon}</Text>
                <Text className="method-name">{method.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View
          className="purchase-btn"
          onClick={handlePurchase}
          style={{
            opacity: isPurchasing ? 0.7 : 1,
            pointerEvents: isPurchasing ? 'none' : 'auto',
          }}
        >
          <Text className="crown-icon">👑</Text>
          <Text>
            {isPurchasing
              ? '处理中...'
              : `立即开通 ¥${selectedPlanData?.price}`}
          </Text>
        </View>

        <Text className="terms-text">
          点击购买即表示同意
          <Text className="link">《用户协议》</Text>和
          <Text className="link">《隐私政策》</Text>
          {'\n'}
          7天无理由退款，随时可取消自动续费
        </Text>
      </View>
    </View>
  )
}

export default MembershipPage

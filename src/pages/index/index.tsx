import { useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import { useUserStore } from '../../stores/user'
import './index.scss'

const IndexPage = () => {
  const { dailyUsage, membership, updateDailyUsage } = useUserStore()

  // 页面初始化
  useEffect(() => {
    // 可以在这里加载用户数据
  }, [])

  // 功能导航数据
  const functionItems = [
    {
      id: 'chat',
      title: '对话模式',
      desc: '与AI外教语音对话练习',
      icon: 'message',
      iconClass: 'blue',
      page: '/pages/chat/index',
    },
    {
      id: 'topics',
      title: '话题模式',
      desc: '选择话题进行场景对话',
      icon: 'tags',
      iconClass: 'green',
      page: '/pages/topics/index',
    },
    {
      id: 'translate',
      title: '翻译功能',
      desc: '中英互译，地道口语表达',
      icon: 'reload',
      iconClass: 'purple',
      page: '/pages/translate/index',
    },
    {
      id: 'photo-story',
      title: '拍照短文',
      desc: '拍照生成英文描述练习',
      icon: 'camera',
      iconClass: 'orange',
      page: '/pages/photo-story/index',
    },
    {
      id: 'vocabulary',
      title: '背单词',
      desc: '语境学习法，分阶段背单词',
      icon: 'book',
      iconClass: 'red',
      page: '/pages/vocabulary/index',
    },
  ]

  // 使用统计数据
  const usageFeatures = [
    {
      key: 'help',
      name: '求助',
      icon: 'help',
      color: 'orange',
    },
    {
      key: 'translate',
      name: '地道翻译',
      icon: 'reload',
      color: 'purple',
    },
    {
      key: 'photo',
      name: '拍照短文',
      icon: 'camera',
      color: 'blue',
    },
  ]

  // 检查功能使用情况
  const checkUsage = (featureKey: string) => {
    const used = dailyUsage[featureKey] || 0
    const limit = membership.isPremium ? Infinity : 3
    return {
      used,
      remaining: membership.isPremium
        ? '∞'
        : Math.max(0, limit - used).toString(),
      canUse: membership.isPremium || used < limit,
    }
  }

  // 导航到页面
  const navigateToPage = (url: string, featureKey?: string) => {
    if (featureKey && !checkUsage(featureKey).canUse) {
      Taro.showModal({
        title: '使用次数已用完',
        content: '今日免费使用次数已用完，开通会员可无限使用所有功能',
        confirmText: '开通会员',
        cancelText: '取消',
        success: res => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/membership/index' })
          }
        },
      })
      return
    }

    if (featureKey) {
      updateDailyUsage(featureKey)
    }

    Taro.navigateTo({ url })
  }

  // 导航到会员页面
  const navigateToMembership = () => {
    Taro.navigateTo({ url: '/pages/membership/index' })
  }

  return (
    <View className="index-page">
      {/* 页面头部 */}
      <View className="page-header">
        <View className="app-logo">
          <View className="duck-logo"></View>
          <Text className="app-title">开口鸭</Text>
        </View>
        <Text className="app-subtitle">与AI外教练习英语口语</Text>
      </View>

      {/* 用户状态卡片 */}
      <View className="user-status-card">
        <View className="card-header">
          <Text className="card-title">今日使用情况</Text>
          <Text
            className={`membership-badge ${membership.isPremium ? 'member' : 'normal'}`}
          >
            {membership.isPremium ? '会员用户' : '普通用户'}
          </Text>
        </View>

        <View className="usage-stats">
          {usageFeatures.map(feature => {
            const usage = checkUsage(feature.key)
            return (
              <View key={feature.key} className={`stat-item ${feature.color}`}>
                <AtIcon value={feature.icon} className="stat-icon" />
                <Text className="stat-name">{feature.name}</Text>
                <Text className="stat-value">剩余: {usage.remaining}</Text>
              </View>
            )
          })}
        </View>

        {!membership.isPremium && (
          <View className="membership-tip">
            <View className="tip-header">
              <AtIcon value="money" className="crown-icon" />
              <Text className="tip-title">开通会员解锁所有功能</Text>
            </View>
            <Text className="tip-content">
              • 无限次使用所有功能 • 创建自定义话题 • 专属学习计划
            </Text>
            <View className="upgrade-btn" onClick={navigateToMembership}>
              立即开通 ¥198/年
            </View>
          </View>
        )}
      </View>

      {/* 功能导航 */}
      <View className="function-grid">
        {functionItems.map(item => (
          <View
            key={item.id}
            className="function-item"
            onClick={() => navigateToPage(item.page, item.id)}
          >
            <View className="function-content">
              <View className={`function-icon ${item.iconClass}`}>
                <AtIcon value={item.icon} className="icon" />
              </View>
              <View className="function-info">
                <Text className="function-title">{item.title}</Text>
                <Text className="function-desc">{item.desc}</Text>
              </View>
              <AtIcon value="chevron-right" className="arrow-icon" />
            </View>
          </View>
        ))}
      </View>

      {/* 每日推荐 */}
      <View className="daily-section">
        <Text className="section-title">
          <Text className="title-icon">📚</Text>
          今日推荐
        </Text>
        <View className="daily-card">
          <View className="daily-content">
            <View className="daily-icon">
              <AtIcon value="lightning" className="icon" />
            </View>
            <View className="daily-info">
              <Text className="daily-title">每日一句</Text>
              <Text className="daily-text">
                &ldquo;Practice makes perfect!&rdquo;
              </Text>
              <Text className="daily-translation">熟能生巧！</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 学习统计 */}
      <View className="stats-section">
        <Text className="section-title">
          <Text className="title-icon">📊</Text>
          今日学习
        </Text>
        <View className="stats-grid">
          <View className="stat-card">
            <Text className="stat-number blue">12</Text>
            <Text className="stat-label">对话练习</Text>
          </View>
          <View className="stat-card">
            <Text className="stat-number green">5</Text>
            <Text className="stat-label">连续打卡</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default IndexPage

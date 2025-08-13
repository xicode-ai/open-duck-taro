import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { AtIcon, AtButton } from 'taro-ui'
import './index.scss'

const Index = () => {
  // 用户使用情况状态
  const [dailyUsage, setDailyUsage] = useState({
    help: 2,
    translate: 1,
    photo: 0,
    conversations: 12,
    streak: 5,
  })

  // 是否会员
  const [isMember] = useState(false)

  // 每日一句
  const [dailyQuote] = useState({
    english: '"Practice makes perfect!"',
    chinese: '熟能生巧！',
    author: '',
  })

  useDidShow(() => {
    // 页面显示时更新数据
    updateDailyUsage()
  })

  const updateDailyUsage = () => {
    // 从本地存储或API获取今日使用情况
    const today = new Date().toDateString()
    const storedUsage = Taro.getStorageSync(`daily_usage_${today}`) || {}
    setDailyUsage(prev => ({ ...prev, ...storedUsage }))
  }

  const functionItems = [
    {
      title: '对话模式',
      subtitle: '与AI外教语音对话练习',
      icon: 'message',
      color: 'blue',
      path: '/pages/chat/index',
    },
    {
      title: '话题模式',
      subtitle: '选择话题进行场景对话',
      icon: 'bookmark-2',
      color: 'green',
      path: '/pages/topics/index',
    },
    {
      title: '翻译功能',
      subtitle: '中英互译，地道口语表达',
      icon: 'reload',
      color: 'purple',
      path: '/pages/translate/index',
    },
    {
      title: '拍照短文',
      subtitle: '拍照生成英文描述练习',
      icon: 'camera',
      color: 'orange',
      path: '/pages/photo-story/index',
    },
    {
      title: '背单词',
      subtitle: '语境学习法，分阶段背单词',
      icon: 'bookmark',
      color: 'red',
      path: '/pages/vocabulary/index',
    },
  ]

  const handleFunctionClick = (path: string) => {
    Taro.navigateTo({ url: path })
  }

  const handleMembershipClick = () => {
    Taro.navigateTo({ url: '/pages/membership/index' })
  }

  return (
    <View className="index-page">
      {/* 用户状态卡片 */}
      <View className="user-status-card">
        <View className="status-header">
          <Text className="status-title">今日使用情况</Text>
          <View className={`membership-badge ${isMember ? 'member' : 'normal'}`}>
            <Text className="badge-text">{isMember ? '会员用户' : '普通用户'}</Text>
          </View>
        </View>

        <View className="usage-stats">
          <View className="stat-item orange">
            <AtIcon value="help" size="16" color="#FF9500" />
            <Text className="stat-name">求助</Text>
            <Text className="stat-value">
              剩余: {isMember ? '∞' : Math.max(0, 3 - dailyUsage.help)}
            </Text>
          </View>
          <View className="stat-item purple">
            <AtIcon value="reload" size="16" color="#9B59B6" />
            <Text className="stat-name">地道翻译</Text>
            <Text className="stat-value">
              剩余: {isMember ? '∞' : Math.max(0, 3 - dailyUsage.translate)}
            </Text>
          </View>
          <View className="stat-item blue">
            <AtIcon value="camera" size="16" color="#4A90E2" />
            <Text className="stat-name">拍照短文</Text>
            <Text className="stat-value">
              剩余: {isMember ? '∞' : Math.max(0, 3 - dailyUsage.photo)}
            </Text>
          </View>
        </View>

        {!isMember && (
          <View className="membership-tip" onClick={handleMembershipClick}>
            <View className="tip-header">
              <AtIcon value="heart" size="16" color="#FFB800" />
              <Text className="tip-title">开通会员解锁所有功能</Text>
            </View>
            <Text className="tip-subtitle">
              • 无限次使用所有功能 • 创建自定义话题 • 专属学习计划
            </Text>
            <AtButton size="small" className="membership-btn">
              立即开通 ¥198/年
            </AtButton>
          </View>
        )}
      </View>

      {/* 功能导航 */}
      <View className="functions-section">
        {functionItems.map((item, index) => (
          <View
            key={index}
            className="function-item"
            onClick={() => handleFunctionClick(item.path)}
          >
            <View className={`function-icon ${item.color}`}>
              <AtIcon value={item.icon} size="24" color="white" />
            </View>
            <View className="function-content">
              <Text className="function-title">{item.title}</Text>
              <Text className="function-subtitle">{item.subtitle}</Text>
            </View>
            <AtIcon value="chevron-right" size="16" color="#CCCCCC" />
          </View>
        ))}
      </View>

      {/* 每日推荐 */}
      <View className="daily-section">
        <Text className="section-title">📚 今日推荐</Text>
        <View className="daily-quote-card">
          <View className="quote-icon">
            <AtIcon value="lightning" size="24" color="white" />
          </View>
          <View className="quote-content">
            <Text className="quote-label">每日一句</Text>
            <Text className="quote-english">{dailyQuote.english}</Text>
            <Text className="quote-chinese">{dailyQuote.chinese}</Text>
          </View>
        </View>
      </View>

      {/* 学习统计 */}
      <View className="stats-section">
        <Text className="section-title">📊 今日学习</Text>
        <View className="stats-grid">
          <View className="stats-item">
            <Text className="stats-number">{dailyUsage.conversations}</Text>
            <Text className="stats-label">对话练习</Text>
          </View>
          <View className="stats-item">
            <Text className="stats-number">{dailyUsage.streak}</Text>
            <Text className="stats-label">连续打卡</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default Index

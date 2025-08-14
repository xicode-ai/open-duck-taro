import React from 'react'
import { View, Text } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import './index.scss'

const Index: React.FC = () => {
  // 功能导航数据
  const functionItems = [
    {
      icon: '💬',
      title: 'AI 对话',
      subtitle: '与 AI 进行真实的英语对话练习',
      color: 'blue',
      path: '/pages/chat/index',
    },
    {
      icon: '📚',
      title: '话题学习',
      subtitle: '多种生活场景话题，情境化学习',
      color: 'green',
      path: '/pages/topics/index',
    },
    {
      icon: '🔄',
      title: '智能翻译',
      subtitle: '提供标准翻译和口语化表达',
      color: 'purple',
      path: '/pages/translate/index',
    },
    {
      icon: '📸',
      title: '拍照短文',
      subtitle: 'AI 分析图片生成英文短文',
      color: 'orange',
      path: '/pages/photo-story/index',
    },
    {
      icon: '📖',
      title: '背单词',
      subtitle: '语境学习法，分阶段词汇学习',
      color: 'red',
      path: '/pages/vocabulary/index',
    },
  ]

  // 每日推荐内容
  const dailyQuote = {
    english: 'The only way to do great work is to love what you do.',
    chinese: '做出伟大工作的唯一方法就是热爱你所做的事情。',
    author: 'Steve Jobs',
  }

  // 学习统计数据
  const learningStats = [
    { number: '127', label: '学习天数' },
    { number: '1,234', label: '掌握单词' },
    { number: '89', label: '完成对话' },
  ]

  return (
    <View className="index-page">
      {/* 用户状态卡片 */}
      <View className="user-status-card">
        <View className="status-header">
          <Text className="status-title">学习状态</Text>
          <View className="membership-badge normal">
            <Text className="badge-text">普通用户</Text>
          </View>
        </View>

        <View className="usage-stats">
          <View className="stat-item orange">
            <Text className="stat-name">今日对话</Text>
            <Text className="stat-value">3/10</Text>
          </View>
          <View className="stat-item purple">
            <Text className="stat-name">单词学习</Text>
            <Text className="stat-value">15/20</Text>
          </View>
          <View className="stat-item blue">
            <Text className="stat-name">学习时长</Text>
            <Text className="stat-value">25分钟</Text>
          </View>
        </View>

        <View className="membership-tip">
          <View className="tip-header">
            <Text className="tip-title">🎯</Text>
            <Text className="tip-title">升级会员</Text>
          </View>
          <Text className="tip-subtitle">
            解锁无限对话次数、高级AI模型、专属学习计划等特权
          </Text>
          <AtButton className="membership-btn" size="small">
            立即升级
          </AtButton>
        </View>
      </View>

      {/* 功能导航 */}
      <View className="functions-section">
        {functionItems.map((item, index) => (
          <View key={index} className="function-item">
            <View className={`function-icon ${item.color}`}>
              <Text style={{ fontSize: '24px' }}>{item.icon}</Text>
            </View>
            <View className="function-content">
              <Text className="function-title">{item.title}</Text>
              <Text className="function-subtitle">{item.subtitle}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 每日推荐 */}
      <View className="daily-section">
        <Text className="section-title">每日一句</Text>
        <View className="daily-quote-card">
          <View className="quote-icon">
            <Text style={{ fontSize: '24px', color: 'white' }}>💡</Text>
          </View>
          <View className="quote-content">
            <Text className="quote-label">今日推荐</Text>
            <Text className="quote-english">{dailyQuote.english}</Text>
            <Text className="quote-chinese">{dailyQuote.chinese}</Text>
          </View>
        </View>
      </View>

      {/* 学习统计 */}
      <View className="stats-section">
        <Text className="section-title">学习统计</Text>
        <View className="stats-grid">
          {learningStats.map((stat, index) => (
            <View key={index} className="stats-item">
              <Text className="stats-number">{stat.number}</Text>
              <Text className="stats-label">{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

export default Index

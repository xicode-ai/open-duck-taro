import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow, useDidHide, useShareAppMessage } from '@tarojs/taro'
import { withPageErrorBoundary } from '../../components/ErrorBoundary/PageErrorBoundary'
import SvgIcon from '../../components/SvgIcon'
import './index.scss'

const Index: React.FC = () => {
  // 使用 Taro 的生命周期 hooks
  useDidShow(() => {
    console.log('Index page show')
  })

  useDidHide(() => {
    console.log('Index page hide')
  })

  useShareAppMessage(() => ({
    title: '开口鸭 - AI英语学习助手',
    path: '/pages/index/index',
  }))

  const handleNavigate = (path: string) => {
    const tabPaths = [
      '/pages/index/index',
      '/pages/progress/index',
      '/pages/vocabulary/index',
      '/pages/profile/index',
    ]
    if (tabPaths.some(tabPath => path.startsWith(tabPath))) {
      Taro.switchTab({ url: path })
    } else {
      Taro.navigateTo({ url: path })
    }
  }

  // 今日使用情况数据 - 使用SVG图标替换emoji
  const todayUsage = [
    {
      title: '求助',
      remaining: 3,
      icon: 'help',
      iconBg: '#FF9500',
      bgColor: '#FFF4E6',
    },
    {
      title: '地道翻译',
      remaining: 3,
      icon: 'translate',
      iconBg: '#AF52DE',
      bgColor: '#F3E8FF',
    },
    {
      title: '拍照短文',
      remaining: 3,
      icon: 'camera',
      iconBg: '#007AFF',
      bgColor: '#E8F2FF',
    },
  ]

  // 主要功能模块 - 优化图标和描述
  const mainFunctions = [
    {
      icon: 'chat',
      title: '对话模式',
      subtitle: '与AI外教语音对话练习',
      iconBg: '#007AFF',
      path: '/pages/chat/index',
    },
    {
      icon: 'list',
      title: '话题模式',
      subtitle: '选择话题进行场景对话',
      iconBg: '#34C759',
      path: '/pages/topics/index',
    },
    {
      icon: 'translate',
      title: '翻译功能',
      subtitle: '中英互译，地道口语表达',
      iconBg: '#AF52DE',
      path: '/pages/translate/index',
    },
    {
      icon: 'camera',
      title: '拍照短文',
      subtitle: '拍照生成英文描述练习',
      iconBg: '#FF9500',
      path: '/pages/photo-story/index',
    },
    {
      icon: 'book',
      title: '背单词',
      subtitle: '语境学习法，分阶段背单词',
      iconBg: '#FF3B30',
      path: '/pages/vocabulary/index',
    },
  ]

  return (
    <View className="home-page">
      {/* 用户状态卡片 */}
      <View className="user-status-card">
        {/* 状态标题栏 */}
        <View className="status-header">
          <Text className="status-title">今日使用情况</Text>
          <View className="user-badge">
            <Text className="badge-text">普通用户</Text>
          </View>
        </View>

        {/* 使用统计三个小卡片 */}
        <View className="usage-stats">
          {todayUsage.map((item, index) => (
            <View
              key={index}
              className="usage-item"
              style={{ backgroundColor: item.bgColor }}
            >
              <View
                className="usage-icon-wrapper"
                style={{ backgroundColor: item.iconBg }}
              >
                <SvgIcon name={item.icon} size={20} color="white" />
              </View>
              <Text className="usage-name">{item.title}</Text>
              <Text className="usage-remaining">剩余: {item.remaining}</Text>
            </View>
          ))}
        </View>

        {/* 会员开通提示 */}
        <View className="membership-tip">
          <View className="tip-header">
            <View className="crown-icon">
              <SvgIcon name="crown" size={24} color="#FFD700" />
            </View>
            <Text className="tip-title">开通会员解锁所有功能</Text>
          </View>
          <View className="tip-features">
            <Text className="feature-item">• 无限次使用所有功能</Text>
            <Text className="feature-item">• 创建自定义话题·专属学习计划</Text>
          </View>
          <View
            className="membership-btn"
            onClick={() => handleNavigate('/pages/membership/index')}
          >
            <Text className="button-text">立即开通 ¥198/年</Text>
          </View>
        </View>
      </View>

      {/* 主要功能模块 */}
      <View className="main-functions">
        {mainFunctions.map((func, index) => (
          <View
            key={index}
            className="function-item"
            onClick={() => handleNavigate(func.path)}
          >
            <View
              className="function-icon"
              style={{ backgroundColor: func.iconBg }}
            >
              <SvgIcon name={func.icon} size={24} color="white" />
            </View>
            <View className="function-content">
              <Text className="function-title">{func.title}</Text>
              <Text className="function-subtitle">{func.subtitle}</Text>
            </View>
            <View className="function-arrow">
              <SvgIcon name="arrow-right" size={20} color="#C7C7CC" />
            </View>
          </View>
        ))}
      </View>

      {/* 今日推荐 */}
      <View className="daily-recommendation">
        <View className="section-header">
          <SvgIcon name="star" size={20} color="#34C759" />
          <Text className="section-title">今日推荐</Text>
        </View>
        <View className="recommendation-card">
          <View className="recommendation-icon">
            <SvgIcon name="lightbulb" size={24} color="#FF6B6B" />
          </View>
          <View className="recommendation-content">
            <Text className="recommendation-title">每日一句</Text>
            <Text className="english-sentence">
              &ldquo;Practice makes perfect!&rdquo;
            </Text>
            <Text className="chinese-sentence">熟能生巧！</Text>
          </View>
        </View>
      </View>

      {/* 今日学习 */}
      <View className="learning-stats">
        <View className="section-header">
          <SvgIcon name="analytics" size={20} color="#34C759" />
          <Text className="section-title">今日学习</Text>
        </View>
        <View className="stats-grid">
          <View className="stat-item">
            <Text className="stat-number">12</Text>
            <View className="stat-footer">
              <SvgIcon name="arrow-up" size={14} color="#007AFF" />
            </View>
          </View>
          <View className="stat-divider" />
          <View className="stat-item">
            <Text className="stat-number">5</Text>
            <View className="stat-footer">
              <SvgIcon name="analytics" size={14} color="#34C759" />
            </View>
          </View>
        </View>
      </View>

      {/* 页面底部间距 */}
      <View className="page-footer" />
    </View>
  )
}

// 使用 HOC 包装组件，添加页面级错误边界
export default withPageErrorBoundary(Index, {
  pageName: '首页',
  enableErrorReporting: true,
  showRetry: true,
  onError: (error, errorInfo) => {
    // 自定义错误处理逻辑
    console.log('首页发生错误:', error, errorInfo)
  },
})

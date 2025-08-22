import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Image, ScrollView, Switch } from '@tarojs/components'
import { AtIcon, AtModal } from 'taro-ui'
import { useUserStore, useSettingsStore } from '@/stores'
import { safeEventHandler } from '@/utils'
import { withPageErrorBoundary } from '@/components/ErrorBoundary/PageErrorBoundary'
import { GradientCard, StatCard } from '../../components/common'
import './index.scss'

const Profile = () => {
  const { user, logout } = useUserStore()
  const { autoPlay: _autoPlay, notifications: _notifications } =
    useSettingsStore()

  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [studyReminder, setStudyReminder] = useState(true)
  const [voiceFeedback, setVoiceFeedback] = useState(false)
  const [studyLevel] = useState('中级')

  // 学习成就数据
  const achievements = [
    {
      icon: '📅',
      number: '15',
      label: '连续打卡',
      color: '#6366f1',
    },
    {
      icon: '💬',
      number: '128',
      label: '对话次数',
      color: '#10b981',
    },
    {
      icon: '⏰',
      number: '36',
      label: '学习时长',
      unit: 'h',
      color: '#f97316',
    },
  ]

  // 功能菜单项
  const menuItems = [
    {
      title: '个人信息',
      icon: '👤',
      path: '/pages/profile/info',
    },
    {
      title: '学习记录',
      icon: '🕐',
      path: '/pages/profile/records',
    },
    {
      title: '我的收藏',
      icon: '⭐',
      path: '/pages/profile/favorites',
    },
    {
      title: '帮助中心',
      icon: '❓',
      path: '/pages/profile/help',
    },
  ]

  const handleMenuClick = safeEventHandler((path: string) => {
    Taro.navigateTo({ url: path })
  }, 'menu-click')

  const handleMembershipClick = safeEventHandler(() => {
    Taro.navigateTo({ url: '/pages/membership/index' })
  }, 'membership-click')

  const handleAvatarClick = safeEventHandler(() => {
    Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: () => {
        Taro.showToast({ title: '头像更新成功', icon: 'success' })
      },
    })
  }, 'avatar-click')

  const handleStudyLevelClick = safeEventHandler(() => {
    Taro.showActionSheet({
      itemList: ['初级', '中级', '高级'],
      success: () => {
        Taro.showToast({ title: '学习难度已更新', icon: 'success' })
      },
    })
  }, 'study-level-click')

  return (
    <View className="profile-page">
      <ScrollView className="content-area" scrollY>
        {/* 用户信息卡片 */}
        <View className="user-card">
          <View className="user-background" />
          <View className="user-content">
            <View className="avatar-container" onClick={handleAvatarClick}>
              <Image
                className="avatar"
                src={
                  user?.avatar ||
                  'https://img.icons8.com/color/96/000000/duck.png'
                }
              />
              <View className="edit-icon">
                <AtIcon value="edit" size="12" color="white" />
              </View>
            </View>

            <View className="user-info">
              <Text className="username">{user?.nickname || '小明同学'}</Text>
              <Text className="user-type">普通用户</Text>

              <View className="level-info">
                <View className="level-badge">
                  <Text className="level-icon">⭐</Text>
                  <Text className="level-text">等级</Text>
                  <Text className="level-value">Lv.5</Text>
                </View>
                <View className="exp-info">
                  <Text className="exp-icon">🔥</Text>
                  <Text className="exp-text">经验</Text>
                  <Text className="exp-value">1250/2000</Text>
                </View>
              </View>

              <View className="exp-progress">
                <View className="progress-bar" style={{ width: '62.5%' }} />
              </View>
            </View>
          </View>
        </View>

        {/* 会员推广卡片 */}
        <GradientCard className="membership-promotion" gradient="orange">
          <View className="membership-content" onClick={handleMembershipClick}>
            <Text className="membership-title">成为开口鸭会员</Text>
            <Text className="membership-subtitle">
              解锁全部功能，无限次练习！
            </Text>
            <View className="membership-btn">
              <Text className="btn-text">立即开通</Text>
            </View>
          </View>
        </GradientCard>

        {/* 学习成就 */}
        <View className="achievements-section">
          <View className="achievements-header">
            <Text className="achievements-icon">🏆</Text>
            <Text className="achievements-title">学习成就</Text>
          </View>
          <View className="achievements-grid">
            {achievements.map((item, index) => (
              <StatCard
                key={index}
                icon={item.icon}
                number={`${item.number}${item.unit || ''}`}
                label={item.label}
                color={item.color}
              />
            ))}
          </View>
        </View>

        {/* 学习设置 */}
        <View className="settings-section">
          <View className="settings-header">
            <Text className="settings-icon">🎓</Text>
            <Text className="settings-title">学习设置</Text>
          </View>

          <View className="setting-item">
            <Text className="setting-label">每日学习提醒</Text>
            <Switch
              checked={studyReminder}
              onChange={e => setStudyReminder(e.detail.value)}
              color="#6366f1"
            />
          </View>

          <View className="setting-item">
            <Text className="setting-label">语音反馈</Text>
            <Switch
              checked={voiceFeedback}
              onChange={e => setVoiceFeedback(e.detail.value)}
              color="#6366f1"
            />
          </View>

          <View
            className="setting-item clickable"
            onClick={handleStudyLevelClick}
          >
            <Text className="setting-label">学习难度</Text>
            <View className="setting-value">
              <Text className="value-text">{studyLevel}</Text>
              <Text className="arrow-icon">›</Text>
            </View>
          </View>
        </View>

        {/* 功能菜单 */}
        <View className="menu-section">
          {menuItems.map((item, index) => (
            <View
              key={index}
              className="menu-item"
              onClick={() => handleMenuClick(item.path)}
            >
              <View className="menu-icon">
                <Text style={{ fontSize: '20px' }}>{item.icon}</Text>
              </View>
              <Text className="menu-title">{item.title}</Text>
              <Text className="menu-arrow">›</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 退出登录确认弹窗 */}
      <AtModal
        isOpened={showLogoutModal}
        title="确认退出"
        content="确定要退出登录吗？"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => {
          logout()
          setShowLogoutModal(false)
          Taro.showToast({ title: '已退出登录', icon: 'success' })
          setTimeout(() => {
            Taro.reLaunch({ url: '/pages/index/index' })
          }, 1000)
        }}
        cancelText="取消"
        confirmText="确定"
      />
    </View>
  )
}

export default withPageErrorBoundary(Profile, {
  pageName: '个人中心',
  enableErrorReporting: true,
  showRetry: true,
  onError: (error, errorInfo) => {
    console.log('个人中心页面发生错误:', error, errorInfo)
  },
})

import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { AtIcon, AtList, AtListItem, AtModal } from 'taro-ui'
import { useUserStore, useSettingsStore } from '@/stores'
import { getUserLevelName, getUserLevelColor } from '@/utils'
import './index.scss'

const Profile = () => {
  const { user, logout } = useUserStore()
  const { language, autoPlay, voiceSpeed, notifications } = useSettingsStore()

  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const menuItems = [
    {
      title: '学习进度',
      icon: 'analytics',
      path: '/pages/progress/index',
      rightText: '',
    },
    {
      title: '翻译历史',
      icon: 'reload',
      path: '/pages/translate-history/index',
      rightText: '',
    },
    {
      title: '会员中心',
      icon: 'diamond',
      path: '/pages/membership/index',
      rightText: '升级Pro',
    },
  ]

  const settingItems = [
    {
      title: '语言设置',
      icon: 'world',
      rightText: language === 'zh' ? '中文' : 'English',
      onClick: () => handleLanguageSwitch(),
    },
    {
      title: '自动播放',
      icon: 'play',
      rightText: autoPlay ? '开启' : '关闭',
      onClick: () => handleAutoPlayToggle(),
    },
    {
      title: '语音速度',
      icon: 'sound',
      rightText: `${voiceSpeed}x`,
      onClick: () => handleVoiceSpeedAdjust(),
    },
    {
      title: '推送通知',
      icon: 'bell',
      rightText: notifications ? '开启' : '关闭',
      onClick: () => handleNotificationToggle(),
    },
  ]

  const aboutItems = [
    {
      title: '帮助与反馈',
      icon: 'help',
      onClick: () => handleHelp(),
    },
    {
      title: '关于我们',
      icon: 'info',
      onClick: () => handleAbout(),
    },
    {
      title: '版本信息',
      icon: 'tag',
      rightText: 'v1.0.0',
      onClick: () => {
        // 版本信息点击处理
      },
    },
  ]

  const handleMenuClick = (path: string) => {
    Taro.navigateTo({ url: path })
  }

  const handleLanguageSwitch = () => {
    Taro.showActionSheet({
      itemList: ['中文', 'English'],
      success: () => {
        // 语言切换逻辑
        Taro.showToast({ title: '语言设置已更新', icon: 'success' })
      },
    })
  }

  const handleAutoPlayToggle = () => {
    // setAutoPlay(!autoPlay)
    Taro.showToast({
      title: autoPlay ? '已关闭自动播放' : '已开启自动播放',
      icon: 'success',
    })
  }

  const handleVoiceSpeedAdjust = () => {
    Taro.showActionSheet({
      itemList: ['0.5x', '0.75x', '1.0x', '1.25x', '1.5x', '2.0x'],
      success: () => {
        // 语音速度设置逻辑
        Taro.showToast({ title: '语音速度已更新', icon: 'success' })
      },
    })
  }

  const handleNotificationToggle = () => {
    // setNotifications(!notifications)
    Taro.showToast({
      title: notifications ? '已关闭推送通知' : '已开启推送通知',
      icon: 'success',
    })
  }

  const handleHelp = () => {
    Taro.showModal({
      title: '帮助与反馈',
      content: '如有问题或建议，请联系客服：support@openduck.com',
      showCancel: false,
    })
  }

  const handleAbout = () => {
    Taro.showModal({
      title: '关于开口鸭',
      content: '开口鸭是一款专注于英语口语学习的智能应用，通过AI技术帮助用户提升英语交流能力。',
      showCancel: false,
    })
  }

  const handleAvatarClick = () => {
    Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: () => {
        // 头像上传逻辑
        Taro.showToast({ title: '头像更新成功', icon: 'success' })
      },
    })
  }

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    logout()
    setShowLogoutModal(false)
    Taro.showToast({ title: '已退出登录', icon: 'success' })
    setTimeout(() => {
      Taro.reLaunch({ url: '/pages/index/index' })
    }, 1000)
  }

  return (
    <View className="profile-page">
      <ScrollView className="content-area" scrollY>
        {/* 用户信息区域 */}
        <View className="user-section">
          <View className="user-background" />
          <View className="user-content">
            <View className="avatar-container" onClick={handleAvatarClick}>
              <Image
                className="avatar"
                src={user?.avatar || 'https://img.icons8.com/color/96/000000/duck.png'}
              />
              <View className="avatar-edit">
                <AtIcon value="edit" size="16" color="white" />
              </View>
            </View>

            <View className="user-info">
              <Text className="username">{user?.nickname || '开口鸭用户'}</Text>
              <View className="user-level">
                <Text
                  className="level-text"
                  style={{ color: getUserLevelColor(user?.level || 'elementary') }}
                >
                  {getUserLevelName(user?.level || 'elementary')}
                </Text>
                <Text className="level-description">等级</Text>
              </View>
            </View>
          </View>

          {/* 学习统计 */}
          <View className="stats-section">
            <View className="stat-item">
              <Text className="stat-number">{user?.points || 0}</Text>
              <Text className="stat-label">学习积分</Text>
            </View>
            <View className="stat-divider" />
            <View className="stat-item">
              <Text className="stat-number">{user?.studyDays || 0}</Text>
              <Text className="stat-label">学习天数</Text>
            </View>
            <View className="stat-divider" />
            <View className="stat-item">
              <Text className="stat-number">12</Text>
              <Text className="stat-label">已学单词</Text>
            </View>
          </View>
        </View>

        {/* 功能菜单 */}
        <View className="menu-section">
          <AtList className="menu-list">
            {menuItems.map((item, index) => (
              <AtListItem
                key={index}
                title={item.title}
                iconInfo={{ value: item.icon, color: '#4A90E2', size: 20 }}
                extraText={item.rightText}
                arrow="right"
                onClick={() => handleMenuClick(item.path)}
              />
            ))}
          </AtList>
        </View>

        {/* 设置 */}
        <View className="settings-section">
          <Text className="section-title">设置</Text>
          <AtList className="settings-list">
            {settingItems.map((item, index) => (
              <AtListItem
                key={index}
                title={item.title}
                iconInfo={{ value: item.icon, color: '#666666', size: 20 }}
                extraText={item.rightText}
                arrow="right"
                onClick={item.onClick}
              />
            ))}
          </AtList>
        </View>

        {/* 关于 */}
        <View className="about-section">
          <Text className="section-title">关于</Text>
          <AtList className="about-list">
            {aboutItems.map((item, index) => (
              <AtListItem
                key={index}
                title={item.title}
                iconInfo={{ value: item.icon, color: '#666666', size: 20 }}
                extraText={item.rightText}
                arrow="right"
                onClick={item.onClick}
              />
            ))}
          </AtList>
        </View>

        {/* 退出登录 */}
        <View className="logout-section">
          <View className="logout-btn" onClick={handleLogout}>
            <Text className="logout-text">退出登录</Text>
          </View>
        </View>
      </ScrollView>

      {/* 退出登录确认弹窗 */}
      <AtModal
        isOpened={showLogoutModal}
        title="确认退出"
        content="确定要退出登录吗？"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        cancelText="取消"
        confirmText="确定"
      />
    </View>
  )
}

export default Profile

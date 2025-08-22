import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import {
  AtIcon,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
  AtButton,
} from 'taro-ui'
import { useUserStore } from '../../stores/user'
import './index.scss'

const ProfilePage = () => {
  const { profile, membership, logout } = useUserStore()

  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [autoPlay, setAutoPlay] = useState(true)

  // 菜单数据
  const menuSections = [
    {
      title: '学习工具',
      items: [
        {
          id: 'vocabulary',
          title: '背单词',
          desc: '智能记忆，高效背词',
          icon: 'book',
          iconClass: 'blue',
          page: '/pages/vocabulary/index',
        },
        {
          id: 'translate-history',
          title: '翻译历史',
          desc: '查看翻译记录',
          icon: 'clock',
          iconClass: 'green',
          page: '/pages/translate-history/index',
        },
        {
          id: 'photo-story',
          title: '拍照短文',
          desc: '图片描述练习',
          icon: 'camera',
          iconClass: 'purple',
          page: '/pages/photo-story/index',
        },
      ],
    },
    {
      title: '学习设置',
      items: [
        {
          id: 'study-plan',
          title: '学习计划',
          desc: '制定专属学习计划',
          icon: 'calendar',
          iconClass: 'orange',
          action: 'navigate',
        },
        {
          id: 'difficulty',
          title: '难度设置',
          desc: '调整学习难度',
          icon: 'settings',
          iconClass: 'indigo',
          action: 'navigate',
        },
        {
          id: 'reminders',
          title: '学习提醒',
          desc: '设置学习提醒时间',
          icon: 'bell',
          iconClass: 'yellow',
          action: 'toggle',
          value: notifications,
          onChange: setNotifications,
        },
        {
          id: 'auto-play',
          title: '自动播放',
          desc: '自动播放语音内容',
          icon: 'sound',
          iconClass: 'pink',
          action: 'toggle',
          value: autoPlay,
          onChange: setAutoPlay,
        },
      ],
    },
    {
      title: '其他',
      items: [
        {
          id: 'feedback',
          title: '意见反馈',
          desc: '帮助我们改进产品',
          icon: 'message',
          iconClass: 'blue',
          action: 'feedback',
        },
        {
          id: 'about',
          title: '关于我们',
          desc: '了解开口鸭',
          icon: 'help',
          iconClass: 'gray',
          action: 'about',
        },
        {
          id: 'privacy',
          title: '隐私政策',
          desc: '查看隐私条款',
          icon: 'lock',
          iconClass: 'gray',
          action: 'privacy',
        },
      ],
    },
  ]

  // 处理菜单点击
  const handleMenuClick = (item: {
    id: string
    action?: string
    page?: string
    value?: boolean
    onChange?: (value: boolean) => void
  }) => {
    switch (item.action) {
      case 'navigate':
        if (item.page) {
          Taro.navigateTo({ url: item.page })
        } else {
          Taro.showToast({
            title: '功能开发中',
            icon: 'none',
          })
        }
        break

      case 'toggle':
        // 切换开关状态
        if (item.onChange) {
          item.onChange(!item.value)
        }
        break

      case 'feedback':
        handleFeedback()
        break

      case 'about':
        handleAbout()
        break

      case 'privacy':
        handlePrivacy()
        break

      default:
        if (item.page) {
          Taro.navigateTo({ url: item.page })
        }
        break
    }
  }

  // 编辑头像
  const handleEditAvatar = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        console.log('选择头像:', res.tempFilePaths[0])
        Taro.showToast({
          title: '头像上传功能开发中',
          icon: 'none',
        })
      },
    })
  }

  // 会员相关操作
  const handleMembershipAction = (action: string) => {
    switch (action) {
      case 'upgrade':
        Taro.navigateTo({ url: '/pages/membership/index' })
        break
      case 'manage':
        Taro.showToast({
          title: '会员管理功能开发中',
          icon: 'none',
        })
        break
      default:
        break
    }
  }

  // 意见反馈
  const handleFeedback = () => {
    Taro.showModal({
      title: '意见反馈',
      content: '请通过微信客服或邮件联系我们:\nservice@openduck.com',
      showCancel: false,
      confirmText: '知道了',
    })
  }

  // 关于我们
  const handleAbout = () => {
    Taro.showModal({
      title: '关于开口鸭',
      content: '开口鸭 v1.0.0\n让英语学习更有趣\n\n© 2024 OpenDuck Team',
      showCancel: false,
      confirmText: '知道了',
    })
  }

  // 隐私政策
  const handlePrivacy = () => {
    Taro.showToast({
      title: '隐私政策页面开发中',
      icon: 'none',
    })
  }

  // 退出登录
  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  // 确认退出
  const confirmLogout = () => {
    logout()
    setShowLogoutModal(false)
    Taro.reLaunch({ url: '/pages/index/index' })
  }

  return (
    <View className="profile-page">
      {/* 用户信息头部 */}
      <View className="profile-header">
        <View className="header-content">
          <View className="avatar-container">
            <View className="user-avatar" onClick={handleEditAvatar}>
              <Text>🦆</Text>
            </View>
            <View className="edit-avatar">
              <AtIcon value="edit" />
            </View>
            {membership.isPremium && (
              <View className="membership-crown">👑</View>
            )}
          </View>

          <View className="user-info">
            <Text className="user-name">{profile.nickname}</Text>

            <View className="user-level">
              <Text className="level-badge">Lv.{profile.level}</Text>
              <View className="level-progress">
                <View className="progress-fill"></View>
              </View>
            </View>

            <View className="user-stats">
              <View className="stat-item">
                <Text className="stat-number">{profile.studyDays}</Text>
                <Text className="stat-label">学习天数</Text>
              </View>
              <View className="stat-item">
                <Text className="stat-number">{profile.totalWords}</Text>
                <Text className="stat-label">掌握单词</Text>
              </View>
              <View className="stat-item">
                <Text className="stat-number">{profile.totalMinutes}</Text>
                <Text className="stat-label">学习时长</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className="profile-content">
        {/* 会员卡片 */}
        <View
          className={`membership-card ${membership.isPremium ? 'premium' : ''}`}
        >
          <View className="membership-content">
            <View className="membership-title">
              <Text className="crown-icon">👑</Text>
              <Text className="title-text">
                {membership.isPremium ? '会员用户' : '免费用户'}
              </Text>
            </View>

            <Text className="membership-desc">
              {membership.isPremium
                ? '感谢您的支持！享受所有高级功能，学习无限制。'
                : '升级会员，解锁所有功能，享受更好的学习体验。'}
            </Text>

            <View className="membership-actions">
              {membership.isPremium ? (
                <>
                  <View
                    className="membership-btn"
                    onClick={() => handleMembershipAction('manage')}
                  >
                    管理会员
                  </View>
                  <View
                    className="membership-btn primary"
                    onClick={() => handleMembershipAction('upgrade')}
                  >
                    续费会员
                  </View>
                </>
              ) : (
                <>
                  <View
                    className="membership-btn"
                    onClick={() => handleMembershipAction('upgrade')}
                  >
                    了解详情
                  </View>
                  <View
                    className="membership-btn primary"
                    onClick={() => handleMembershipAction('upgrade')}
                  >
                    立即升级
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* 菜单列表 */}
        <View className="menu-sections">
          {menuSections.map((section, sectionIndex) => (
            <View key={sectionIndex} className="menu-section">
              <Text className="section-title">{section.title}</Text>

              <View className="menu-items">
                {section.items.map(item => (
                  <View
                    key={item.id}
                    className="menu-item"
                    onClick={() => handleMenuClick(item)}
                  >
                    <View className={`menu-icon ${item.iconClass}`}>
                      <AtIcon value={item.icon} />
                    </View>

                    <View className="menu-info">
                      <Text className="menu-title">{item.title}</Text>
                      <Text className="menu-desc">{item.desc}</Text>
                    </View>

                    <View className="menu-extra">
                      {'action' in item && item.action === 'toggle' ? (
                        <View
                          className={`switch ${'value' in item && item.value ? 'active' : ''}`}
                        >
                          <View className="switch-handle"></View>
                        </View>
                      ) : (
                        <AtIcon value="chevron-right" className="arrow-icon" />
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* 退出登录 */}
        <View className="logout-section">
          <View className="logout-btn" onClick={handleLogout}>
            <AtIcon value="blocked" />
            <Text>退出登录</Text>
          </View>
        </View>
      </View>

      {/* 版本信息 */}
      <Text className="version-info">开口鸭 v1.0.0</Text>

      {/* 退出登录确认弹窗 */}
      <AtModal isOpened={showLogoutModal}>
        <AtModalHeader>确认退出登录？</AtModalHeader>
        <AtModalContent>
          退出登录后，本地的学习数据将被清除，确定要退出吗？
        </AtModalContent>
        <AtModalAction>
          <AtButton onClick={() => setShowLogoutModal(false)}>取消</AtButton>
          <AtButton type="primary" onClick={confirmLogout}>
            确认退出
          </AtButton>
        </AtModalAction>
      </AtModal>
    </View>
  )
}

export default ProfilePage

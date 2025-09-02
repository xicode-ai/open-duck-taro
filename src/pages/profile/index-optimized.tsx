import { useCallback } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtIcon, AtLoadMore } from 'taro-ui'
import CustomNavBar from '../../components/common/CustomNavBar'
import {
  useUserInfo,
  useUserStats,
  useUpdateUserInfo,
} from '@/hooks/useApiQueries'
import { useUserStore } from '../../stores/user'
import './index.scss'

const ProfilePage = () => {
  const { profile, membership, logout } = useUserStore()

  // 使用 React Query 获取用户数据
  const {
    data: userInfo,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useUserInfo()

  const {
    data: userStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useUserStats()

  // 更新用户信息的 mutation
  const updateUserMutation = useUpdateUserInfo()

  // 处理用户信息更新
  const handleUpdateProfile = useCallback(async () => {
    try {
      await updateUserMutation.mutateAsync({
        nickname: '新昵称',
        // 其他更新字段
      })

      Taro.showToast({
        title: '更新成功',
        icon: 'success',
      })
    } catch (error) {
      console.error('更新用户信息失败:', error)
      Taro.showToast({
        title: '更新失败',
        icon: 'error',
      })
    }
  }, [updateUserMutation])

  // 处理登出
  const handleLogout = useCallback(() => {
    Taro.showModal({
      title: '确认登出',
      content: '确定要登出当前账户吗？',
      success: res => {
        if (res.confirm) {
          logout()
          Taro.reLaunch({
            url: '/pages/index/index',
          })
        }
      },
    })
  }, [logout])

  // 处理重试
  const handleRetry = useCallback(() => {
    refetchUser()
    refetchStats()
  }, [refetchUser, refetchStats])

  // 跳转到会员页面
  const goToMembership = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/membership/index',
    })
  }, [])

  // 跳转到设置页面
  const goToSettings = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/settings/index',
    })
  }, [])

  // 错误状态
  if (userError || statsError) {
    return (
      <View className="profile-page">
        <CustomNavBar title="个人中心" />
        <View className="error-container">
          <Text className="error-text">加载失败，请重试</Text>
          <View className="retry-button" onClick={handleRetry}>
            重试
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className="profile-page">
      <CustomNavBar title="个人中心" />

      {/* 用户信息卡片 */}
      <View className="user-card">
        {userLoading ? (
          <AtLoadMore status="loading" />
        ) : (
          <>
            <View className="user-avatar">
              <Image
                src={
                  userInfo?.avatar ||
                  profile.avatar ||
                  '/assets/images/default-avatar.png'
                }
                className="avatar-image"
                mode="aspectFill"
              />
              {membership.isPremium && (
                <View className="premium-badge">
                  <AtIcon value="crown" size="12" color="#FFD700" />
                </View>
              )}
            </View>

            <View className="user-info">
              <Text className="user-name">
                {userInfo?.nickname || profile.nickname}
              </Text>
              <Text className="user-level">
                等级 {userInfo?.level || profile.level}
              </Text>
              {membership.isPremium ? (
                <View className="membership-status premium">
                  <AtIcon value="crown" size="14" color="#FFD700" />
                  <Text className="status-text">会员用户</Text>
                </View>
              ) : (
                <View
                  className="membership-status free"
                  onClick={goToMembership}
                >
                  <Text className="status-text">免费用户</Text>
                  <AtIcon value="chevron-right" size="14" color="#999" />
                </View>
              )}
            </View>

            <View className="edit-button" onClick={handleUpdateProfile}>
              <AtIcon value="edit" size="16" color="#666" />
            </View>
          </>
        )}
      </View>

      {/* 学习统计 */}
      <View className="stats-section">
        <Text className="section-title">学习统计</Text>
        {statsLoading ? (
          <AtLoadMore status="loading" />
        ) : (
          <View className="stats-grid">
            <View className="stat-item">
              <Text className="stat-number">
                {userStats?.totalStudyDays || profile.studyDays}
              </Text>
              <Text className="stat-label">学习天数</Text>
            </View>
            <View className="stat-item">
              <Text className="stat-number">
                {userStats?.totalWords || profile.totalWords}
              </Text>
              <Text className="stat-label">学习单词</Text>
            </View>
            <View className="stat-item">
              <Text className="stat-number">
                {Math.floor(
                  (userStats?.totalMinutes || profile.totalMinutes) / 60
                )}
                h
              </Text>
              <Text className="stat-label">学习时长</Text>
            </View>
            <View className="stat-item">
              <Text className="stat-number">
                {userStats?.currentStreak || 0}
              </Text>
              <Text className="stat-label">连续天数</Text>
            </View>
          </View>
        )}
      </View>

      {/* 功能菜单 */}
      <View className="menu-section">
        <View className="menu-item" onClick={goToMembership}>
          <View className="menu-icon">
            <AtIcon value="crown" size="20" color="#FFD700" />
          </View>
          <Text className="menu-text">会员中心</Text>
          <AtIcon value="chevron-right" size="16" color="#999" />
        </View>

        <View className="menu-item" onClick={goToSettings}>
          <View className="menu-icon">
            <AtIcon value="settings" size="20" color="#666" />
          </View>
          <Text className="menu-text">设置</Text>
          <AtIcon value="chevron-right" size="16" color="#999" />
        </View>

        <View className="menu-item">
          <View className="menu-icon">
            <AtIcon value="help" size="20" color="#666" />
          </View>
          <Text className="menu-text">帮助与反馈</Text>
          <AtIcon value="chevron-right" size="16" color="#999" />
        </View>

        <View className="menu-item">
          <View className="menu-icon">
            <AtIcon value="message" size="20" color="#666" />
          </View>
          <Text className="menu-text">关于我们</Text>
          <AtIcon value="chevron-right" size="16" color="#999" />
        </View>
      </View>

      {/* 登出按钮 */}
      <View className="logout-section">
        <View
          className={`logout-button ${updateUserMutation.isPending ? 'loading' : ''}`}
          onClick={handleLogout}
        >
          <Text className="logout-text">
            {updateUserMutation.isPending ? '更新中...' : '退出登录'}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default ProfilePage

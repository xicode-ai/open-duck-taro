import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import CustomNavBar from '../../components/common/CustomNavBar'
import TopicProgress from '../../components/TopicProgress'
import { useUserStore } from '../../stores/user'
import {
  useHotTopics,
  useCustomTopics,
  useDeleteCustomTopic,
  useCreateCustomTopic,
  useUpdateCustomTopic,
} from '../../hooks/useApiQueries'
import './index.scss'

interface HotTopic {
  id: string
  title: string
  description: string
  icon: string
  background: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  conversations: number
  progress?: number
  isPopular?: boolean
}

interface CustomTopic {
  id: string
  title: string
  description: string
  icon: string
  conversations: number
  created: string
  isCustom: boolean
}

const TopicsPage = () => {
  const { membership } = useUserStore()

  // 使用 React Query hooks 获取数据
  const {
    data: hotTopicsData,
    isLoading: hotTopicsLoading,
    error: hotTopicsError,
  } = useHotTopics()

  const {
    data: customTopicsData,
    isLoading: customTopicsLoading,
    error: customTopicsError,
  } = useCustomTopics()

  // 变更操作 hooks
  const deleteCustomTopicMutation = useDeleteCustomTopic()
  const _createCustomTopicMutation = useCreateCustomTopic()
  const _updateCustomTopicMutation = useUpdateCustomTopic()

  // UI 状态管理
  const [showProgress, setShowProgress] = useState(false)

  // 数据转换 - 将 API 数据转换为页面所需格式
  const hotTopics: HotTopic[] =
    hotTopicsData?.map(topic => ({
      id: topic.id,
      title: topic.title,
      description: topic.description,
      icon: topic.icon,
      background: topic.background || '#10b981',
      category: topic.category,
      difficulty: topic.difficulty,
      conversations: topic.conversations || topic.dialogCount || 0,
      progress: 0, // 热门话题默认进度为0
      isPopular: topic.isPopular || false,
    })) || []

  const customTopics: CustomTopic[] = customTopicsData || []

  // 统一的加载状态
  const isLoading = hotTopicsLoading || customTopicsLoading

  // 显示学习进度
  const showTopicProgress = () => {
    setShowProgress(true)
  }

  // 关闭学习进度
  const hideTopicProgress = () => {
    setShowProgress(false)
  }

  // 进入话题对话（热门话题）
  const enterHotTopicChat = (topic: HotTopic) => {
    if (topic.difficulty === 'hard' && !membership.isPremium) {
      Taro.showModal({
        title: '需要会员权限',
        content: '高难度话题需要会员权限才能使用',
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

    Taro.navigateTo({
      url: `/pages/topic-chat/index?topicId=${topic.id}&topicTitle=${encodeURIComponent(topic.title)}`,
    })
  }

  // 进入话题对话（自定义话题）
  const enterCustomTopicChat = (topic: CustomTopic) => {
    Taro.navigateTo({
      url: `/pages/topic-chat/index?topicId=${topic.id}&topicTitle=${encodeURIComponent(topic.title)}&isCustom=true`,
    })
  }

  // 创建自定义话题
  const createCustomTopic = () => {
    if (!membership.isPremium) {
      Taro.showModal({
        title: '需要会员权限',
        content: '创建自定义话题需要会员权限',
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

    Taro.showToast({
      title: '功能开发中',
      icon: 'none',
    })
  }

  // 编辑自定义话题
  const editCustomTopic = (_topic: CustomTopic) => {
    Taro.showToast({
      title: '功能开发中',
      icon: 'none',
    })
  }

  // 删除自定义话题 - 使用带乐观更新的 mutation
  const deleteCustomTopic = async (topic: CustomTopic) => {
    try {
      await deleteCustomTopicMutation.mutateAsync(topic.id)
      Taro.showToast({
        title: '删除成功',
        icon: 'success',
      })
    } catch (error) {
      console.error('删除话题失败:', error)
      Taro.showToast({
        title: '删除失败',
        icon: 'error',
      })
    }
  }

  // 获取难度显示文本
  const getDifficultyText = (difficulty: string) => {
    const map: { [key: string]: string } = {
      easy: '简单',
      medium: '中等',
      hard: '困难',
    }
    return map[difficulty] || difficulty
  }

  // 错误处理
  const _handleError = (error: unknown, defaultMessage: string) => {
    console.error(defaultMessage, error)
    if (!isLoading) {
      Taro.showToast({
        title: defaultMessage,
        icon: 'error',
      })
    }
  }

  // 如果有严重错误，显示错误页面
  if ((hotTopicsError || customTopicsError) && !isLoading) {
    return (
      <View className="topics-page">
        <CustomNavBar title="话题模式" backgroundColor="#10b981" />
        <View className="error-container">
          <Text className="error-text">加载失败，请重试</Text>
          <View
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            <Text>重新加载</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className="topics-page">
      {/* 导航栏 */}
      <CustomNavBar
        title="话题模式"
        backgroundColor="#10b981"
        renderRight={
          <View className="nav-right-btn" onClick={showTopicProgress}>
            <AtIcon value="menu" size="20" color="#fff" />
          </View>
        }
      />

      {/* 我的话题 */}
      <View className="section">
        <View className="section-header">
          <Text className="section-title">
            <Text className="title-icon">⭐</Text>
            我的话题
          </Text>
          <View className="create-btn" onClick={createCustomTopic}>
            <Text className="create-icon">+</Text>
            <Text className="create-text">创建</Text>
          </View>
        </View>

        {customTopics.length > 0 ? (
          <View className="custom-topics-list">
            {customTopics.map(topic => (
              <View key={topic.id} className="custom-topic-item">
                <View
                  className="topic-left"
                  onClick={() => enterCustomTopicChat(topic)}
                >
                  <View className="topic-icon">{topic.icon}</View>
                  <View className="topic-info">
                    <Text className="topic-name">{topic.title}</Text>
                    <Text className="topic-desc">{topic.description}</Text>
                  </View>
                </View>
                <View className="topic-actions">
                  <View
                    className="action-btn"
                    onClick={() => editCustomTopic(topic)}
                  >
                    <AtIcon value="edit" size="16" color="#6b7280" />
                  </View>
                  <View
                    className={`action-btn ${deleteCustomTopicMutation.isPending ? 'loading' : ''}`}
                    onClick={() => deleteCustomTopic(topic)}
                  >
                    {deleteCustomTopicMutation.isPending ? (
                      <AtIcon value="loading-3" size="16" color="#ef4444" />
                    ) : (
                      <AtIcon value="trash" size="16" color="#ef4444" />
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="empty-custom-topics">
            <Text className="empty-text">还没有自定义话题</Text>
            <Text className="empty-desc">创建属于你的个性化话题</Text>
          </View>
        )}
      </View>

      {/* 热门话题 */}
      <View className="section">
        <View className="section-header">
          <Text className="section-title">
            <Text className="title-icon">🔥</Text>
            热门话题
          </Text>
        </View>

        {isLoading ? (
          <View className="topics-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={index} className="topic-card-skeleton">
                <View className="skeleton-icon"></View>
                <View className="skeleton-title"></View>
                <View className="skeleton-desc"></View>
                <View className="skeleton-stats"></View>
              </View>
            ))}
          </View>
        ) : (
          <View className="topics-grid">
            {hotTopics.map(topic => (
              <View
                key={topic.id}
                className="topic-card"
                onClick={() => enterHotTopicChat(topic)}
              >
                {topic.isPopular && <View className="popular-badge">热门</View>}

                <View
                  className="topic-icon-bg"
                  style={{ backgroundColor: topic.background }}
                >
                  <Text className="topic-emoji">{topic.icon}</Text>
                </View>

                <View className="topic-content">
                  <Text className="topic-title">{topic.title}</Text>
                  <Text className="topic-desc">{topic.description}</Text>

                  <View className="topic-bottom">
                    <Text className="topic-conversations">
                      {topic.conversations}个对话
                    </Text>
                    <View className={`difficulty ${topic.difficulty}`}>
                      {getDifficultyText(topic.difficulty)}
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 话题学习进度弹窗 */}
      <TopicProgress visible={showProgress} onClose={hideTopicProgress} />
    </View>
  )
}

export default TopicsPage

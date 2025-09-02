import { useState, useCallback, useMemo } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtIcon, AtLoadMore } from 'taro-ui'
import CustomIcon from '../../components/CustomIcon'
import CustomNavBar from '../../components/common/CustomNavBar'
import { useTopics } from '@/hooks/useApiQueries'
import { useTopicStore } from '../../stores/topics'
import { useUserStore } from '../../stores/user'
import type { Topic } from '@/types'
import './index.scss'

const TopicsPage = () => {
  const { membership } = useUserStore()
  const { selectedCategory, setSelectedCategory, setCurrentTopic } =
    useTopicStore()

  // 状态管理
  const [searchText, setSearchText] = useState('')

  // 使用 React Query 获取话题数据
  const {
    data: topicsData,
    isLoading,
    error,
    refetch,
  } = useTopics(
    selectedCategory && selectedCategory !== 'all'
      ? selectedCategory
      : undefined,
    undefined
  )

  // 分类数据
  const categories = useMemo(
    () => [
      { id: 'all', name: '全部', count: topicsData?.length || 0 },
      {
        id: 'daily',
        name: '日常',
        count: topicsData?.filter(t => t.category === 'daily').length || 0,
      },
      {
        id: 'work',
        name: '工作',
        count: topicsData?.filter(t => t.category === 'work').length || 0,
      },
      {
        id: 'travel',
        name: '旅行',
        count: topicsData?.filter(t => t.category === 'travel').length || 0,
      },
      {
        id: 'food',
        name: '美食',
        count: topicsData?.filter(t => t.category === 'food').length || 0,
      },
      {
        id: 'hobby',
        name: '兴趣',
        count: topicsData?.filter(t => t.category === 'hobby').length || 0,
      },
    ],
    [topicsData]
  )

  // 筛选话题
  const filteredTopics = useMemo(() => {
    if (!topicsData) return []

    let filtered = topicsData

    // 按分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(topic => topic.category === selectedCategory)
    }

    // 按搜索文本筛选
    if (searchText) {
      filtered = filtered.filter(
        topic =>
          topic.title.includes(searchText) ||
          topic.description.includes(searchText)
      )
    }

    return filtered
  }, [topicsData, selectedCategory, searchText])

  // 清空搜索
  const clearSearch = useCallback(() => {
    setSearchText('')
  }, [])

  // 处理分类切换
  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      setSelectedCategory(categoryId === 'all' ? null : categoryId)
    },
    [setSelectedCategory]
  )

  // 处理话题点击
  const handleTopicClick = useCallback(
    (topic: Topic) => {
      // 检查会员权限
      if (!membership.isPremium && topic.difficulty === 'hard') {
        Taro.showModal({
          title: '会员专享',
          content: '高级话题需要升级会员才能使用',
          showCancel: true,
          confirmText: '升级会员',
          cancelText: '取消',
          success: res => {
            if (res.confirm) {
              Taro.navigateTo({
                url: '/pages/membership/index',
              })
            }
          },
        })
        return
      }

      // 设置当前话题并跳转
      setCurrentTopic(topic)
      Taro.navigateTo({
        url: `/pages/topic-chat/index?topicId=${topic.id}&topicTitle=${encodeURIComponent(topic.title)}`,
      })
    },
    [membership.isPremium, setCurrentTopic]
  )

  // 处理搜索
  const handleSearch = useCallback((e: { detail: { value: string } }) => {
    setSearchText(e.detail.value)
  }, [])

  // 处理重试
  const handleRetry = useCallback(() => {
    refetch()
  }, [refetch])

  // 错误状态
  if (error) {
    return (
      <View className="topics-page">
        <CustomNavBar title="话题练习" />
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
    <View className="topics-page">
      <CustomNavBar title="话题练习" />

      {/* 搜索栏 */}
      <View className="search-section">
        <View className="search-container">
          <AtIcon
            value="search"
            size="18"
            color="#999"
            className="search-icon"
          />
          <Input
            className="search-input"
            placeholder="搜索话题..."
            value={searchText}
            onInput={handleSearch}
          />
          {searchText && (
            <AtIcon
              value="close-circle"
              size="18"
              color="#999"
              className="clear-icon"
              onClick={clearSearch}
            />
          )}
        </View>
      </View>

      {/* 分类筛选 */}
      <View className="category-section">
        <View className="category-list">
          {categories.map(category => (
            <View
              key={category.id}
              className={`category-item ${
                (selectedCategory || 'all') === category.id ? 'active' : ''
              }`}
              onClick={() => handleCategoryChange(category.id)}
            >
              <Text className="category-name">{category.name}</Text>
              <Text className="category-count">({category.count})</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 话题列表 */}
      <View className="topics-section">
        {isLoading ? (
          <AtLoadMore status="loading" />
        ) : (
          <View className="topics-grid">
            {filteredTopics.map(topic => (
              <View
                key={topic.id}
                className={`topic-card ${topic.difficulty}`}
                onClick={() => handleTopicClick(topic)}
              >
                {/* 标签 */}
                <View className="topic-badges">
                  {topic.isNew && <View className="badge new">新</View>}
                  {topic.isPopular && (
                    <View className="badge popular">热门</View>
                  )}
                  {!membership.isPremium && topic.difficulty === 'hard' && (
                    <View className="badge premium">会员</View>
                  )}
                </View>

                {/* 图标 */}
                <View className="topic-icon">
                  <CustomIcon name={topic.iconClass || topic.icon} size={40} />
                </View>

                {/* 内容 */}
                <View className="topic-content">
                  <Text className="topic-title">{topic.title}</Text>
                  <Text className="topic-description">{topic.description}</Text>

                  <View className="topic-meta">
                    <View className="difficulty-tag">
                      <Text className="difficulty-text">
                        {topic.difficulty === 'easy' && '初级'}
                        {topic.difficulty === 'medium' && '中级'}
                        {topic.difficulty === 'hard' && '高级'}
                      </Text>
                    </View>
                    <Text className="conversations-count">
                      {topic.conversations} 个对话
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 空状态 */}
        {!isLoading && filteredTopics.length === 0 && (
          <View className="empty-state">
            <CustomIcon name="empty" size={80} />
            <Text className="empty-text">
              {searchText ? '没有找到相关话题' : '暂无话题'}
            </Text>
            {searchText && (
              <View className="clear-search-button" onClick={clearSearch}>
                清空搜索
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

export default TopicsPage

import React, { useState, useMemo } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useReachBottom } from '@tarojs/taro'
import { AtIcon, AtLoadMore } from 'taro-ui'
import { usePhotoStoryHistory, useToggleFavorite } from '@/hooks/usePhotoStory'
import { formatDate } from '@/utils/date'
import type { PhotoStory } from '@/types'
import CustomNavBar from '@/components/common/CustomNavBar'
import './index.scss'

const PhotoStoryHistoryPage: React.FC = () => {
  const [currentFilter, setCurrentFilter] = useState<'all' | 'favorite'>('all')

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = usePhotoStoryHistory()

  const toggleFavoriteMutation = useToggleFavorite()

  // 合并所有分页数据并根据筛选条件过滤
  const allItems = useMemo(() => {
    if (!data?.pages) return []

    const items = data.pages.flatMap(page => page.items)

    // 根据筛选条件过滤
    if (currentFilter === 'favorite') {
      return items.filter(item => item.isFavorite)
    }

    return items
  }, [data, currentFilter])

  // 分组历史记录（按日期）
  const groupedHistory = useMemo(() => {
    const grouped: Record<string, PhotoStory[]> = {}

    allItems.forEach(item => {
      const date = formatDate(
        new Date(item.createdAt).getTime(),
        'YYYY年MM月DD日'
      )
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(item)
    })

    return grouped
  }, [allItems])

  // 触底加载更多
  useReachBottom(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  })

  // 导航到详情页
  const navigateToDetail = (story: PhotoStory) => {
    // 导航到拍照短文页面并传递故事数据
    Taro.navigateTo({
      url: `/pages/photo-story/index?storyId=${story.id}`,
    })
  }

  // 切换Tab
  const handleTabChange = (filter: 'all' | 'favorite') => {
    setCurrentFilter(filter)
  }

  // 切换收藏状态
  const handleToggleFavorite = (story: PhotoStory) => {
    toggleFavoriteMutation.mutate({
      id: story.id,
      isFavorite: !story.isFavorite,
    })
  }

  // 渲染状态标签
  const renderStatus = (status: PhotoStory['status']) => {
    const statusConfig = {
      generating: {
        text: '生成中',
        color: '#6b7280',
        icon: 'loading-3',
        iconColor: '#6b7280',
      },
      generated: {
        text: '未练习',
        color: '#f59e0b',
        icon: 'alert-circle',
        iconColor: '#f59e0b',
      },
      practicing: {
        text: '练习中',
        color: '#3b82f6',
        icon: 'loading-2',
        iconColor: '#3b82f6',
      },
      completed: {
        text: '已练习',
        color: '#10b981',
        icon: 'check-circle',
        iconColor: '#10b981',
      },
    }

    const config = statusConfig[status] || statusConfig.generated

    return (
      <View className="status-badge" style={{ color: config.color }}>
        <AtIcon value={config.icon} size="10" color={config.iconColor} />
        <Text>{config.text}</Text>
      </View>
    )
  }

  return (
    <View className="photo-story-history-page">
      {/* 导航栏 */}
      <CustomNavBar
        title="拍照历史"
        backgroundColor="#f59e0b"
        textColor="white"
      />

      {/* Tab 切换 */}
      <View className="tab-container">
        <View className="tab-wrapper">
          <View
            className={`tab-item ${currentFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleTabChange('all')}
          >
            全部
          </View>
          <View
            className={`tab-item ${currentFilter === 'favorite' ? 'active' : ''}`}
            onClick={() => handleTabChange('favorite')}
          >
            收藏
          </View>
        </View>
      </View>

      {/* 内容区域 */}
      <ScrollView className="history-content" scrollY>
        {isLoading && (
          <View className="loading-container">
            <AtLoadMore status="loading" />
          </View>
        )}

        {error && (
          <View className="error-container">
            <AtIcon value="alert-circle" size="48" color="#ef4444" />
            <Text className="error-text">加载失败，请重试</Text>
          </View>
        )}

        {/* 历史记录列表 */}
        {Object.keys(groupedHistory).length > 0
          ? Object.entries(groupedHistory).map(([date, stories]) => (
              <View key={date} className="date-group">
                <View className="date-header">
                  <Text className="date-text">{date}</Text>
                </View>
                {stories.map(story => (
                  <View
                    key={story.id}
                    className="history-item"
                    onClick={() => navigateToDetail(story)}
                  >
                    <View className="item-content">
                      {/* 左侧图片 */}
                      <View className="item-image">
                        <Image
                          src={story.imageUrl}
                          mode="aspectFill"
                          className="story-image"
                        />
                      </View>

                      {/* 中间内容 */}
                      <View className="item-info">
                        <View className="item-header">
                          <Text className="item-title">{story.titleCn}</Text>
                        </View>
                        <Text className="item-preview">
                          {story.standardStory.substring(0, 50)}...
                        </Text>
                        <View className="item-meta">
                          <Text className="meta-time">
                            {formatDate(
                              new Date(story.createdAt).getTime(),
                              'HH:mm'
                            )}
                          </Text>
                          {renderStatus(story.status)}
                        </View>
                      </View>

                      {/* 右侧操作 */}
                      <View className="item-actions">
                        <View
                          className="action-button favorite-button"
                          onClick={e => {
                            e.stopPropagation()
                            handleToggleFavorite(story)
                          }}
                        >
                          <AtIcon
                            value={story.isFavorite ? 'heart-2' : 'heart'}
                            size="16"
                            color={story.isFavorite ? '#ff6b6b' : '#999'}
                          />
                        </View>
                        <Text className="action-text">查看详情</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ))
          : !isLoading && (
              <View className="empty-container">
                <AtIcon
                  value={currentFilter === 'favorite' ? 'heart' : 'image'}
                  size="64"
                  color="#d1d5db"
                />
                <Text className="empty-text">
                  {currentFilter === 'favorite'
                    ? '暂无收藏记录'
                    : '暂无练习记录'}
                </Text>
                <Text className="empty-hint">
                  {currentFilter === 'favorite'
                    ? '点击收藏按钮保存喜欢的短文'
                    : '拍照生成短文，开始练习吧'}
                </Text>
              </View>
            )}

        {/* 加载更多 */}
        {hasNextPage && (
          <View className="load-more">
            <AtLoadMore
              status={isFetchingNextPage ? 'loading' : 'more'}
              moreText="上拉加载更多"
            />
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default PhotoStoryHistoryPage

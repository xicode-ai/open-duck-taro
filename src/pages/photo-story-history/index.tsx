import React, { useState, useMemo } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useReachBottom } from '@tarojs/taro'
import { AtIcon, AtLoadMore } from 'taro-ui'
import {
  usePhotoStoryHistory,
  useDeletePhotoStory,
  useToggleFavorite,
} from '@/hooks/usePhotoStory'
import { formatDate } from '@/utils/date'
import type { PhotoStory } from '@/types'
import './index.scss'

const PhotoStoryHistoryPage: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentFilter, setCurrentFilter] = useState<'all' | 'favorite'>('all')

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = usePhotoStoryHistory()

  const deleteStory = useDeletePhotoStory()
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
    if (isEditMode) {
      toggleSelect(story.id)
      return
    }

    // 导航到拍照短文页面并传递故事数据
    Taro.navigateTo({
      url: `/pages/photo-story/index?storyId=${story.id}`,
    })
  }

  // 切换选中状态
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
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

  // 删除选中项
  const handleDelete = async () => {
    if (selectedItems.size === 0) {
      Taro.showToast({
        title: '请选择要删除的项',
        icon: 'none',
      })
      return
    }

    const result = await Taro.showModal({
      title: '确认删除',
      content: `确定要删除选中的${selectedItems.size}条记录吗？`,
    })

    if (result.confirm) {
      try {
        // 批量删除
        await Promise.all(
          Array.from(selectedItems).map(id => deleteStory.mutateAsync(id))
        )
        setSelectedItems(new Set())
        setIsEditMode(false)
        Taro.showToast({
          title: '删除成功',
          icon: 'success',
        })
      } catch (error) {
        console.error('删除失败:', error)
        Taro.showToast({
          title: '删除失败',
          icon: 'error',
        })
      }
    }
  }

  // 渲染评分等级
  const renderGrade = (story: PhotoStory) => {
    if (!story.score) return null

    const gradeColors: Record<string, string> = {
      'A+': '#10b981',
      A: '#10b981',
      'B+': '#3b82f6',
      B: '#3b82f6',
      'C+': '#f59e0b',
      C: '#f59e0b',
    }

    return (
      <View className="grade-badge">
        <AtIcon
          value="star-2"
          size="12"
          color={gradeColors[story.score.grade]}
        />
        <Text style={{ color: gradeColors[story.score.grade] || '#6b7280' }}>
          {story.score.overall}分
        </Text>
        <Text
          className="grade-text"
          style={{ color: gradeColors[story.score.grade] || '#6b7280' }}
        >
          {story.score.grade}
        </Text>
      </View>
    )
  }

  // 渲染状态标签
  const renderStatus = (status: PhotoStory['status']) => {
    const statusConfig = {
      generating: { text: '生成中', color: '#6b7280' },
      generated: { text: '未练习', color: '#f59e0b' },
      practicing: { text: '练习中', color: '#3b82f6' },
      completed: { text: '已完成', color: '#10b981' },
    }

    const config = statusConfig[status] || statusConfig.generated

    return (
      <View className="status-badge" style={{ color: config.color }}>
        <Text>{config.text}</Text>
      </View>
    )
  }

  return (
    <View className="photo-story-history-page">
      {/* 导航栏 */}
      <View className="custom-nav-bar">
        <View className="nav-bar-content">
          <View className="back-btn" onClick={() => Taro.navigateBack()}>
            <AtIcon value="chevron-left" size="24" color="#ffffff" />
          </View>
          <Text className="nav-title">拍照历史</Text>
          <View
            className="edit-btn"
            onClick={() => {
              setIsEditMode(!isEditMode)
              setSelectedItems(new Set())
            }}
          >
            <Text className="edit-text">{isEditMode ? '取消' : '编辑'}</Text>
          </View>
        </View>
      </View>

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
                    className={`history-item ${
                      selectedItems.has(story.id) ? 'selected' : ''
                    }`}
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
                        {isEditMode && (
                          <View className="select-checkbox">
                            {selectedItems.has(story.id) && (
                              <AtIcon value="check" size="12" color="#ffffff" />
                            )}
                          </View>
                        )}
                      </View>

                      {/* 中间内容 */}
                      <View className="item-info">
                        <View className="item-header">
                          <Text className="item-title">{story.titleCn}</Text>
                          {renderGrade(story)}
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
                      {!isEditMode && (
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
                      )}
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

      {/* 编辑模式底部操作栏 */}
      {isEditMode && (
        <View className="edit-toolbar">
          <View className="toolbar-content">
            <View
              className="select-all"
              onClick={() => {
                if (data?.pages) {
                  const allIds = data.pages.flatMap(page =>
                    page.items.map(item => item.id)
                  )
                  if (selectedItems.size === allIds.length) {
                    setSelectedItems(new Set())
                  } else {
                    setSelectedItems(new Set(allIds))
                  }
                }
              }}
            >
              <Text className="select-text">
                {selectedItems.size > 0
                  ? `已选择 ${selectedItems.size} 项`
                  : '全选'}
              </Text>
            </View>
            <View
              className={`delete-btn ${selectedItems.size === 0 ? 'disabled' : ''}`}
              onClick={handleDelete}
            >
              <AtIcon value="trash" size="20" color="#ffffff" />
              <Text className="delete-text">删除</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default PhotoStoryHistoryPage

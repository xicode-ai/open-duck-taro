import React, { useCallback, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useReady } from '@tarojs/taro'
import { AtLoadMore, AtIcon } from 'taro-ui'
import CustomNavBar from '@/components/common/CustomNavBar'
import {
  useInfiniteTranslateHistory,
  useToggleFavorite,
  useDeleteHistoryItem,
  useClearHistory,
  useClearFavorites,
} from '@/hooks/useTranslateHistory'
import { useTranslateHistoryStore } from '@/stores/translateHistory'
import type { TranslateHistoryItem } from '@/types'
import './index.scss'

// 日期格式化工具函数
const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}年${month}月${day}日`
}

// 时间格式化工具函数
const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// 按日期分组数据
const groupByDate = (
  items: TranslateHistoryItem[]
): Record<string, TranslateHistoryItem[]> => {
  const grouped: Record<string, TranslateHistoryItem[]> = {}

  items.forEach(item => {
    const dateKey = formatDate(item.timestamp)
    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(item)
  })

  // 对每个日期组内的数据按时间倒序排列（最新的在上面）
  Object.keys(grouped).forEach(dateKey => {
    grouped[dateKey].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  })

  return grouped
}

// 历史记录卡片组件
const HistoryCard: React.FC<{
  item: TranslateHistoryItem
  onToggleFavorite: (id: string, isFavorited: boolean) => void
  onDelete: (id: string) => void
}> = React.memo(({ item, onToggleFavorite, onDelete }) => {
  // 复制文本功能
  const handleCopy = useCallback((text: string) => {
    Taro.setClipboardData({
      data: text,
      success: () => {
        Taro.showToast({
          title: '已复制',
          icon: 'success',
          duration: 1500,
        })
      },
    })
  }, [])

  // 播放音频（预留功能）
  const handlePlayAudio = useCallback(() => {
    Taro.showToast({
      title: '功能开发中',
      icon: 'none',
      duration: 1500,
    })
  }, [])

  // 切换收藏
  const handleToggleFavorite = useCallback(() => {
    onToggleFavorite(item.id, !item.isFavorited)
  }, [item.id, item.isFavorited, onToggleFavorite])

  // 删除记录
  const handleDelete = useCallback(() => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条翻译记录吗？',
      success: res => {
        if (res.confirm) {
          onDelete(item.id)
        }
      },
    })
  }, [item.id, onDelete])

  return (
    <View className="history-card">
      {/* 原文 */}
      <View className="source-text">
        <Text className="text">{item.sourceText}</Text>
      </View>

      {/* 标准翻译 */}
      <View className="translation-section">
        <View className="section-header">
          <View className="icon-wrapper standard">
            <AtIcon className="icon standard-icon" value="bookmark" size="12" />
          </View>
          <Text className="section-title">标准翻译</Text>
          <Text className="badge standard-badge">书面语</Text>
        </View>
        <View className="content-wrapper standard-bg">
          <Text className="translation-text">{item.standardTranslation}</Text>
          <View
            className="audio-button standard-audio"
            onClick={handlePlayAudio}
          >
            <AtIcon className="audio-icon" value="volume-plus" size="12" />
          </View>
        </View>
      </View>

      {/* 地道口语 */}
      <View className="translation-section">
        <View className="section-header">
          <View className="icon-wrapper colloquial">
            <AtIcon
              className="icon colloquial-icon"
              value="message"
              size="12"
            />
          </View>
          <Text className="section-title">地道口语</Text>
          <Text className="badge colloquial-badge">推荐</Text>
        </View>
        <View className="content-wrapper colloquial-bg">
          <Text className="translation-text">{item.colloquialTranslation}</Text>
          {item.colloquialNotes && (
            <View className="comparison-notes colloquial-notes">
              <Text className="notes-title colloquial-color">
                更自然的表达：
              </Text>
              <Text className="notes-content colloquial-color">
                {item.colloquialNotes}
              </Text>
            </View>
          )}
          <View
            className="audio-button colloquial-audio"
            onClick={handlePlayAudio}
          >
            <AtIcon className="audio-icon" value="volume-plus" size="12" />
          </View>
        </View>
      </View>

      {/* 操作栏 */}
      <View className="action-bar">
        <View className="action-buttons">
          <View className="action-button" onClick={handleToggleFavorite}>
            <AtIcon
              className={`action-icon ${item.isFavorited ? 'favorited' : ''}`}
              value={item.isFavorited ? 'heart-2' : 'heart'}
              size="14"
            />
          </View>
          <View
            className="action-button"
            onClick={() => handleCopy(item.colloquialTranslation)}
          >
            <AtIcon className="action-icon" value="file-generic" size="14" />
          </View>
          <View className="action-button" onClick={handleDelete}>
            <AtIcon className="action-icon" value="trash" size="14" />
          </View>
        </View>
        <Text className="timestamp">{formatTime(item.timestamp)}</Text>
      </View>
    </View>
  )
})

HistoryCard.displayName = 'HistoryCard'

// 主页面组件
const TranslateHistory: React.FC = () => {
  const { currentFilter, setCurrentFilter } = useTranslateHistoryStore()

  // 获取翻译历史数据
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteTranslateHistory(20)

  // 使用变更 hooks
  const toggleFavoriteMutation = useToggleFavorite()
  const deleteHistoryMutation = useDeleteHistoryItem()
  const clearHistoryMutation = useClearHistory()
  const clearFavoritesMutation = useClearFavorites()

  // 合并所有分页数据
  const allItems = useMemo(() => {
    if (!data?.pages) return []

    const items = data.pages.flatMap(page => page.list)

    // 根据筛选条件过滤
    if (currentFilter === 'favorite') {
      return items.filter(item => item.isFavorited)
    }

    return items
  }, [data, currentFilter])

  // 按日期分组
  const groupedItems = useMemo(() => groupByDate(allItems), [allItems])

  // 获取排序后的日期键
  const sortedDateKeys = useMemo(() => {
    const keys = Object.keys(groupedItems)
    // 按日期倒序排列，最新的日期在最上面
    return keys.sort((a, b) => {
      // 从每个分组中取第一条记录的时间戳来比较（因为组内已经按时间排序）
      const timestampA = groupedItems[a][0]?.timestamp || ''
      const timestampB = groupedItems[b][0]?.timestamp || ''
      return new Date(timestampB).getTime() - new Date(timestampA).getTime()
    })
  }, [groupedItems])

  // 页面加载完成
  useReady(() => {
    // 初始化时自动加载第一页数据
    if (!data && !isLoading) {
      refetch()
    }
  })

  // 滚动到底部加载更多
  const handleScrollToLower = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // 切换Tab
  const handleTabChange = useCallback(
    (filter: 'all' | 'favorite') => {
      setCurrentFilter(filter)
    },
    [setCurrentFilter]
  )

  // 切换收藏
  const handleToggleFavorite = useCallback(
    (id: string, isFavorited: boolean) => {
      toggleFavoriteMutation.mutate({ id, isFavorited })
    },
    [toggleFavoriteMutation]
  )

  // 删除记录
  const handleDelete = useCallback(
    (id: string) => {
      deleteHistoryMutation.mutate(id)
    },
    [deleteHistoryMutation]
  )

  // 清空历史
  const handleClearHistory = useCallback(() => {
    const isShowingFavorites = currentFilter === 'favorite'
    const modalConfig = isShowingFavorites
      ? {
          title: '清空收藏',
          content: '确定要清空所有收藏记录吗？此操作不可恢复。',
          confirmText: '清空收藏',
        }
      : {
          title: '清空历史',
          content: '确定要清空所有翻译历史吗？收藏的记录将会保留。',
          confirmText: '清空历史',
        }

    Taro.showModal({
      title: modalConfig.title,
      content: modalConfig.content,
      confirmColor: '#ef4444',
      confirmText: modalConfig.confirmText,
      success: res => {
        if (res.confirm) {
          if (isShowingFavorites) {
            clearFavoritesMutation.mutate()
          } else {
            clearHistoryMutation.mutate()
          }
        }
      },
    })
  }, [currentFilter, clearHistoryMutation, clearFavoritesMutation])

  // 渲染加载状态
  if (isLoading) {
    return (
      <View className="translate-history">
        <CustomNavBar
          title="翻译历史"
          showBackButton
          backgroundColor="#8B5CF6"
          renderRight={
            <View onClick={handleClearHistory}>
              <AtIcon value="trash" size="20" color="#fff" />
            </View>
          }
        />
        <View className="loading-container">
          <AtLoadMore status="loading" />
        </View>
      </View>
    )
  }

  // 渲染错误状态
  if (isError) {
    return (
      <View className="translate-history">
        <CustomNavBar
          title="翻译历史"
          showBackButton
          backgroundColor="#8B5CF6"
        />
        <View className="error-state">
          <Text className="error-text">加载失败，请重试</Text>
          <View className="retry-button" onClick={() => refetch()}>
            重试
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className="translate-history">
      <CustomNavBar
        title="翻译历史"
        showBackButton
        backgroundColor="#8B5CF6"
        renderRight={
          allItems.length > 0 ? (
            <View onClick={handleClearHistory}>
              <AtIcon value="trash" size="20" color="#fff" />
            </View>
          ) : null
        }
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
      {allItems.length === 0 ? (
        <View className="empty-state">
          <AtIcon className="empty-icon" value="clock" size="48" />
          <Text className="empty-text">
            {currentFilter === 'favorite' ? '还没有收藏记录' : '还没有翻译记录'}
          </Text>
        </View>
      ) : (
        <ScrollView
          className="scroll-container"
          scrollY
          lowerThreshold={50}
          onScrollToLower={handleScrollToLower}
        >
          {sortedDateKeys.map(dateKey => (
            <View key={dateKey} className="date-group">
              <Text className="date-title">{dateKey}</Text>
              <View className="history-list">
                {groupedItems[dateKey].map(item => (
                  <HistoryCard
                    key={item.id}
                    item={item}
                    onToggleFavorite={handleToggleFavorite}
                    onDelete={handleDelete}
                  />
                ))}
              </View>
            </View>
          ))}

          {/* 加载更多状态 */}
          {allItems.length > 0 && (
            <View className="load-more">
              {isFetchingNextPage ? (
                <AtLoadMore status="loading" />
              ) : hasNextPage ? (
                <Text className="loading-text">上拉加载更多</Text>
              ) : (
                <Text className="no-more-text">没有更多了</Text>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  )
}

export default TranslateHistory

import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import CustomNavBar from '@/components/common/CustomNavBar'
import IconFont from '@/components/IconFont'
import Loading from '@/components/common/Loading'
import AnimatedNumber from '@/components/common/AnimatedNumber'
import { useFavoriteWords, useToggleWordFavorite } from '@/hooks/useApiQueries'
import type { WordStudyItem } from '@/types'
import './index.scss'

const VocabularyFavorites = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [allFavorites, setAllFavorites] = useState<WordStudyItem[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [sortBy, setSortBy] = useState<'date' | 'alphabetic'>('date')

  const pageSize = 10

  // Hooks
  const {
    data: favoritesData,
    isLoading,
    refetch,
  } = useFavoriteWords({
    page: currentPage,
    pageSize,
  })
  const toggleWordFavorite = useToggleWordFavorite()

  // 当数据加载完成时更新收藏列表
  useEffect(() => {
    if (favoritesData?.list && currentPage === 1) {
      setAllFavorites(favoritesData.list)
      setHasMore(favoritesData.hasMore || false)
    } else if (favoritesData?.list && currentPage > 1) {
      setAllFavorites(prev => [...prev, ...favoritesData.list])
      setHasMore(favoritesData.hasMore || false)
    }
  }, [favoritesData, currentPage])

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      setCurrentPage(1)
      setAllFavorites([])
      setHasMore(true)
      await refetch()
    } catch (error) {
      console.error('刷新失败:', error)
      Taro.showToast({
        title: '刷新失败，请重试',
        icon: 'error',
      })
    } finally {
      setIsRefreshing(false)
    }
  }, [refetch])

  // 加载更多
  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return

    setIsLoadingMore(true)
    try {
      setCurrentPage(prev => prev + 1)
    } catch (error) {
      console.error('加载更多失败:', error)
      Taro.showToast({
        title: '加载失败，请重试',
        icon: 'error',
      })
    } finally {
      setIsLoadingMore(false)
    }
  }, [hasMore, isLoadingMore])

  // 取消收藏
  const handleRemoveFavorite = useCallback(
    async (word: WordStudyItem) => {
      try {
        await toggleWordFavorite.mutateAsync({
          wordId: word.id,
          isFavorited: false,
        })

        // 从本地列表中移除
        setAllFavorites(prev => prev.filter(w => w.id !== word.id))

        Taro.showToast({
          title: '已取消收藏',
          icon: 'success',
        })
      } catch (error) {
        console.error('取消收藏失败:', error)
        Taro.showToast({
          title: '操作失败，请重试',
          icon: 'error',
        })
      }
    },
    [toggleWordFavorite]
  )

  // 获取阶段显示文本
  const getStageText = useCallback((stage: string) => {
    const stageMap: Record<string, string> = {
      beginner: '萌芽期',
      foundation: '基础期',
      intermediate: '成长期',
      advanced: '成熟期',
    }
    return stageMap[stage] || stage
  }, [])

  // 开始练习单词
  const handlePracticeWord = useCallback(
    (word: WordStudyItem) => {
      Taro.navigateTo({
        url: `/pages/vocabulary-study/index?stage=${word.stage}&stageName=${getStageText(word.stage)}&startWord=${word.id}`,
      })
    },
    [getStageText]
  )

  // 切换排序方式
  const handleToggleSort = useCallback(() => {
    const newSortBy = sortBy === 'date' ? 'alphabetic' : 'date'
    setSortBy(newSortBy)

    // 重新排序当前列表
    setAllFavorites(prev => {
      const sorted = [...prev]
      if (newSortBy === 'alphabetic') {
        sorted.sort((a, b) => a.word.localeCompare(b.word))
      } else {
        // 按收藏时间排序（模拟）
        sorted.sort((a, b) => b.id.localeCompare(a.id))
      }
      return sorted
    })
  }, [sortBy])

  // 去学习页面
  const handleGoToStudy = useCallback(() => {
    Taro.switchTab({
      url: '/pages/vocabulary/index',
    })
  }, [])

  // 统计信息
  const statsData = React.useMemo(() => {
    const total = allFavorites.length
    const stageStats = allFavorites.reduce(
      (acc, word) => {
        acc[word.stage] = (acc[word.stage] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
    const mostPopularStage = Object.entries(stageStats).reduce((a, b) =>
      stageStats[a[0]] > stageStats[b[0]] ? a : b
    )?.[0]

    return {
      total,
      stages: Object.keys(stageStats).length,
      mostPopular: getStageText(mostPopularStage || ''),
    }
  }, [allFavorites, getStageText])

  return (
    <View className="vocabulary-favorites-page">
      <CustomNavBar title="我的收藏" backgroundColor="#ffd700" />

      <View className="page-content">
        {/* 统计信息 */}
        {!isLoading && allFavorites.length > 0 && (
          <View className="favorites-stats">
            <Text className="stats-title">收藏统计</Text>
            <View className="stats-grid">
              <View className="stat-item">
                <AnimatedNumber
                  value={statsData.total}
                  className="stat-value"
                  duration={1000}
                  easing="easeOutBounce"
                />
                <Text className="stat-label">收藏单词</Text>
              </View>
              <View className="stat-item">
                <AnimatedNumber
                  value={statsData.stages}
                  className="stat-value"
                  duration={800}
                  easing="easeOutQuad"
                />
                <Text className="stat-label">涉及阶段</Text>
              </View>
              <View className="stat-item">
                <Text className="stat-value" style={{ fontSize: '14px' }}>
                  {statsData.mostPopular}
                </Text>
                <Text className="stat-label">最多阶段</Text>
              </View>
            </View>
          </View>
        )}

        {/* 筛选和排序 */}
        {!isLoading && allFavorites.length > 0 && (
          <View className="filter-section">
            <View className="filter-info">
              <Text className="total-count">
                共 <Text className="count-number">{allFavorites.length}</Text>{' '}
                个收藏
              </Text>
            </View>
            <View className="sort-button" onClick={handleToggleSort}>
              <IconFont
                name={sortBy === 'date' ? 'clock' : 'list'}
                size={12}
                color="#6c757d"
              />
              <Text>{sortBy === 'date' ? '时间排序' : '字母排序'}</Text>
            </View>
          </View>
        )}

        {/* 收藏列表 */}
        <ScrollView
          scrollY
          style={{ height: 'calc(100vh - 200px)' }}
          onScrollToLower={handleLoadMore}
          lowerThreshold={50}
          refresherEnabled
          refresherTriggered={isRefreshing}
          onRefresherRefresh={handleRefresh}
        >
          {/* 加载状态 */}
          {isLoading && currentPage === 1 && (
            <View className="loading-container">
              <Loading />
            </View>
          )}

          {/* 空状态 */}
          {!isLoading && allFavorites.length === 0 && (
            <View className="empty-state">
              <View className="empty-icon">⭐</View>
              <Text className="empty-title">暂无收藏单词</Text>
              <Text className="empty-subtitle">
                在学习过程中点击星星图标收藏喜欢的单词
              </Text>
              <View className="start-study-button" onClick={handleGoToStudy}>
                开始学习
              </View>
            </View>
          )}

          {/* 收藏单词列表 */}
          {allFavorites.map(word => (
            <View
              key={word.id}
              className="favorite-word-card"
              onClick={() => handlePracticeWord(word)}
            >
              <View className="card-content">
                <View className="word-section">
                  <Text className="word-text">{word.word}</Text>
                  <View className="word-meta">
                    <View className="pronunciation">
                      <Text className="phonetic-item">
                        UK {word.pronunciation.uk}
                      </Text>
                      <Text className="phonetic-item">
                        US {word.pronunciation.us}
                      </Text>
                    </View>
                    <View className="stage-badge">
                      {getStageText(word.stage)}
                    </View>
                  </View>
                </View>

                <View className="actions-section">
                  <View
                    className="favorite-action"
                    onClick={e => {
                      e.stopPropagation()
                      handleRemoveFavorite(word)
                    }}
                  >
                    <IconFont name="star" size={20} color="#ffd700" />
                  </View>
                </View>
              </View>

              {/* 例句展示 */}
              <View className="example-section">
                <Text className="example-sentence">
                  {word.example.english.split(word.word).map((part, index) => (
                    <React.Fragment key={index}>
                      {part}
                      {index <
                        word.example.english.split(word.word).length - 1 && (
                        <Text className="highlight">{word.word}</Text>
                      )}
                    </React.Fragment>
                  ))}
                </Text>
              </View>
            </View>
          ))}

          {/* 加载更多 */}
          {isLoadingMore && (
            <View className="loading-container">
              <Loading />
            </View>
          )}

          {/* 无更多数据 */}
          {!hasMore && allFavorites.length > 0 && (
            <View className="no-more-data">没有更多数据了</View>
          )}
        </ScrollView>
      </View>
    </View>
  )
}

export default VocabularyFavorites

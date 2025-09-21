import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import CustomNavBar from '@/components/common/CustomNavBar'
import Loading from '@/components/common/Loading'
import { useStudyHistory } from '@/hooks/useApiQueries'
import { useVocabularyStudyStore } from '@/stores'
import type { WordStudyRecord } from '@/types'
import { formatDate } from '@/utils/date'
import './index.scss'

const VocabularyHistory = () => {
  const [currentFilter, setCurrentFilter] = useState<'all' | 'favorites'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [allRecords, setAllRecords] = useState<WordStudyRecord[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const pageSize = 10

  // Hooks
  const {
    data: historyData,
    isLoading,
    refetch,
  } = useStudyHistory({
    page: currentPage,
    pageSize,
    type: currentFilter,
  })
  const { studyHistory } = useVocabularyStudyStore()

  // 合并服务端数据和本地缓存数据
  const mergedRecords = React.useMemo(() => {
    const serverRecords = allRecords
    const localRecords = studyHistory.filter(
      record => !serverRecords.some(sr => sr.id === record.id)
    )
    return [...localRecords, ...serverRecords].sort(
      (a, b) =>
        new Date(b.studiedAt).getTime() - new Date(a.studiedAt).getTime()
    )
  }, [allRecords, studyHistory])

  // 当数据加载完成时更新记录列表
  useEffect(() => {
    if (historyData?.list && currentPage === 1) {
      setAllRecords(historyData.list)
      setHasMore(historyData.hasMore || false)
    } else if (historyData?.list && currentPage > 1) {
      setAllRecords(prev => [...prev, ...historyData.list])
      setHasMore(historyData.hasMore || false)
    }
  }, [historyData, currentPage])

  // 筛选器切换
  const handleFilterChange = useCallback(
    (filter: 'all' | 'favorites') => {
      if (filter === currentFilter) return

      setCurrentFilter(filter)
      setCurrentPage(1)
      setAllRecords([])
      setHasMore(true)
    },
    [currentFilter]
  )

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      setCurrentPage(1)
      setAllRecords([])
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

  // 点击卡片进入单词详情页
  const handleCardClick = useCallback((record: WordStudyRecord) => {
    // TODO: 导航到单词详情页
    Taro.navigateTo({
      url: `/pages/word-detail/index?wordId=${record.wordId}&word=${record.word}`,
    })
  }, [])

  // 获取状态显示文本
  const getStatusText = useCallback(
    (level: WordStudyRecord['knowledgeLevel']) => {
      const statusMap = {
        known: '认识',
        vague: '模糊',
        unknown: '不认识',
      }
      return statusMap[level]
    },
    []
  )

  // 获取阶段显示文本
  const getStageText = useCallback((stage: string) => {
    const stageMap: Record<string, string> = {
      beginner: '萌芽期',
      foundation: '基础期',
      development: '发展期',
      acceleration: '加速期',
      mastery: '精通期',
      expert: '大师期',
    }
    return stageMap[stage] || stage
  }, [])

  // 筛选记录
  const filteredRecords = React.useMemo(() => {
    if (currentFilter === 'favorites') {
      return mergedRecords.filter(record => record.isFavorited)
    }
    return mergedRecords
  }, [mergedRecords, currentFilter])

  return (
    <View className="vocabulary-history-page">
      <CustomNavBar
        title="学习历史"
        backgroundColor="linear-gradient(135deg, #ef5350 0%, #e53935 100%)"
      />

      <View className="page-content">
        {/* 筛选标签 */}
        <View className="filter-tabs">
          <View
            className={`filter-tab ${currentFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            全部记录
          </View>
          <View
            className={`filter-tab ${currentFilter === 'favorites' ? 'active' : ''}`}
            onClick={() => handleFilterChange('favorites')}
          >
            我的收藏
          </View>
        </View>

        {/* 记录列表 */}
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
          {!isLoading && filteredRecords.length === 0 && (
            <View className="empty-state">
              <View className="empty-icon">📚</View>
              <Text className="empty-title">
                {currentFilter === 'favorites'
                  ? '暂无收藏记录'
                  : '暂无学习记录'}
              </Text>
              <Text className="empty-subtitle">
                {currentFilter === 'favorites'
                  ? '去学习页面收藏一些单词吧'
                  : '开始学习单词，记录会出现在这里'}
              </Text>
            </View>
          )}

          {/* 记录列表 */}
          {filteredRecords.map(record => (
            <View
              key={record.id}
              className={`study-record-card study-record-card--${record.knowledgeLevel}`}
              onClick={() => handleCardClick(record)}
            >
              <View className="card-content">
                <View className="word-section">
                  <Text className="word-text">{record.word}</Text>
                  <View className="word-meta">
                    <View
                      className={`status-badge status-badge--${record.knowledgeLevel}`}
                    >
                      {getStatusText(record.knowledgeLevel)}
                    </View>
                    <View className="stage-badge">
                      {getStageText(record.stage)}
                    </View>
                  </View>
                </View>

                <View className="date-section">
                  <Text className="study-date">
                    {formatDate(new Date(record.studiedAt))}
                  </Text>
                </View>
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
          {!hasMore && filteredRecords.length > 0 && (
            <View className="no-more-data">没有更多数据了</View>
          )}
        </ScrollView>
      </View>
    </View>
  )
}

export default VocabularyHistory

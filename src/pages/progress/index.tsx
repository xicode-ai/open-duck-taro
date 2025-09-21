import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import { useProgressStore } from '@/stores'
import { CustomNavBar } from '@/components/common'
import CircleChart from '@/components/CircleChart'
import BarChart from '@/components/BarChart'
import SvgIcon from '@/components/SvgIcon'
import { withPageErrorBoundary } from '@/components/ErrorBoundary/PageErrorBoundary'
import './index.scss'

const ProgressPage: React.FC = () => {
  const {
    learningProgress,
    loading,
    error,
    fetchLearningProgress,
    clearError,
  } = useProgressStore()

  const [_refreshing, setRefreshing] = useState(false)

  // 初始化数据
  useEffect(() => {
    fetchLearningProgress()
  }, [fetchLearningProgress])

  // 下拉刷新
  usePullDownRefresh(async () => {
    setRefreshing(true)
    try {
      await fetchLearningProgress()
    } finally {
      setRefreshing(false)
      Taro.stopPullDownRefresh()
    }
  })

  // 清除错误
  useEffect(() => {
    if (error) {
      Taro.showToast({
        title: error,
        icon: 'none',
        duration: 2000,
      })
      clearError()
    }
  }, [error, clearError])

  // 处理建议点击
  const handleSuggestionClick = () => {
    if (!learningProgress?.suggestion) return

    const { type } = learningProgress.suggestion

    const routeMap = {
      chat: '/pages/chat/index',
      topic: '/pages/topics/index',
      vocabulary: '/pages/vocabulary/index',
      translate: '/pages/translate/index',
      photo: '/pages/photo-story/index',
    }

    const route = routeMap[type]
    if (route) {
      Taro.navigateTo({ url: route })
    }
  }

  // 获取学习统计进度条数据
  const getStatisticsData = () => {
    if (!learningProgress?.studyStatistics) return []

    const { studyStatistics } = learningProgress
    const maxValue = Math.max(
      studyStatistics.chatCount,
      studyStatistics.topicCount,
      studyStatistics.translateCount,
      studyStatistics.photoStoryCount,
      studyStatistics.vocabularyCount
    )

    return [
      {
        icon: 'chat',
        label: '对话练习',
        count: studyStatistics.chatCount,
        color: '#3B82F6',
        progress:
          maxValue > 0 ? (studyStatistics.chatCount / maxValue) * 100 : 0,
      },
      {
        icon: 'list',
        label: '话题学习',
        count: studyStatistics.topicCount,
        color: '#10B981',
        progress:
          maxValue > 0 ? (studyStatistics.topicCount / maxValue) * 100 : 0,
      },
      {
        icon: 'translate',
        label: '翻译练习',
        count: studyStatistics.translateCount,
        color: '#8B5CF6',
        progress:
          maxValue > 0 ? (studyStatistics.translateCount / maxValue) * 100 : 0,
      },
      {
        icon: 'photo-story',
        label: '拍照短文',
        count: studyStatistics.photoStoryCount,
        color: '#F59E0B',
        progress:
          maxValue > 0 ? (studyStatistics.photoStoryCount / maxValue) * 100 : 0,
      },
      {
        icon: 'vocabulary',
        label: '背单词',
        count: studyStatistics.vocabularyCount,
        color: '#EF4444',
        progress:
          maxValue > 0 ? (studyStatistics.vocabularyCount / maxValue) * 100 : 0,
      },
    ]
  }

  if (loading && !learningProgress) {
    return (
      <View className="progress-page">
        <View className="progress-page__loading">
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="progress-page">
      {/* 头部导航条 */}
      <CustomNavBar
        title="学习进度"
        showBackButton={false}
        textColor="#fff"
        className="progress-nav-bar"
        renderRight={
          <View className="header-right">
            <SvgIcon name="calendar" size={20} color="#fff" />
          </View>
        }
      />

      <ScrollView
        className="progress-page__scroll"
        scrollY
        enhanced
        showScrollbar={false}
      >
        {/* 今日概览 */}
        <View className="progress-section">
          <View className="section-header">
            <SvgIcon name="calendar" size={16} color="#dc3545" />
            <Text className="section-title">今日概览</Text>
          </View>

          <View className="daily-overview">
            <CircleChart
              value={
                learningProgress?.dailyOverview?.topicProgress?.percentage || 60
              }
              displayText={`${learningProgress?.dailyOverview?.topicProgress?.percentage || 60}%`}
              title="话题进度"
              growth={{ value: '+20%', trend: 'up' }}
              color="#28a745"
              size="medium"
            />

            <CircleChart
              value={75} // 固定进度，因为这里显示的是数量而不是百分比
              displayText={`${learningProgress?.dailyOverview?.vocabularyCount || 15}`}
              title="背单词"
              growth={{ value: '+5', trend: 'up' }}
              color="#6f42c1"
              size="medium"
            />

            <CircleChart
              value={50} // 固定进度，因为这里显示的是数量而不是百分比
              displayText={`${learningProgress?.dailyOverview?.photoStoryCount || 3}`}
              title="拍照短文"
              growth={{ value: '+1', trend: 'up' }}
              color="#fd7e14"
              size="medium"
            />
          </View>
        </View>

        {/* 本周进度 */}
        <View className="progress-section">
          <View className="section-header">
            <SvgIcon name="bar-chart" size={16} color="#007bff" />
            <Text className="section-title">本周进度</Text>
            <Text className="section-subtitle">
              第{learningProgress?.weeklyProgress?.weekNumber || 3}周
            </Text>
          </View>

          <View className="weekly-calendar">
            <View className="calendar-legend">
              <Text className="legend-item">一</Text>
              <Text className="legend-item">二</Text>
              <Text className="legend-item">三</Text>
              <Text className="legend-item">四</Text>
              <Text className="legend-item">五</Text>
              <Text className="legend-item">六</Text>
              <Text className="legend-item">日</Text>
            </View>

            <View className="calendar-days">
              {learningProgress?.weeklyProgress?.days?.map(day => (
                <View
                  key={day.date}
                  className={`calendar-day ${
                    day.isCompleted
                      ? 'calendar-day--completed'
                      : day.isToday
                        ? 'calendar-day--today'
                        : 'calendar-day--pending'
                  }`}
                >
                  {day.isCompleted ? (
                    <SvgIcon name="check" size={14} color="#fff" />
                  ) : (
                    <Text className="day-number">{day.dayNumber}</Text>
                  )}
                </View>
              ))}
            </View>

            <View className="calendar-status">
              <View className="status-item">
                <View className="status-dot status-dot--completed" />
                <Text className="status-text">已完成</Text>
              </View>
              <View className="status-item">
                <View className="status-dot status-dot--today" />
                <Text className="status-text">今天</Text>
              </View>
              <View className="status-item">
                <View className="status-dot status-dot--pending" />
                <Text className="status-text">未完成</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 学习统计 */}
        <View className="progress-section">
          <View className="section-header">
            <SvgIcon name="trending-up" size={16} color="#28a745" />
            <Text className="section-title">学习统计</Text>
          </View>

          <BarChart data={getStatisticsData()} />
        </View>

        {/* 今日建议 */}
        {learningProgress?.suggestion && (
          <View className="progress-section">
            <View className="suggestion-card" onClick={handleSuggestionClick}>
              <View className="suggestion-header">
                <SvgIcon name="lightbulb" size={20} color="#fff" />
                <Text className="suggestion-title">今日建议</Text>
              </View>
              <Text className="suggestion-content">
                {learningProgress.suggestion.description}
              </Text>
            </View>
          </View>
        )}

        {/* 底部占位 */}
        <View className="progress-page__footer" />
      </ScrollView>
    </View>
  )
}

export default withPageErrorBoundary(ProgressPage)

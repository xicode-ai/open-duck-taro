import { View, Text, ScrollView } from '@tarojs/components'
import { withPageErrorBoundary } from '@/components/ErrorBoundary/PageErrorBoundary'
import { StatCard, ProgressRing } from '../../components/common'
import './index.scss'

const Progress = () => {
  // 今日概览数据
  const todayOverview = {
    dialogPractice: { count: 12, target: 20, percentage: 60 },
    studyTime: { count: 25, target: 30, unit: '分钟' },
    targetProgress: 70,
  }

  // 本周学习数据
  const weekData = [
    { day: '一', completed: true, active: false },
    { day: '二', completed: true, active: false },
    { day: '三', completed: true, active: false },
    { day: '四', completed: false, active: true },
    { day: '五', completed: false, active: false },
    { day: '六', completed: false, active: false },
    { day: '日', completed: false, active: false },
  ]

  // 学习统计数据
  const studyStats = [
    {
      title: '对话练习',
      icon: '💬',
      count: 128,
      progress: 85,
      color: '#6366f1',
    },
    {
      title: '话题学习',
      icon: '📚',
      count: 45,
      progress: 65,
      color: '#10b981',
    },
  ]

  return (
    <View className="progress-page">
      <ScrollView className="content-area" scrollY>
        {/* 今日概览卡片 */}
        <View className="today-overview">
          <View className="overview-header">
            <View className="header-left">
              <View className="calendar-icon">
                <Text style={{ fontSize: '16px' }}>📅</Text>
              </View>
              <Text className="overview-title">今日概览</Text>
            </View>
          </View>

          <View className="overview-content">
            <View className="overview-stats">
              <StatCard
                number={todayOverview.dialogPractice.count}
                label="对话练习"
                icon="💬"
                color="#6366f1"
              />
              <StatCard
                number={`${todayOverview.studyTime.count}`}
                label="学习时长(分)"
                icon="⏰"
                color="#10b981"
              />
            </View>

            <View className="target-progress">
              <View className="progress-info">
                <ProgressRing
                  percentage={todayOverview.targetProgress}
                  size={60}
                  color="#6366f1"
                />
                <View className="progress-text">
                  <Text className="progress-label">目标</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 本周进度 */}
        <View className="week-progress">
          <View className="week-header">
            <View className="header-left">
              <View className="chart-icon">
                <Text style={{ fontSize: '16px' }}>📊</Text>
              </View>
              <Text className="week-title">本周进度</Text>
            </View>
            <Text className="week-subtitle">第3周</Text>
          </View>

          <View className="week-calendar">
            {weekData.map((item, index) => (
              <View key={index} className="calendar-day">
                <View
                  className={`day-indicator ${item.completed ? 'completed' : ''} ${item.active ? 'active' : ''}`}
                >
                  <Text className="day-number">{index + 1}</Text>
                </View>
                <Text className="day-label">{item.day}</Text>
              </View>
            ))}
          </View>

          <View className="week-legend">
            <View className="legend-item">
              <View className="legend-dot completed"></View>
              <Text className="legend-text">已完成</Text>
            </View>
            <View className="legend-item">
              <View className="legend-dot active"></View>
              <Text className="legend-text">今天</Text>
            </View>
            <View className="legend-item">
              <View className="legend-dot"></View>
              <Text className="legend-text">未完成</Text>
            </View>
          </View>
        </View>

        {/* 学习统计 */}
        <View className="study-statistics">
          <View className="stats-header">
            <View className="header-left">
              <View className="stats-icon">
                <Text style={{ fontSize: '16px' }}>📈</Text>
              </View>
              <Text className="stats-title">学习统计</Text>
            </View>
          </View>

          <View className="stats-list">
            {studyStats.map((stat, index) => (
              <View key={index} className="stat-item">
                <View className="stat-info">
                  <View className="stat-icon-container">
                    <Text style={{ fontSize: '18px' }}>{stat.icon}</Text>
                  </View>
                  <Text className="stat-title">{stat.title}</Text>
                </View>
                <View className="stat-data">
                  <Text className="stat-count">{stat.count}次</Text>
                  <View className="stat-progress-bar">
                    <View
                      className="progress-fill"
                      style={{
                        width: `${stat.progress}%`,
                        backgroundColor: stat.color,
                      }}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default withPageErrorBoundary(Progress, {
  pageName: '学习进度',
  enableErrorReporting: true,
  showRetry: true,
  onError: (error, errorInfo) => {
    console.log('学习进度页面发生错误:', error, errorInfo)
  },
})

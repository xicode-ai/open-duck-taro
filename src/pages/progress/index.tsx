import { View, Text, ScrollView } from '@tarojs/components'
import { AtIcon, AtProgress } from 'taro-ui'
import { useUserStore, useVocabularyStore } from '@/stores'
import { getUserLevelName, getUserLevelColor } from '@/utils'
import './index.scss'

const Progress = () => {
  const { user } = useUserStore()
  const { studiedWords } = useVocabularyStore()

  const progressData = [
    {
      title: '对话练习',
      icon: 'message',
      progress: 65,
      total: 50,
      completed: 32,
      color: '#4A90E2',
    },
    {
      title: '话题学习',
      icon: 'bookmark',
      progress: 40,
      total: 25,
      completed: 10,
      color: '#50C878',
    },
    {
      title: '单词掌握',
      icon: 'book',
      progress: 78,
      total: 200,
      completed: 156,
      color: '#FF9500',
    },
    {
      title: '发音练习',
      icon: 'sound',
      progress: 55,
      total: 100,
      completed: 55,
      color: '#9B59B6',
    },
  ]

  const achievements = [
    { title: '初学者', description: '完成第一次对话', icon: '🏆', unlocked: true },
    { title: '单词达人', description: '学习100个单词', icon: '📚', unlocked: true },
    { title: '口语新星', description: '发音评分超过80分', icon: '🎤', unlocked: false },
    { title: '坚持不懈', description: '连续学习7天', icon: '💪', unlocked: false },
  ]

  return (
    <View className="progress-page">
      <ScrollView className="content-area" scrollY>
        {/* 用户等级卡片 */}
        <View className="level-card">
          <View className="level-header">
            <Text className="level-title">当前等级</Text>
            <Text
              className="level-name"
              style={{ color: getUserLevelColor(user?.level || 'elementary') }}
            >
              {getUserLevelName(user?.level || 'elementary')}
            </Text>
          </View>

          <View className="level-progress">
            <AtProgress
              percent={75}
              strokeWidth={8}
              color={getUserLevelColor(user?.level || 'elementary')}
            />
            <Text className="progress-text">距离下一等级还需 250 积分</Text>
          </View>

          <View className="level-stats">
            <View className="stat-item">
              <Text className="stat-number">{user?.points || 0}</Text>
              <Text className="stat-label">总积分</Text>
            </View>
            <View className="stat-item">
              <Text className="stat-number">{user?.studyDays || 0}</Text>
              <Text className="stat-label">学习天数</Text>
            </View>
            <View className="stat-item">
              <Text className="stat-number">{studiedWords.length}</Text>
              <Text className="stat-label">已学单词</Text>
            </View>
          </View>
        </View>

        {/* 学习进度 */}
        <View className="progress-section">
          <Text className="section-title">学习进度</Text>
          {progressData.map((item, index) => (
            <View key={index} className="progress-item">
              <View className="item-header">
                <View className="item-info">
                  <AtIcon value={item.icon} size="20" color={item.color} />
                  <Text className="item-title">{item.title}</Text>
                </View>
                <Text className="item-percent">{item.progress}%</Text>
              </View>

              <AtProgress
                percent={item.progress}
                strokeWidth={6}
                color={item.color}
                className="item-progress"
              />

              <Text className="item-stats">
                已完成 {item.completed} / {item.total}
              </Text>
            </View>
          ))}
        </View>

        {/* 成就系统 */}
        <View className="achievement-section">
          <Text className="section-title">成就徽章</Text>
          <View className="achievement-grid">
            {achievements.map((achievement, index) => (
              <View
                key={index}
                className={`achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`}
              >
                <Text className="achievement-icon">{achievement.icon}</Text>
                <Text className="achievement-title">{achievement.title}</Text>
                <Text className="achievement-description">{achievement.description}</Text>
                {!achievement.unlocked && (
                  <View className="locked-overlay">
                    <AtIcon value="lock" size="16" color="#cccccc" />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* 学习统计 */}
        <View className="stats-section">
          <Text className="section-title">本周学习</Text>
          <View className="week-stats">
            {['一', '二', '三', '四', '五', '六', '日'].map((day, index) => (
              <View key={index} className="day-stat">
                <View
                  className={`day-bar ${index < 5 ? 'active' : ''}`}
                  style={{
                    height: `${Math.random() * 60 + 20}px`,
                    backgroundColor: index < 5 ? '#4A90E2' : '#e0e0e0',
                  }}
                />
                <Text className="day-label">{day}</Text>
              </View>
            ))}
          </View>
          <Text className="stats-summary">本周已学习 5 天，累计 180 分钟</Text>
        </View>
      </ScrollView>
    </View>
  )
}

export default Progress

import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import { useUserStore } from '../../stores/user'
// import { ProgressRing } from '../../components/common' // 暂时不使用
import './index.scss'

interface Goal {
  id: string
  title: string
  description: string
  current: number
  target: number
  icon: string
  color: string
  completed: boolean
}

interface Skill {
  name: string
  level: number
  progress: number
  maxLevel: number
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: number
}

const ProgressPage = () => {
  const { profile } = useUserStore()
  // const [selectedDate, setSelectedDate] = useState(new Date()) // 暂时不使用

  // 学习目标数据
  const [goals] = useState<Goal[]>([
    {
      id: '1',
      title: '每日对话练习',
      description: '完成每日对话目标',
      current: 8,
      target: 10,
      icon: 'message',
      color: '#6366f1',
      completed: false,
    },
    {
      id: '2',
      title: '单词学习',
      description: '掌握新单词',
      current: 25,
      target: 30,
      icon: 'book',
      color: '#10b981',
      completed: false,
    },
    {
      id: '3',
      title: '连续打卡',
      description: '保持学习习惯',
      current: 7,
      target: 7,
      icon: 'calendar',
      color: '#f59e0b',
      completed: true,
    },
  ])

  // 技能数据
  const [skills] = useState<Skill[]>([
    { name: '听力', level: 8, progress: 75, maxLevel: 10 },
    { name: '口语', level: 6, progress: 45, maxLevel: 10 },
    { name: '词汇', level: 7, progress: 60, maxLevel: 10 },
    { name: '语法', level: 5, progress: 30, maxLevel: 10 },
  ])

  // 成就数据
  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      name: '初学者',
      description: '完成第一次对话',
      icon: '🎉',
      unlocked: true,
      unlockedAt: Date.now() - 86400000,
    },
    {
      id: '2',
      name: '勤奋学习',
      description: '连续打卡7天',
      icon: '⭐',
      unlocked: true,
      unlockedAt: Date.now() - 3600000,
    },
    {
      id: '3',
      name: '对话达人',
      description: '完成100次对话',
      icon: '💬',
      unlocked: false,
    },
    {
      id: '4',
      name: '词汇大师',
      description: '掌握1000个单词',
      icon: '📚',
      unlocked: false,
    },
    {
      id: '5',
      name: '坚持不懈',
      description: '连续打卡30天',
      icon: '🔥',
      unlocked: false,
    },
    {
      id: '6',
      name: '完美主义',
      description: '单日完成所有目标',
      icon: '🎯',
      unlocked: false,
    },
  ])

  // 生成日历数据
  const generateCalendarData = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const firstDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const calendar = []

    // 添加星期标题
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    weekdays.forEach(day => {
      calendar.push({
        type: 'header',
        text: day,
        date: null,
      })
    })

    // 添加上月末尾的日期
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = new Date(year, month, -firstDayOfWeek + i + 1)
      calendar.push({
        type: 'inactive',
        text: date.getDate().toString(),
        date,
      })
    }

    // 添加当月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      const isToday = date.toDateString() === now.toDateString()
      const isStudied = Math.random() > 0.3 // 模拟学习记录

      calendar.push({
        type: isToday ? 'today' : isStudied ? 'studied' : 'active',
        text: i.toString(),
        date,
        studied: isStudied,
      })
    }

    // 添加下月开头的日期
    const remainingCells = 42 - calendar.length + 7 // 包括标题行
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(year, month + 1, i)
      calendar.push({
        type: 'inactive',
        text: date.getDate().toString(),
        date,
      })
    }

    return calendar
  }

  // 下拉刷新
  // const onPullDownRefresh = () => {
  //   setTimeout(() => {
  //     Taro.stopPullDownRefresh()
  //     Taro.showToast({
  //       title: '数据已更新',
  //       icon: 'success',
  //     })
  //   }, 1000)
  // }

  // 查看详细报告
  const viewDetailedReport = (_type: string) => {
    Taro.showToast({
      title: '功能开发中',
      icon: 'none',
    })
  }

  // 格式化百分比
  const formatPercent = (current: number, target: number) => {
    return Math.round((current / target) * 100)
  }

  const calendarData = generateCalendarData()
  const studiedDays = calendarData.filter(day => day.studied).length
  const currentStreak = 7 // 模拟连续打卡天数

  return (
    <View className="progress-page">
      {/* 页面头部 */}
      <View className="progress-header">
        <Text className="header-title">学习进度</Text>
        <Text className="header-desc">追踪你的英语学习之路</Text>
      </View>

      {/* 概览卡片 */}
      <View className="overview-card">
        <View className="overview-content">
          <Text className="welcome-text">Hello, {profile.nickname}! 👋</Text>

          <View className="streak-info">
            <Text className="streak-icon">🔥</Text>
            <Text className="streak-text">
              你已经连续学习
              <Text className="streak-number">{currentStreak}</Text>
              天了！
            </Text>
          </View>

          <View className="stats-grid">
            <View className="stat-item">
              <Text className="stat-number">156</Text>
              <Text className="stat-label">总对话数</Text>
            </View>
            <View className="stat-item">
              <Text className="stat-number">24</Text>
              <Text className="stat-label">学习时长(h)</Text>
            </View>
            <View className="stat-item">
              <Text className="stat-number">89%</Text>
              <Text className="stat-label">完成率</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="progress-sections">
        {/* 学习目标 */}
        <View className="progress-section goals">
          <View className="section-header">
            <Text className="section-title">
              <Text className="title-icon">🎯</Text>
              今日目标
            </Text>
          </View>

          <View className="goals-list">
            {goals.map(goal => (
              <View
                key={goal.id}
                className={`goal-item ${goal.completed ? 'completed' : ''}`}
              >
                <View className="goal-icon">
                  <AtIcon value={goal.icon} />
                </View>

                <View className="goal-info">
                  <Text className="goal-title">{goal.title}</Text>

                  <View className="goal-progress">
                    <View className="progress-bar">
                      <View
                        className="progress-fill"
                        style={{
                          width: `${formatPercent(goal.current, goal.target)}%`,
                        }}
                      />
                    </View>
                    <Text className="progress-text">
                      {goal.current}/{goal.target}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 技能雷达 */}
        <View className="progress-section skills">
          <View className="section-header">
            <Text className="section-title">
              <Text className="title-icon">📊</Text>
              技能评估
            </Text>
            <View
              className="view-more"
              onClick={() => viewDetailedReport('skills')}
            >
              <Text>详细</Text>
              <AtIcon value="chevron-right" size="16" />
            </View>
          </View>

          <View className="skills-radar">
            <View className="radar-center">
              <Text>Level</Text>
            </View>
          </View>

          <View className="skills-list">
            {skills.map(skill => (
              <View key={skill.name} className="skill-item">
                <Text className="skill-name">{skill.name}</Text>
                <Text className="skill-level">Lv.{skill.level}</Text>
                <Text className="skill-progress">
                  {skill.progress}/{skill.maxLevel * 10}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 学习日历 */}
        <View className="progress-section calendar">
          <View className="section-header">
            <Text className="section-title">
              <Text className="title-icon">📅</Text>
              学习日历
            </Text>
          </View>

          <View className="calendar-grid">
            {calendarData.map((day, index) => (
              <View key={index} className={`calendar-day ${day.type}`}>
                <Text>{day.text}</Text>
              </View>
            ))}
          </View>

          <View className="calendar-stats">
            <View className="calendar-stat">
              <Text className="stat-number">{studiedDays}</Text>
              <Text className="stat-label">本月学习</Text>
            </View>
            <View className="calendar-stat">
              <Text className="stat-number">{currentStreak}</Text>
              <Text className="stat-label">连续打卡</Text>
            </View>
            <View className="calendar-stat">
              <Text className="stat-number">23</Text>
              <Text className="stat-label">最长连击</Text>
            </View>
          </View>
        </View>

        {/* 成就徽章 */}
        <View className="progress-section achievements">
          <View className="section-header">
            <Text className="section-title">
              <Text className="title-icon">🏆</Text>
              成就徽章
            </Text>
            <View
              className="view-more"
              onClick={() => viewDetailedReport('achievements')}
            >
              <Text>全部</Text>
              <AtIcon value="chevron-right" size="16" />
            </View>
          </View>

          <View className="achievements-grid">
            {achievements.map(achievement => (
              <View
                key={achievement.id}
                className={`achievement-item ${achievement.unlocked ? 'unlocked' : ''}`}
              >
                {achievement.unlocked && (
                  <View className="unlock-badge">!</View>
                )}

                <Text className="achievement-icon">{achievement.icon}</Text>
                <Text className="achievement-name">{achievement.name}</Text>
                <Text className="achievement-desc">
                  {achievement.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 学习报告 */}
        <View className="progress-section reports">
          <View className="section-header">
            <Text className="section-title">
              <Text className="title-icon">📈</Text>
              学习报告
            </Text>
          </View>

          <View className="reports-list">
            <View
              className="report-item"
              onClick={() => viewDetailedReport('weekly')}
            >
              <View className="report-icon">
                <AtIcon value="analytics" />
              </View>
              <View className="report-info">
                <Text className="report-title">本周学习报告</Text>
                <Text className="report-time">2024年第1周</Text>
              </View>
              <AtIcon value="chevron-right" className="report-action" />
            </View>

            <View
              className="report-item"
              onClick={() => viewDetailedReport('monthly')}
            >
              <View className="report-icon">
                <AtIcon value="calendar" />
              </View>
              <View className="report-info">
                <Text className="report-title">月度学习总结</Text>
                <Text className="report-time">2024年1月</Text>
              </View>
              <AtIcon value="chevron-right" className="report-action" />
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export default ProgressPage

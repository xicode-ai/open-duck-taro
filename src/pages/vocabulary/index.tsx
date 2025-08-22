import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import { useUserStore } from '../../stores/user'
import './index.scss'

interface LevelData {
  id: string
  name: string
  description: string
  icon: string
  wordCount: number
  learnedCount: number
  difficulty:
    | 'preschool'
    | 'elementary'
    | 'middle'
    | 'high'
    | 'university'
    | 'master'
  ageRange: string
}

interface StudyMode {
  id: string
  name: string
  description: string
  icon: string
  iconClass: string
  wordCount: number
  estimatedTime: number
  route: string
}

const VocabularyPage = () => {
  const { profile, updateDailyUsage } = useUserStore()

  // 状态管理
  const [selectedLevel, setSelectedLevel] = useState<string>('elementary')
  const [dailyGoal, setDailyGoal] = useState(20)
  const [dailyProgress] = useState(13)
  const [isLoading, setIsLoading] = useState(true)

  // 学习等级数据
  const levels: LevelData[] = [
    {
      id: 'preschool',
      name: '萌芽期',
      description: '基础认知词汇',
      icon: '🌱',
      wordCount: 500,
      learnedCount: 350,
      difficulty: 'preschool',
      ageRange: '3-6岁',
    },
    {
      id: 'elementary',
      name: '基础期',
      description: '小学核心词汇',
      icon: '📚',
      wordCount: 1200,
      learnedCount: 800,
      difficulty: 'elementary',
      ageRange: '6-12岁',
    },
    {
      id: 'middle',
      name: '发展期',
      description: '初中必备词汇',
      icon: '🎓',
      wordCount: 2000,
      learnedCount: 600,
      difficulty: 'middle',
      ageRange: '12-15岁',
    },
    {
      id: 'high',
      name: '加速期',
      description: '高中进阶词汇',
      icon: '🚀',
      wordCount: 3500,
      learnedCount: 1200,
      difficulty: 'high',
      ageRange: '15-18岁',
    },
    {
      id: 'university',
      name: '精通期',
      description: '大学高级词汇',
      icon: '🎯',
      wordCount: 5000,
      learnedCount: 800,
      difficulty: 'university',
      ageRange: '18-30岁',
    },
    {
      id: 'master',
      name: '大师期',
      description: '专业学术词汇',
      icon: '👑',
      wordCount: 8000,
      learnedCount: 200,
      difficulty: 'master',
      ageRange: '30岁+',
    },
  ]

  // 学习模式
  const studyModes: StudyMode[] = [
    {
      id: 'new-words',
      name: '学新单词',
      description: '学习当前等级的新单词，配合例句理解',
      icon: '📖',
      iconClass: 'new-words',
      wordCount: 25,
      estimatedTime: 15,
      route: '/pages/vocabulary-study/index?mode=new',
    },
    {
      id: 'review',
      name: '复习巩固',
      description: '复习已学单词，加深记忆印象',
      icon: '🔄',
      iconClass: 'review',
      wordCount: 45,
      estimatedTime: 12,
      route: '/pages/vocabulary-study/index?mode=review',
    },
    {
      id: 'test',
      name: '单词测试',
      description: '测试单词掌握程度，查漏补缺',
      icon: '✅',
      iconClass: 'test',
      wordCount: 30,
      estimatedTime: 10,
      route: '/pages/vocabulary-study/index?mode=test',
    },
    {
      id: 'challenge',
      name: '挑战模式',
      description: '限时挑战，检验学习成果',
      icon: '⚡',
      iconClass: 'challenge',
      wordCount: 50,
      estimatedTime: 8,
      route: '/pages/vocabulary-study/index?mode=challenge',
    },
  ]

  // 最近学习的单词
  const recentWords = [
    { word: 'amazing', status: 'mastered' },
    { word: 'wonderful', status: 'learning' },
    { word: 'excellent', status: 'mastered' },
    { word: 'fantastic', status: 'learning' },
    { word: 'incredible', status: 'mastered' },
    { word: 'outstanding', status: 'learning' },
    { word: 'remarkable', status: 'mastered' },
  ]

  // 页面初始化
  useEffect(() => {
    loadVocabularyData()
  }, [])

  // 加载词汇数据
  const loadVocabularyData = async () => {
    setIsLoading(true)

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsLoading(false)
  }

  // 选择学习等级
  const selectLevel = (levelId: string) => {
    setSelectedLevel(levelId)
    Taro.showToast({
      title: `已选择${levels.find(l => l.id === levelId)?.name}`,
      icon: 'success',
    })
  }

  // 开始学习模式
  const startStudyMode = (mode: StudyMode) => {
    updateDailyUsage('vocabulary')

    // 构建完整的路由参数
    const params = new URLSearchParams({
      mode: mode.id,
      level: selectedLevel,
      wordCount: mode.wordCount.toString(),
    })

    Taro.navigateTo({
      url: `${mode.route}&${params.toString()}`,
    })
  }

  // 快速开始学习
  const quickStartLearning = () => {
    const newWordsMode = studyModes.find(m => m.id === 'new-words')
    if (newWordsMode) {
      startStudyMode(newWordsMode)
    }
  }

  // 随机测试
  const randomTest = () => {
    const testMode = studyModes.find(m => m.id === 'test')
    if (testMode) {
      startStudyMode(testMode)
    }
  }

  // 调整每日目标
  const adjustDailyGoal = () => {
    const goals = [10, 15, 20, 25, 30, 50]
    const currentIndex = goals.indexOf(dailyGoal)
    const nextIndex = (currentIndex + 1) % goals.length
    setDailyGoal(goals[nextIndex])

    Taro.showToast({
      title: `每日目标已调整为${goals[nextIndex]}个单词`,
      icon: 'success',
    })
  }

  // 下拉刷新
  // const onPullDownRefresh = () => {
  //   loadVocabularyData().then(() => {
  //     Taro.stopPullDownRefresh()
  //   })
  // }

  // const currentLevel = levels.find(l => l.id === selectedLevel) // 暂时不使用
  const progressPercent = Math.round((dailyProgress / dailyGoal) * 100)

  return (
    <View className="vocabulary-page">
      {/* 词汇页面头部 */}
      <View className="vocabulary-header">
        <View className="header-content">
          <Text className="header-title">语境学单词</Text>
          <Text className="header-subtitle">
            通过真实语境和例句，让单词学习更高效更有趣
          </Text>

          <View className="daily-goal">
            <View className="goal-header">
              <Text className="goal-title">今日学习目标</Text>
              <View className="goal-setting" onClick={adjustDailyGoal}>
                <AtIcon value="settings" size="16" />
                <Text>{dailyGoal} 词/天</Text>
              </View>
            </View>

            <View className="goal-progress">
              <View className="progress-bar">
                <View
                  className="progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </View>
              <Text className="progress-text">
                已完成 {dailyProgress} / {dailyGoal} 个单词 ({progressPercent}%)
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="vocabulary-content">
        {/* 等级选择器 */}
        <View className="level-selector">
          <Text className="selector-title">
            <Text className="title-icon">🎯</Text>
            选择学习等级
          </Text>

          <View className="level-grid">
            {isLoading
              ? // 加载骨架屏
                Array.from({ length: 6 }).map((_, index) => (
                  <View key={index} className="level-skeleton">
                    <View className="skeleton-icon"></View>
                    <View className="skeleton-text"></View>
                    <View className="skeleton-text short"></View>
                  </View>
                ))
              : levels.map(level => (
                  <View
                    key={level.id}
                    className={`level-item ${level.difficulty} ${selectedLevel === level.id ? 'active' : ''}`}
                    onClick={() => selectLevel(level.id)}
                  >
                    <Text className="level-icon">{level.icon}</Text>
                    <Text className="level-name">{level.name}</Text>
                    <Text className="level-desc">{level.description}</Text>

                    <View className="level-stats">
                      <View className="stat-item">
                        <Text className="stat-number">{level.wordCount}</Text>
                        <Text>总词汇</Text>
                      </View>
                      <View className="stat-item">
                        <Text className="stat-number">
                          {level.learnedCount}
                        </Text>
                        <Text>已学习</Text>
                      </View>
                    </View>
                  </View>
                ))}
          </View>
        </View>

        {/* 学习模式 */}
        <View className="study-modes">
          <Text className="modes-title">
            <Text className="title-icon">🎮</Text>
            学习模式
          </Text>

          <View className="modes-grid">
            {studyModes.map(mode => (
              <View
                key={mode.id}
                className="mode-item"
                onClick={() => startStudyMode(mode)}
              >
                <View className={`mode-icon ${mode.iconClass}`}>
                  <Text>{mode.icon}</Text>
                </View>

                <View className="mode-info">
                  <Text className="mode-name">{mode.name}</Text>
                  <Text className="mode-desc">{mode.description}</Text>
                  <Text className="mode-stats">
                    <Text className="stat-item">
                      约{mode.estimatedTime}分钟
                    </Text>
                  </Text>
                </View>

                <View className="mode-action">
                  <Text className="word-count">{mode.wordCount}词</Text>
                  <AtIcon value="chevron-right" className="arrow-icon" />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 学习统计 */}
        <View className="learning-stats">
          <Text className="stats-title">
            <Text className="title-icon">📊</Text>
            学习统计
          </Text>

          <View className="stats-grid">
            <View className="stat-card total">
              <Text className="stat-number total">{profile.totalWords}</Text>
              <Text className="stat-label">累计学习</Text>
            </View>
            <View className="stat-card mastered">
              <Text className="stat-number mastered">
                {Math.round(profile.totalWords * 0.7)}
              </Text>
              <Text className="stat-label">已掌握</Text>
            </View>
            <View className="stat-card learning">
              <Text className="stat-number learning">
                {Math.round(profile.totalWords * 0.2)}
              </Text>
              <Text className="stat-label">学习中</Text>
            </View>
            <View className="stat-card streak">
              <Text className="stat-number streak">{profile.studyDays}</Text>
              <Text className="stat-label">连续天数</Text>
            </View>
          </View>

          <View className="recent-words">
            <Text className="recent-title">最近学习</Text>
            <View className="words-list">
              {recentWords.map((item, index) => (
                <Text key={index} className={`word-tag ${item.status}`}>
                  {item.word}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* 快捷操作按钮 */}
        <View className="quick-actions">
          <View className="quick-btn start-learn" onClick={quickStartLearning}>
            <AtIcon value="play" />
          </View>
          <View className="quick-btn random-test" onClick={randomTest}>
            <AtIcon value="lightning" />
          </View>
        </View>
      </View>
    </View>
  )
}

export default VocabularyPage

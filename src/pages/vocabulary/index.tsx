import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView, Progress } from '@tarojs/components'
import { AtTabs, AtTabsPane, AtIcon, AtButton } from 'taro-ui'
import { useVocabularyStore, useUserStore } from '@/stores'
import { getUserLevelName, getUserLevelColor } from '@/utils'
import type { Vocabulary } from '@/types'
import './index.scss'

const VocabularyPage = () => {
  const { user } = useUserStore()
  const {
    vocabularies,
    studiedWords,
    favoriteWords,
    currentLevel,
    setVocabularies,
    setCurrentLevel,
    addToFavorites,
    removeFromFavorites,
  } = useVocabularyStore()

  const [activeTab, setActiveTab] = useState(0)
  const [filteredWords, setFilteredWords] = useState<Vocabulary[]>([])
  const [levelProgress, setLevelProgress] = useState<{ [key: string]: number }>({})

  const levels = [
    { key: 'preschool', name: '萌芽期', description: '3-6岁基础词汇' },
    { key: 'elementary', name: '基础期', description: '6-12岁日常词汇' },
    { key: 'middle', name: '发展期', description: '12-15岁学习词汇' },
    { key: 'high', name: '加速期', description: '15-18岁高级词汇' },
    { key: 'university', name: '精通期', description: '18-30岁专业词汇' },
    { key: 'master', name: '大师期', description: '30岁以后高阶词汇' },
  ]

  const tabList = [{ title: '学习' }, { title: '收藏' }, { title: '已学' }]

  // 模拟单词数据
  const mockVocabularies: Vocabulary[] = [
    {
      id: '1',
      word: 'immense',
      pronunciation: { us: '/ɪˈmens/', uk: '/ɪˈmens/' },
      meaning: 'adj. 极大的，巨大的',
      partOfSpeech: 'adjective',
      example: {
        english: 'He inherited an immense fortune.',
        chinese: '他继承了巨额财富。',
      },
      level: 'university',
      audioUrl: { us: 'mock-us-audio', uk: 'mock-uk-audio' },
    },
    {
      id: '2',
      word: 'brilliant',
      pronunciation: { us: '/ˈbrɪljənt/', uk: '/ˈbrɪljənt/' },
      meaning: 'adj. 聪明的，出色的',
      partOfSpeech: 'adjective',
      example: {
        english: 'She gave a brilliant performance.',
        chinese: '她表现得非常出色。',
      },
      level: 'high',
      audioUrl: { us: 'mock-us-audio', uk: 'mock-uk-audio' },
    },
    {
      id: '3',
      word: 'adventure',
      pronunciation: { us: '/ədˈventʃər/', uk: '/ədˈventʃə(r)/' },
      meaning: 'n. 冒险，历险',
      partOfSpeech: 'noun',
      example: {
        english: 'They went on an exciting adventure.',
        chinese: '他们进行了一次刺激的冒险。',
      },
      level: 'middle',
      audioUrl: { us: 'mock-us-audio', uk: 'mock-uk-audio' },
    },
    {
      id: '4',
      word: 'happy',
      pronunciation: { us: '/ˈhæpi/', uk: '/ˈhæpi/' },
      meaning: 'adj. 高兴的，快乐的',
      partOfSpeech: 'adjective',
      example: {
        english: 'I am very happy today.',
        chinese: '我今天很开心。',
      },
      level: 'elementary',
      audioUrl: { us: 'mock-us-audio', uk: 'mock-uk-audio' },
    },
    {
      id: '5',
      word: 'beautiful',
      pronunciation: { us: '/ˈbjuːtɪfl/', uk: '/ˈbjuːtɪfl/' },
      meaning: 'adj. 美丽的，漂亮的',
      partOfSpeech: 'adjective',
      example: {
        english: 'What a beautiful day!',
        chinese: '多么美好的一天！',
      },
      level: 'elementary',
      audioUrl: { us: 'mock-us-audio', uk: 'mock-uk-audio' },
    },
  ]

  useEffect(() => {
    setVocabularies(mockVocabularies)
    setCurrentLevel(user?.level || 'elementary')
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterWords()
    calculateProgress()
  }, [vocabularies, activeTab, currentLevel, studiedWords, favoriteWords]) // eslint-disable-line react-hooks/exhaustive-deps

  const filterWords = () => {
    let filtered: Vocabulary[] = []

    switch (activeTab) {
      case 0: // 学习
        filtered = vocabularies.filter(word => word.level === currentLevel)
        break
      case 1: // 收藏
        filtered = vocabularies.filter(word => favoriteWords.includes(word.id))
        break
      case 2: // 已学
        filtered = vocabularies.filter(word => studiedWords.includes(word.id))
        break
    }

    setFilteredWords(filtered)
  }

  const calculateProgress = () => {
    const progress: { [key: string]: number } = {}

    levels.forEach(level => {
      const levelWords = vocabularies.filter(word => word.level === level.key)
      const studiedCount = levelWords.filter(word => studiedWords.includes(word.id)).length
      progress[level.key] = levelWords.length > 0 ? (studiedCount / levelWords.length) * 100 : 0
    })

    setLevelProgress(progress)
  }

  const handleLevelChange = (levelKey: string) => {
    setCurrentLevel(levelKey)
    setActiveTab(0) // 切换到学习页面
  }

  const handleWordClick = (word: Vocabulary) => {
    Taro.navigateTo({
      url: `/pages/vocabulary-study/index?wordId=${word.id}&level=${word.level}`,
    })
  }

  const handleFavoriteToggle = (e: { stopPropagation: () => void }, wordId: string) => {
    e.stopPropagation()

    if (favoriteWords.includes(wordId)) {
      removeFromFavorites(wordId)
      Taro.showToast({ title: '已取消收藏', icon: 'none' })
    } else {
      addToFavorites(wordId)
      Taro.showToast({ title: '已添加收藏', icon: 'none' })
    }
  }

  const handleStartStudy = () => {
    const levelWords = vocabularies.filter(word => word.level === currentLevel)
    const unstudiedWords = levelWords.filter(word => !studiedWords.includes(word.id))

    if (unstudiedWords.length === 0) {
      Taro.showToast({ title: '本阶段所有单词已学完！', icon: 'none' })
      return
    }

    const firstWord = unstudiedWords[0]
    Taro.navigateTo({
      url: `/pages/vocabulary-study/index?wordId=${firstWord.id}&level=${firstWord.level}&mode=study`,
    })
  }

  const renderWordCard = (word: Vocabulary) => {
    const isFavorite = favoriteWords.includes(word.id)
    const isStudied = studiedWords.includes(word.id)

    return (
      <View
        key={word.id}
        className={`word-card ${isStudied ? 'studied' : ''}`}
        onClick={() => handleWordClick(word)}
      >
        <View className="card-header">
          <View className="word-info">
            <Text className="word-text">{word.word}</Text>
            <Text className="pronunciation">
              美: {word.pronunciation.us} 英: {word.pronunciation.uk}
            </Text>
          </View>
          <View className="favorite-btn" onClick={e => handleFavoriteToggle(e, word.id)}>
            <AtIcon
              value={isFavorite ? 'heart-2' : 'heart'}
              size="20"
              color={isFavorite ? '#ff4444' : '#cccccc'}
            />
          </View>
        </View>

        <View className="word-meaning">
          <Text className="meaning-text">{word.meaning}</Text>
        </View>

        <View className="word-example">
          <Text className="example-en">{word.example.english}</Text>
          <Text className="example-zh">{word.example.chinese}</Text>
        </View>

        {isStudied && (
          <View className="studied-badge">
            <AtIcon value="check" size="16" color="white" />
            <Text className="studied-text">已学习</Text>
          </View>
        )}
      </View>
    )
  }

  const renderLevelProgress = () => (
    <View className="level-progress-section">
      <Text className="section-title">学习进度</Text>
      {levels.map(level => {
        const progress = levelProgress[level.key] || 0
        const isActive = currentLevel === level.key

        return (
          <View
            key={level.key}
            className={`level-item ${isActive ? 'active' : ''}`}
            onClick={() => handleLevelChange(level.key)}
          >
            <View className="level-info">
              <View className="level-header">
                <Text className="level-name" style={{ color: getUserLevelColor(level.key) }}>
                  {level.name}
                </Text>
                <Text className="progress-text">{Math.round(progress)}%</Text>
              </View>
              <Text className="level-description">{level.description}</Text>
              <Progress
                className="progress-bar"
                percent={progress}
                strokeWidth={4}
                color={getUserLevelColor(level.key)}
                backgroundColor="#f0f0f0"
              />
            </View>
            {isActive && (
              <View className="current-badge">
                <Text className="current-text">当前</Text>
              </View>
            )}
          </View>
        )
      })}
    </View>
  )

  return (
    <View className="vocabulary-page">
      {/* 当前级别和开始学习 */}
      <View className="header-section">
        <View className="current-level">
          <Text className="level-title">当前等级</Text>
          <View className="level-display">
            <Text className="level-name" style={{ color: getUserLevelColor(currentLevel) }}>
              {getUserLevelName(currentLevel)}
            </Text>
            <Text className="level-progress">
              进度 {Math.round(levelProgress[currentLevel] || 0)}%
            </Text>
          </View>
        </View>
        <AtButton type="primary" size="small" onClick={handleStartStudy}>
          开始学习
        </AtButton>
      </View>

      {/* 标签页 */}
      <AtTabs
        current={activeTab}
        tabList={tabList}
        onClick={setActiveTab}
        className="vocabulary-tabs"
      >
        {/* 学习页面 */}
        <AtTabsPane current={activeTab} index={0}>
          <ScrollView className="tab-content" scrollY>
            {renderLevelProgress()}

            <View className="words-section">
              <Text className="section-title">{getUserLevelName(currentLevel)}单词</Text>
              {filteredWords.map(renderWordCard)}

              {filteredWords.length === 0 && (
                <View className="empty-state">
                  <AtIcon value="book" size="48" color="#cccccc" />
                  <Text className="empty-text">暂无单词</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </AtTabsPane>

        {/* 收藏页面 */}
        <AtTabsPane current={activeTab} index={1}>
          <ScrollView className="tab-content" scrollY>
            <View className="words-section">
              {filteredWords.map(renderWordCard)}

              {filteredWords.length === 0 && (
                <View className="empty-state">
                  <AtIcon value="heart" size="48" color="#cccccc" />
                  <Text className="empty-text">暂无收藏单词</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </AtTabsPane>

        {/* 已学页面 */}
        <AtTabsPane current={activeTab} index={2}>
          <ScrollView className="tab-content" scrollY>
            <View className="words-section">
              {filteredWords.map(renderWordCard)}

              {filteredWords.length === 0 && (
                <View className="empty-state">
                  <AtIcon value="check" size="48" color="#cccccc" />
                  <Text className="empty-text">还没有学习过的单词</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </AtTabsPane>
      </AtTabs>
    </View>
  )
}

export default VocabularyPage

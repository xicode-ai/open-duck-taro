import { useState, useEffect, useRef } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import { useUserStore } from '../../stores/user'
import { useVocabularyStore } from '../../stores/vocabulary'
import './index.scss'

interface Vocabulary {
  id: string
  word: string
  pronunciation: {
    us: string
    uk: string
  }
  meaning: string
  partOfSpeech: string
  example: {
    english: string
    chinese: string
  }
  level: string
}

interface StudySession {
  mode: 'new' | 'review' | 'test' | 'challenge'
  level: string
  wordCount: number
  correctCount: number
  incorrectCount: number
  startTime: number
  currentIndex: number
  words: Vocabulary[]
}

const VocabularyStudyPage = () => {
  const { updateDailyUsage } = useUserStore()
  // const { updateWordProgress } = useVocabularyStore() // 功能暂未实现

  // 状态管理
  const [session, setSession] = useState<StudySession | null>(null)
  const [currentWord, setCurrentWord] = useState<Vocabulary | null>(null)
  const [showMeaning, setShowMeaning] = useState(true)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 模拟单词数据
  const mockWords: Vocabulary[] = [
    {
      id: '1',
      word: 'immense',
      pronunciation: {
        us: '/ɪˈmens/',
        uk: '/ɪˈmens/',
      },
      meaning: 'adj. 极大的，巨大的',
      partOfSpeech: 'adjective',
      example: {
        english: 'He inherited an immense fortune.',
        chinese: '他继承了巨额财富。',
      },
      level: 'university',
    },
    {
      id: '2',
      word: 'brilliant',
      pronunciation: {
        us: '/ˈbrɪljənt/',
        uk: '/ˈbrɪljənt/',
      },
      meaning: 'adj. 杰出的，聪明的',
      partOfSpeech: 'adjective',
      example: {
        english: 'She gave a brilliant performance.',
        chinese: '她的表演非常精彩。',
      },
      level: 'high',
    },
    {
      id: '3',
      word: 'fascinating',
      pronunciation: {
        us: '/ˈfæsɪneɪtɪŋ/',
        uk: '/ˈfæsɪneɪtɪŋ/',
      },
      meaning: 'adj. 迷人的，极有趣的',
      partOfSpeech: 'adjective',
      example: {
        english: 'The documentary was absolutely fascinating.',
        chinese: '这部纪录片非常引人入胜。',
      },
      level: 'university',
    },
  ]

  // 页面初始化
  useEffect(() => {
    const instance = Taro.getCurrentInstance()
    const { mode, level, wordCount } = instance.router?.params || {}

    if (mode && level && wordCount) {
      initializeSession(
        mode as StudySession['mode'],
        level,
        parseInt(wordCount)
      )
    } else {
      Taro.navigateBack()
    }
  }, []) // initializeSession 在组件内定义，忽略依赖警告

  // 计时器
  useEffect(() => {
    if (
      session?.mode === 'challenge' &&
      timeRemaining > 0 &&
      !isPaused &&
      !isCompleted
    ) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
    }

    if (timeRemaining === 0 && session?.mode === 'challenge') {
      completeSession()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timeRemaining, isPaused, isCompleted, session])

  // 初始化学习会话
  const initializeSession = (
    mode: StudySession['mode'],
    level: string,
    wordCount: number
  ) => {
    const newSession: StudySession = {
      mode,
      level,
      wordCount,
      correctCount: 0,
      incorrectCount: 0,
      startTime: Date.now(),
      currentIndex: 0,
      words: mockWords.slice(0, wordCount),
    }

    setSession(newSession)
    setCurrentWord(newSession.words[0])

    // 挑战模式设置计时器
    if (mode === 'challenge') {
      setTimeRemaining(wordCount * 10) // 每个单词10秒
    }

    // 测试模式隐藏词义
    if (mode === 'test') {
      setShowMeaning(false)
    }
  }

  // 播放音频
  const playAudio = (type: 'us' | 'uk' | 'sentence') => {
    const audioId = `${currentWord?.id}-${type}`

    if (playingAudio === audioId) {
      setPlayingAudio(null)
      Taro.stopBackgroundAudio()
    } else {
      setPlayingAudio(audioId)

      // 模拟音频播放
      setTimeout(() => {
        setPlayingAudio(null)
      }, 2000)

      Taro.showToast({
        title: '播放中',
        icon: 'none',
      })
    }
  }

  // 处理答案选择
  const handleAnswer = (action: 'know' | 'unknown' | 'hard') => {
    if (!session || !currentWord) return

    const isCorrect = action === 'know'

    // 更新会话统计
    setSession(prev =>
      prev
        ? {
            ...prev,
            correctCount: prev.correctCount + (isCorrect ? 1 : 0),
            incorrectCount: prev.incorrectCount + (isCorrect ? 0 : 1),
          }
        : null
    )

    // 更新单词学习进度
    // updateWordProgress(currentWord.id, action) // 功能暂未实现
    updateDailyUsage('vocabulary')

    // 下一个单词或完成
    nextWord()
  }

  // 下一个单词
  const nextWord = () => {
    if (!session) return

    const nextIndex = session.currentIndex + 1

    if (nextIndex >= session.words.length) {
      completeSession()
    } else {
      setSession(prev => (prev ? { ...prev, currentIndex: nextIndex } : null))
      setCurrentWord(session.words[nextIndex])
      setSelectedOption(null)
      setShowAnswer(false)

      // 重置显示状态
      if (session.mode !== 'test') {
        setShowMeaning(true)
      }
    }
  }

  // 完成学习会话
  const completeSession = () => {
    setIsCompleted(true)

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }

  // 暂停/继续
  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  // 重新开始
  const restartSession = () => {
    if (session) {
      setSession(prev =>
        prev
          ? {
              ...prev,
              currentIndex: 0,
              correctCount: 0,
              incorrectCount: 0,
              startTime: Date.now(),
            }
          : null
      )
      setCurrentWord(session.words[0])
      setIsCompleted(false)
      setSelectedOption(null)
      setShowAnswer(false)

      if (session.mode === 'challenge') {
        setTimeRemaining(session.wordCount * 10)
        setIsPaused(false)
      }
    }
  }

  // 继续学习
  const continueLearning = () => {
    Taro.navigateBack()
  }

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 获取模式信息
  const getModeInfo = () => {
    const modeMap = {
      new: { title: '学新单词', icon: '📖', desc: '学习新单词，建立词汇基础' },
      review: { title: '复习巩固', icon: '🔄', desc: '复习已学单词，加深记忆' },
      test: { title: '单词测试', icon: '✅', desc: '测试掌握程度，查漏补缺' },
      challenge: {
        title: '挑战模式',
        icon: '⚡',
        desc: '限时挑战，检验学习成果',
      },
    }
    return session ? modeMap[session.mode] : null
  }

  if (!session || !currentWord) {
    return (
      <View className="vocabulary-study-page">
        <View className="empty-state">
          <Text className="empty-icon">📚</Text>
          <Text className="empty-title">加载中...</Text>
        </View>
      </View>
    )
  }

  const modeInfo = getModeInfo()
  const progress = Math.round(
    ((session.currentIndex + 1) / session.wordCount) * 100
  )
  const timerClass =
    timeRemaining < 30 ? 'danger' : timeRemaining < 60 ? 'warning' : ''

  return (
    <View className="vocabulary-study-page">
      {/* 学习头部 */}
      <View className="study-header">
        <View className="header-content">
          <View className="mode-info">
            <View className="mode-icon">
              <Text>{modeInfo?.icon}</Text>
            </View>
            <View className="mode-details">
              <Text className="mode-title">{modeInfo?.title}</Text>
              <Text className="mode-desc">{modeInfo?.desc}</Text>
            </View>
          </View>

          <View className="study-progress">
            <View className="progress-info">
              <Text className="progress-title">学习进度</Text>
              <Text className="progress-detail">
                {session.currentIndex + 1} / {session.wordCount}
              </Text>
            </View>
            <View className="progress-stats">
              <Text className="current-count">{progress}%</Text>
              <Text className="total-count">已完成</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 单词卡片 */}
      <View className="word-card-container">
        <View className={`word-card ${session.mode}-mode`}>
          {/* 挑战模式计时器 */}
          {session.mode === 'challenge' && (
            <View className={`challenge-timer ${timerClass}`}>
              <AtIcon value="clock" className="timer-icon" />
              <Text>{formatTime(timeRemaining)}</Text>
            </View>
          )}

          <View className="card-content">
            <View className="word-main">
              <Text className="word-text">{currentWord.word}</Text>
              <Text className="word-type">{currentWord.partOfSpeech}</Text>

              <View className="pronunciations">
                <View className="pronunciation">
                  <Text className="accent-label">美式</Text>
                  <Text className="phonetic">
                    {currentWord.pronunciation.us}
                  </Text>
                  <View
                    className={`play-btn ${playingAudio === `${currentWord.id}-us` ? 'playing' : ''}`}
                    onClick={() => playAudio('us')}
                  >
                    <AtIcon
                      value={
                        playingAudio === `${currentWord.id}-us`
                          ? 'pause'
                          : 'sound'
                      }
                    />
                  </View>
                </View>

                <View className="pronunciation">
                  <Text className="accent-label">英式</Text>
                  <Text className="phonetic">
                    {currentWord.pronunciation.uk}
                  </Text>
                  <View
                    className={`play-btn ${playingAudio === `${currentWord.id}-uk` ? 'playing' : ''}`}
                    onClick={() => playAudio('uk')}
                  >
                    <AtIcon
                      value={
                        playingAudio === `${currentWord.id}-uk`
                          ? 'pause'
                          : 'sound'
                      }
                    />
                  </View>
                </View>
              </View>

              {showMeaning && (
                <Text className="word-meaning">{currentWord.meaning}</Text>
              )}
            </View>

            <View className="word-example">
              <Text className="example-header">
                <Text className="header-icon">💡</Text>
                例句
              </Text>

              <View className="example-content">
                <Text className="english-sentence">
                  {currentWord.example.english
                    .split(currentWord.word)
                    .map((part, index, array) => (
                      <Text key={index}>
                        {part}
                        {index < array.length - 1 && (
                          <Text className="highlight-word">
                            {currentWord.word}
                          </Text>
                        )}
                      </Text>
                    ))}
                </Text>

                <Text className="chinese-sentence">
                  {currentWord.example.chinese}
                </Text>

                <View className="audio-control">
                  <View
                    className={`sentence-play-btn ${playingAudio === `${currentWord.id}-sentence` ? 'playing' : ''}`}
                    onClick={() => playAudio('sentence')}
                  >
                    <AtIcon
                      value={
                        playingAudio === `${currentWord.id}-sentence`
                          ? 'pause'
                          : 'sound'
                      }
                    />
                    <Text>朗读例句</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 测试模式选项 */}
            {session.mode === 'test' && !showMeaning && (
              <View className="options-list">
                {[
                  currentWord.meaning,
                  'adj. 普通的，一般的',
                  'adj. 复杂的，困难的',
                  'adj. 简单的，容易的',
                ].map((option, index) => (
                  <View
                    key={index}
                    className={`option-item ${selectedOption === index ? 'selected' : ''} ${
                      showAnswer
                        ? option === currentWord.meaning
                          ? 'correct'
                          : selectedOption === index
                            ? 'incorrect'
                            : ''
                        : ''
                    }`}
                    onClick={() => {
                      if (!showAnswer) {
                        setSelectedOption(index)
                        setShowAnswer(true)
                        setTimeout(() => {
                          handleAnswer(
                            option === currentWord.meaning ? 'know' : 'unknown'
                          )
                        }, 1500)
                      }
                    }}
                  >
                    <Text className="option-text">{option}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* 学习和复习模式的操作按钮 */}
            {(session.mode === 'new' || session.mode === 'review') && (
              <View className="word-actions">
                <View
                  className="action-btn know-btn"
                  onClick={() => handleAnswer('know')}
                >
                  <AtIcon value="check" className="btn-icon" />
                  <Text>认识</Text>
                </View>
                <View
                  className="action-btn unknown-btn"
                  onClick={() => handleAnswer('unknown')}
                >
                  <AtIcon value="close" className="btn-icon" />
                  <Text>不认识</Text>
                </View>
                <View
                  className="action-btn hard-btn"
                  onClick={() => handleAnswer('hard')}
                >
                  <AtIcon value="help" className="btn-icon" />
                  <Text>有点难</Text>
                </View>
              </View>
            )}

            {/* 挑战模式的快速操作 */}
            {session.mode === 'challenge' && (
              <View className="word-actions">
                <View
                  className="action-btn know-btn"
                  onClick={() => handleAnswer('know')}
                >
                  <AtIcon value="check" className="btn-icon" />
                  <Text>认识</Text>
                </View>
                <View
                  className="action-btn unknown-btn"
                  onClick={() => handleAnswer('unknown')}
                >
                  <AtIcon value="close" className="btn-icon" />
                  <Text>不认识</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* 底部控制区 */}
      <View className="study-controls">
        <View className="control-stats">
          <View className="stat-item">
            <Text className="stat-number correct">{session.correctCount}</Text>
            <Text className="stat-label">正确</Text>
          </View>
          <View className="stat-item">
            <Text className="stat-number incorrect">
              {session.incorrectCount}
            </Text>
            <Text className="stat-label">错误</Text>
          </View>
          <View className="stat-item">
            <Text className="stat-number remaining">
              {session.wordCount - session.currentIndex - 1}
            </Text>
            <Text className="stat-label">剩余</Text>
          </View>
        </View>

        <View className="control-buttons">
          <View className="control-btn pause-btn" onClick={togglePause}>
            {isPaused ? '继续' : '暂停'}
          </View>
          <View className="control-btn continue-btn" onClick={nextWord}>
            下一个
          </View>
        </View>
      </View>

      {/* 完成总结弹窗 */}
      {isCompleted && (
        <View className="completion-summary">
          <View className="summary-content">
            <Text className="summary-icon">🎉</Text>
            <Text className="summary-title">学习完成！</Text>
            <Text className="summary-subtitle">
              恭喜你完成了{session.wordCount}个单词的学习
            </Text>

            <View className="summary-stats">
              <View className="summary-stat">
                <Text className="stat-number accuracy">
                  {Math.round((session.correctCount / session.wordCount) * 100)}
                  %
                </Text>
                <Text className="stat-label">正确率</Text>
              </View>
              <View className="summary-stat">
                <Text className="stat-number time">
                  {Math.round((Date.now() - session.startTime) / 60000)}
                </Text>
                <Text className="stat-label">分钟</Text>
              </View>
              <View className="summary-stat">
                <Text className="stat-number words">{session.wordCount}</Text>
                <Text className="stat-label">单词数</Text>
              </View>
            </View>

            <View className="summary-actions">
              <View className="summary-btn retry-btn" onClick={restartSession}>
                重新学习
              </View>
              <View
                className="summary-btn continue-btn"
                onClick={continueLearning}
              >
                返回词汇
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default VocabularyStudyPage

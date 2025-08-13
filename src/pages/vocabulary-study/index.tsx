import { useState, useEffect, useRef } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { AtButton, AtIcon } from 'taro-ui'
import { useVocabularyStore } from '@/stores'
import { formatDuration, getUserLevelColor } from '@/utils'
import type { Vocabulary, PronunciationScore } from '@/types'
import ErrorBoundary from '@/components/ErrorBoundary'
import './index.scss'

const VocabularyStudy = () => {
  const router = useRouter()
  const { vocabularies, addStudiedWord } = useVocabularyStore()

  const [currentWord, setCurrentWord] = useState<Vocabulary | null>(null)
  const [showMeaning, setShowMeaning] = useState(false)
  const [showExample, setShowExample] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAccent, setCurrentAccent] = useState<'us' | 'uk'>('us')
  const [isRecording, setIsRecording] = useState(false)
  const [recordDuration, setRecordDuration] = useState(0)
  const [pronunciationScore, setPronunciationScore] = useState<PronunciationScore | null>(null)
  const [studyStep, setStudyStep] = useState(0) // 0: 看单词, 1: 听发音, 2: 看含义, 3: 看例句, 4: 练发音

  const innerAudioContextRef = useRef<Taro.InnerAudioContext | null>(null)
  const recorderManagerRef = useRef<Taro.RecorderManager | null>(null)
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null)

  const studySteps = [
    { title: '认识单词', description: '仔细观察这个单词' },
    { title: '听发音', description: '点击播放按钮听单词发音' },
    { title: '理解含义', description: '查看单词的中文含义' },
    { title: '学习例句', description: '通过例句理解单词用法' },
    { title: '练习发音', description: '跟读单词，练习发音' },
  ]

  useEffect(() => {
    const { wordId } = router.params
    if (wordId) {
      const word = vocabularies.find(w => w.id === wordId)
      if (word) {
        setCurrentWord(word)
      }
    }

    // 初始化音频播放器
    const innerAudioContext = Taro.createInnerAudioContext()
    innerAudioContextRef.current = innerAudioContext

    innerAudioContext.onPlay(() => {
      setIsPlaying(true)
    })

    innerAudioContext.onStop(() => {
      setIsPlaying(false)
    })

    innerAudioContext.onEnded(() => {
      setIsPlaying(false)
    })

    innerAudioContext.onError(() => {
      setIsPlaying(false)
      Taro.showToast({ title: '播放失败', icon: 'none' })
    })

    // 初始化录音管理器
    const recorderManager = Taro.getRecorderManager()
    recorderManagerRef.current = recorderManager

    recorderManager.onStart(() => {
      setIsRecording(true)
      startRecordTimer()
    })

    recorderManager.onStop(res => {
      setIsRecording(false)
      stopRecordTimer()
      handleRecordComplete(res.tempFilePath, res.duration / 1000)
    })

    recorderManager.onError(() => {
      setIsRecording(false)
      stopRecordTimer()
      Taro.showToast({ title: '录音失败', icon: 'none' })
    })

    return () => {
      innerAudioContext.destroy()
    }
  }, [router.params, vocabularies])

  const startRecordTimer = () => {
    setRecordDuration(0)
    recordTimerRef.current = setInterval(() => {
      setRecordDuration(prev => prev + 1)
    }, 1000)
  }

  const stopRecordTimer = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current)
      recordTimerRef.current = null
    }
    setRecordDuration(0)
  }

  const handlePlayPronunciation = (accent: 'us' | 'uk') => {
    if (!currentWord) return

    if (isPlaying) {
      innerAudioContextRef.current?.stop()
      return
    }

    setCurrentAccent(accent)

    // 这里应该播放真实的音频文件
    // innerAudioContextRef.current!.src = currentWord.audioUrl[accent]
    // innerAudioContextRef.current?.play()

    // 模拟播放
    setIsPlaying(true)
    setTimeout(() => {
      setIsPlaying(false)
    }, 2000)

    // 如果是第一次播放，自动进入下一步
    if (studyStep === 1) {
      setTimeout(() => {
        setStudyStep(2)
        setShowMeaning(true)
      }, 2500)
    }
  }

  const handleStartRecord = () => {
    Taro.authorize({
      scope: 'scope.record',
      success: () => {
        recorderManagerRef.current?.start({
          duration: 10000,
          sampleRate: 16000,
          numberOfChannels: 1,
          encodeBitRate: 96000,
          format: 'mp3',
        })
      },
      fail: () => {
        Taro.showModal({
          title: '提示',
          content: '需要获取麦克风权限才能进行语音练习',
          success: res => {
            if (res.confirm) {
              Taro.openSetting()
            }
          },
        })
      },
    })
  }

  const handleStopRecord = () => {
    recorderManagerRef.current?.stop()
  }

  const handleRecordComplete = async (_filePath: string, _duration: number) => {
    Taro.showLoading({ title: '评分中...', mask: true })

    // 这里应该调用真实的语音评分API
    // const score = await api.post('/pronunciation/score', { audioFile: filePath, word: currentWord?.word })

    // 模拟评分结果
    setTimeout(() => {
      const mockScore: PronunciationScore = {
        overall: Math.floor(Math.random() * 30) + 70,
        accuracy: Math.floor(Math.random() * 30) + 70,
        fluency: Math.floor(Math.random() * 30) + 70,
        completeness: Math.floor(Math.random() * 30) + 70,
        feedback: '发音很不错！继续保持这样的练习。',
      }

      setPronunciationScore(mockScore)
      Taro.hideLoading()
    }, 1500)
  }

  const handleNextStep = () => {
    if (studyStep < studySteps.length - 1) {
      const nextStep = studyStep + 1
      setStudyStep(nextStep)

      // 根据步骤自动显示相应内容
      switch (nextStep) {
        case 2:
          setShowMeaning(true)
          break
        case 3:
          setShowExample(true)
          break
      }
    } else {
      handleCompleteStudy()
    }
  }

  const handleCompleteStudy = () => {
    if (currentWord) {
      addStudiedWord(currentWord.id)
      Taro.showModal({
        title: '恭喜！',
        content: '您已完成这个单词的学习！',
        showCancel: false,
        success: () => {
          Taro.navigateBack()
        },
      })
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#50C878'
    if (score >= 80) return '#4A90E2'
    if (score >= 70) return '#FF9500'
    return '#E74C3C'
  }

  if (!currentWord) {
    return (
      <View className="loading-page">
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <ErrorBoundary>
      <View className="vocabulary-study-page">
        {/* 学习进度 */}
        <View className="progress-section">
          <View className="step-indicator">
            {studySteps.map((step, index) => (
              <View key={index} className={`step-dot ${index <= studyStep ? 'active' : ''}`} />
            ))}
          </View>
          <Text className="step-title">{studySteps[studyStep].title}</Text>
          <Text className="step-description">{studySteps[studyStep].description}</Text>
        </View>

        <ScrollView className="content-area" scrollY>
          {/* 单词卡片 */}
          <View className="word-card">
            <View className="word-header">
              <Text className="word-text">{currentWord.word}</Text>
              <View
                className="level-badge"
                style={{ backgroundColor: getUserLevelColor(currentWord.level) }}
              >
                <Text className="level-text">{currentWord.level}</Text>
              </View>
            </View>

            {/* 发音区域 */}
            {studyStep >= 1 && (
              <View className="pronunciation-section fade-in">
                <Text className="section-title">发音</Text>
                <View className="pronunciation-buttons">
                  <View
                    className={`accent-btn ${currentAccent === 'us' ? 'active' : ''}`}
                    onClick={() => handlePlayPronunciation('us')}
                  >
                    <AtIcon
                      value={isPlaying && currentAccent === 'us' ? 'pause' : 'play'}
                      size="16"
                      color={currentAccent === 'us' ? 'white' : '#4A90E2'}
                    />
                    <Text className="accent-text">美式 {currentWord.pronunciation.us}</Text>
                  </View>
                  <View
                    className={`accent-btn ${currentAccent === 'uk' ? 'active' : ''}`}
                    onClick={() => handlePlayPronunciation('uk')}
                  >
                    <AtIcon
                      value={isPlaying && currentAccent === 'uk' ? 'pause' : 'play'}
                      size="16"
                      color={currentAccent === 'uk' ? 'white' : '#4A90E2'}
                    />
                    <Text className="accent-text">英式 {currentWord.pronunciation.uk}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* 含义区域 */}
            {(studyStep >= 2 || showMeaning) && (
              <View className="meaning-section fade-in">
                <Text className="section-title">含义</Text>
                <View className="meaning-content">
                  <Text className="meaning-text">{currentWord.meaning}</Text>
                </View>
              </View>
            )}

            {/* 例句区域 */}
            {(studyStep >= 3 || showExample) && (
              <View className="example-section fade-in">
                <Text className="section-title">例句</Text>
                <View className="example-content">
                  <Text className="example-en">{currentWord.example.english}</Text>
                  <Text className="example-zh">{currentWord.example.chinese}</Text>
                </View>
              </View>
            )}

            {/* 发音练习区域 */}
            {studyStep >= 4 && (
              <View className="practice-section fade-in">
                <Text className="section-title">发音练习</Text>
                <Text className="practice-tip">请跟读单词: {currentWord.word}</Text>

                <View className="record-area">
                  {isRecording ? (
                    <View className="recording-state">
                      <View className="stop-record-btn" onClick={handleStopRecord}>
                        <AtIcon value="stop" size="24" color="white" />
                      </View>
                      <Text className="recording-text">
                        录音中... {formatDuration(recordDuration)}
                      </Text>
                    </View>
                  ) : (
                    <View className="start-record-btn" onClick={handleStartRecord}>
                      <AtIcon value="microphone" size="24" color="white" />
                      <Text className="record-text">点击录音</Text>
                    </View>
                  )}
                </View>

                {/* 评分结果 */}
                {pronunciationScore && (
                  <View className="score-section fade-in">
                    <Text className="score-title">发音评分</Text>

                    <View className="score-display">
                      <Text
                        className="score-number"
                        style={{ color: getScoreColor(pronunciationScore.overall) }}
                      >
                        {pronunciationScore.overall}
                      </Text>
                      <Text className="score-label">分</Text>
                    </View>

                    <View className="score-details">
                      <View className="score-item">
                        <Text className="detail-label">准确度</Text>
                        <Text
                          className="detail-value"
                          style={{ color: getScoreColor(pronunciationScore.accuracy) }}
                        >
                          {pronunciationScore.accuracy}
                        </Text>
                      </View>
                      <View className="score-item">
                        <Text className="detail-label">流利度</Text>
                        <Text
                          className="detail-value"
                          style={{ color: getScoreColor(pronunciationScore.fluency) }}
                        >
                          {pronunciationScore.fluency}
                        </Text>
                      </View>
                    </View>

                    <View className="feedback-section">
                      <Text className="feedback-text">{pronunciationScore.feedback}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* 底部操作按钮 */}
        <View className="bottom-actions">
          {studyStep < 4 ? (
            <AtButton
              type="primary"
              onClick={handleNextStep}
              disabled={studyStep === 1 && !isPlaying}
            >
              {studyStep === 0 ? '开始学习' : '下一步'}
            </AtButton>
          ) : (
            <AtButton type="primary" onClick={handleCompleteStudy}>
              完成学习
            </AtButton>
          )}
        </View>
      </View>
    </ErrorBoundary>
  )
}

export default VocabularyStudy

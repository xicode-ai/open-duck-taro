import { useState, useEffect, useRef, useCallback } from 'react'
import Taro, { useRouter, useDidHide } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { AtIcon, AtButton, AtProgress } from 'taro-ui'
import { useTopicStore } from '@/stores'
import { formatDuration, safeAsync, safeEventHandler } from '@/utils'
import type { Topic, Dialogue, PronunciationScore } from '@/types'
import { withPageErrorBoundary } from '@/components/ErrorBoundary/PageErrorBoundary'
import './index.scss'

const TopicChat = () => {
  const router = useRouter()
  const { topics } = useTopicStore()

  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null)
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordDuration, setRecordDuration] = useState(0)
  const [showTranslation, setShowTranslation] = useState(false)
  const [pronunciationScore, setPronunciationScore] =
    useState<PronunciationScore | null>(null)
  const [progress, setProgress] = useState(0)

  const innerAudioContextRef = useRef<Taro.InnerAudioContext | null>(null)
  const recorderManagerRef = useRef<Taro.RecorderManager | null>(null)
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 页面隐藏时清理资源
  useDidHide(() => {
    // 停止录音
    if (isRecording) {
      recorderManagerRef.current?.stop()
    }

    // 停止播放
    if (isPlaying) {
      innerAudioContextRef.current?.stop()
    }

    // 清理定时器
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current)
      recordTimerRef.current = null
    }
  })

  const handleRecordComplete = useCallback(
    (...args: [string, number]) => {
      safeAsync(async (_filePath: string, _duration: number) => {
        Taro.showLoading({ title: '评分中...', mask: true })

        // 这里应该调用真实的语音评分API
        // const score = await api.post('/pronunciation/score', { audioFile: filePath })

        // 模拟评分结果
        setTimeout(() => {
          const mockScore: PronunciationScore = {
            overall: Math.floor(Math.random() * 30) + 70, // 70-100
            accuracy: Math.floor(Math.random() * 30) + 70,
            fluency: Math.floor(Math.random() * 30) + 70,
            completeness: Math.floor(Math.random() * 30) + 70,
            feedback: '发音总体不错，可以多注意一下重音的位置。',
          }

          setPronunciationScore(mockScore)
          Taro.hideLoading()
        }, 2000)
      }, 'api')(...args)
    },
    [setPronunciationScore]
  )

  useEffect(() => {
    const { topicId } = router.params
    if (topicId) {
      const topic = topics.find(t => t.id === topicId)
      if (topic) {
        setCurrentTopic(topic)
        setProgress(0)
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

    // 初始化录音管理器（仅在支持的环境中）
    const env = Taro.getEnv()
    if (env !== Taro.ENV_TYPE.WEB) {
      try {
        const recorderManager = Taro.getRecorderManager()
        if (recorderManager && typeof recorderManager.onStart === 'function') {
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
        }
      } catch (error) {
        console.warn('录音管理器初始化失败:', error)
      }
    }

    return () => {
      innerAudioContext.destroy()
    }
  }, [router.params, topics, handleRecordComplete])

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

  const handlePlayDialogue = safeEventHandler((_dialogue: Dialogue) => {
    if (isPlaying) {
      innerAudioContextRef.current?.stop()
      return
    }

    // 这里应该播放真实的音频文件
    // innerAudioContextRef.current!.src = dialogue.audioUrl
    // innerAudioContextRef.current?.play()

    // 模拟播放
    setIsPlaying(true)
    setTimeout(() => {
      setIsPlaying(false)
    }, 3000)
  }, 'play-dialogue')

  const handleStartRecord = safeEventHandler(() => {
    const env = Taro.getEnv()

    // 检查是否在H5环境中
    if (env === Taro.ENV_TYPE.WEB) {
      Taro.showModal({
        title: '提示',
        content: 'H5环境暂不支持录音功能，请在小程序或APP中使用语音练习',
        showCancel: false,
      })
      return
    }

    // 检查录音管理器是否可用
    if (!recorderManagerRef.current) {
      Taro.showModal({
        title: '提示',
        content: '录音功能初始化失败，请重新进入页面或重启应用',
        showCancel: false,
      })
      return
    }

    Taro.authorize({
      scope: 'scope.record',
      success: () => {
        recorderManagerRef.current?.start({
          duration: 30000,
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
  }, 'start-record')

  const handleStopRecord = safeEventHandler(() => {
    recorderManagerRef.current?.stop()
  }, 'stop-record')

  const handleNextDialogue = safeEventHandler(() => {
    if (!currentTopic) return

    if (currentDialogueIndex < currentTopic.dialogues.length - 1) {
      setCurrentDialogueIndex(prev => prev + 1)
      setProgress(
        ((currentDialogueIndex + 1) / currentTopic.dialogues.length) * 100
      )
      setPronunciationScore(null)
    } else {
      // 完成所有对话
      Taro.showModal({
        title: '恭喜！',
        content: '您已完成本话题的所有对话练习！',
        showCancel: false,
        success: () => {
          Taro.navigateBack()
        },
      })
    }
  }, 'next-dialogue')

  const handlePrevDialogue = safeEventHandler(() => {
    if (currentDialogueIndex > 0) {
      setCurrentDialogueIndex(prev => prev - 1)
      setProgress(
        ((currentDialogueIndex - 1) / (currentTopic?.dialogues.length || 1)) *
          100
      )
      setPronunciationScore(null)
    }
  }, 'prev-dialogue')

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#50C878'
    if (score >= 80) return '#4A90E2'
    if (score >= 70) return '#FF9500'
    return '#E74C3C'
  }

  if (!currentTopic) {
    return (
      <View className="loading-page">
        <Text>加载中...</Text>
      </View>
    )
  }

  const currentDialogue = currentTopic.dialogues[currentDialogueIndex]

  // 安全检查：如果没有对话数据，显示错误提示
  if (!currentDialogue) {
    return (
      <View className="error-page">
        <Text className="error-title">对话数据加载失败</Text>
        <Text className="error-message">
          话题 &ldquo;{currentTopic.title}&rdquo; 暂无对话内容，请稍后再试
        </Text>
        <View className="error-actions">
          <AtButton type="primary" onClick={() => Taro.navigateBack()}>
            返回话题列表
          </AtButton>
        </View>
      </View>
    )
  }

  return (
    <View className="topic-chat-page">
      {/* 进度条 */}
      <View className="progress-section">
        <AtProgress
          percent={progress}
          strokeWidth={6}
          color="#4A90E2"
          className="progress-bar"
        />
        <Text className="progress-text">
          {currentDialogueIndex + 1} / {currentTopic.dialogues.length}
        </Text>
      </View>

      {/* 对话内容 */}
      <ScrollView className="dialogue-section" scrollY>
        <View className="dialogue-card">
          <View className="speaker-info">
            <View
              className={`speaker-avatar ${currentDialogue.speaker.toLowerCase()}`}
            >
              <Text className="speaker-text">{currentDialogue.speaker}</Text>
            </View>
            <Text className="speaker-label">
              {currentDialogue.speaker === 'A' ? '对话者A' : '对话者B'}
            </Text>
          </View>

          <View className="dialogue-content">
            <View className="english-text">
              <Text className="text">{currentDialogue.english}</Text>
              <View
                className="play-btn"
                onClick={() => handlePlayDialogue(currentDialogue)}
              >
                <AtIcon
                  value={isPlaying ? 'pause' : 'play'}
                  size="20"
                  color="#4A90E2"
                />
              </View>
            </View>

            <View
              className="translation-toggle"
              onClick={() => setShowTranslation(!showTranslation)}
            >
              <Text className="toggle-text">
                {showTranslation ? '隐藏' : '显示'}中文翻译
              </Text>
              <AtIcon
                value={showTranslation ? 'chevron-up' : 'chevron-down'}
                size="16"
                color="#666"
              />
            </View>

            {showTranslation && (
              <View className="chinese-text fade-in">
                <Text className="text">{currentDialogue.chinese}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 跟读练习区域 */}
        <View className="practice-section">
          <Text className="practice-title">跟读练习</Text>
          <Text className="practice-tip">点击录音按钮，跟读上面的英文句子</Text>

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

              <View className="score-grid">
                <View className="score-item">
                  <Text className="score-label">总分</Text>
                  <Text
                    className="score-value"
                    style={{ color: getScoreColor(pronunciationScore.overall) }}
                  >
                    {pronunciationScore.overall}
                  </Text>
                </View>
                <View className="score-item">
                  <Text className="score-label">准确度</Text>
                  <Text
                    className="score-value"
                    style={{
                      color: getScoreColor(pronunciationScore.accuracy),
                    }}
                  >
                    {pronunciationScore.accuracy}
                  </Text>
                </View>
                <View className="score-item">
                  <Text className="score-label">流利度</Text>
                  <Text
                    className="score-value"
                    style={{ color: getScoreColor(pronunciationScore.fluency) }}
                  >
                    {pronunciationScore.fluency}
                  </Text>
                </View>
                <View className="score-item">
                  <Text className="score-label">完整度</Text>
                  <Text
                    className="score-value"
                    style={{
                      color: getScoreColor(pronunciationScore.completeness),
                    }}
                  >
                    {pronunciationScore.completeness}
                  </Text>
                </View>
              </View>

              <View className="feedback-section">
                <Text className="feedback-title">改进建议</Text>
                <Text className="feedback-text">
                  {pronunciationScore.feedback}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 底部导航 */}
      <View className="bottom-navigation">
        <AtButton
          size="small"
          disabled={currentDialogueIndex === 0}
          onClick={handlePrevDialogue}
        >
          上一句
        </AtButton>

        <AtButton type="primary" size="small" onClick={handleNextDialogue}>
          {currentDialogueIndex === currentTopic.dialogues.length - 1
            ? '完成'
            : '下一句'}
        </AtButton>
      </View>
    </View>
  )
}

export default withPageErrorBoundary(TopicChat, {
  pageName: '话题对话',
  enableErrorReporting: true,
  showRetry: true,
  onError: (error, errorInfo) => {
    console.log('话题对话页面发生错误:', error, errorInfo)
  },
})

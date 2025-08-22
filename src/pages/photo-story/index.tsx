import { useState, useRef } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { AtIcon, AtActionSheet, AtActionSheetItem } from 'taro-ui'
import {
  generateId,
  formatDuration,
  getStorage,
  setStorage,
  safeAsync,
  safeEventHandler,
} from '@/utils'
import type { PhotoStory, PronunciationScore } from '@/types'
import { withPageErrorBoundary } from '@/components/ErrorBoundary/PageErrorBoundary'
import { CustomNavBar, GradientCard } from '../../components/common'
import './index.scss'

const PhotoStoryPage = () => {
  const [currentStory, setCurrentStory] = useState<PhotoStory | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordDuration, setRecordDuration] = useState(0)
  const [pronunciationScore, setPronunciationScore] =
    useState<PronunciationScore | null>(null)
  const [actionSheetOpen, setActionSheetOpen] = useState(false)

  const recorderManagerRef = useRef<Taro.RecorderManager | null>(null)
  const innerAudioContextRef = useRef<Taro.InnerAudioContext | null>(null)
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 初始化音频管理器
  const initAudioManagers = () => {
    // 录音管理器（仅在支持的环境中）
    const env = Taro.getEnv()
    if (!recorderManagerRef.current && env !== Taro.ENV_TYPE.WEB) {
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

    // 音频播放器
    if (!innerAudioContextRef.current) {
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
    }
  }

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

  // 选择照片来源
  const handleSelectPhoto = safeEventHandler(() => {
    setActionSheetOpen(true)
  }, 'select-photo')

  // 拍照
  const handleTakePhoto = safeEventHandler(() => {
    setActionSheetOpen(false)

    Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success: res => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        handleImageSelected(tempFilePath)
      },
      fail: () => {
        Taro.showToast({ title: '拍照失败', icon: 'none' })
      },
    })
  }, 'take-photo')

  // 从相册选择
  const handleChooseFromAlbum = safeEventHandler(() => {
    setActionSheetOpen(false)

    Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: res => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        handleImageSelected(tempFilePath)
      },
      fail: () => {
        Taro.showToast({ title: '选择图片失败', icon: 'none' })
      },
    })
  }, 'choose-from-album')

  // 处理选中的图片
  const handleImageSelected = safeAsync(async (imagePath: string) => {
    setIsGenerating(true)
    setPronunciationScore(null)

    // 这里应该调用真实的AI生成API
    // const response = await api.upload('/photo-story/generate', imagePath)

    // 模拟生成短文
    await new Promise(resolve => setTimeout(resolve, 3000))

    const stories = [
      'This is a beautiful sunset over the ocean. The golden light reflects on the calm water, creating a peaceful and romantic atmosphere. A few seagulls are flying in the distance, adding life to this serene scene.',
      'In this cozy coffee shop, people are enjoying their afternoon break. The warm lighting and comfortable seating create a perfect environment for relaxation and conversation. The aroma of freshly brewed coffee fills the air.',
      'This bustling city street is full of energy and movement. Tall buildings line both sides, while people hurry past with their daily activities. The mix of modern architecture and vibrant street life captures the essence of urban living.',
      "A group of friends is having a picnic in the park on a sunny day. They're sitting on a checkered blanket, sharing food and laughter. The green grass and blue sky create a perfect backdrop for this joyful moment.",
      'This elegant restaurant offers a fine dining experience with its sophisticated atmosphere. The carefully arranged tables, soft lighting, and attentive service make it an ideal place for special occasions and memorable meals.',
    ]

    const randomStory = stories[Math.floor(Math.random() * stories.length)]

    const newStory: PhotoStory = {
      id: generateId(),
      imageUrl: imagePath,
      story: randomStory,
      audioUrl: 'mock-audio-url',
      createdAt: Date.now(),
    }

    setCurrentStory(newStory)
    await saveStoryToHistory(newStory)
    setIsGenerating(false)
  }, 'api')

  // 保存到历史记录
  const saveStoryToHistory = safeAsync(async (story: PhotoStory) => {
    const history = (await getStorage<PhotoStory[]>('photo_stories')) || []
    const newHistory = [story, ...history.slice(0, 19)] // 保留最近20条
    await setStorage('photo_stories', newHistory)
  }, 'storage')

  // 播放短文语音
  const handlePlayStory = safeEventHandler(() => {
    if (!currentStory) return

    initAudioManagers()

    if (isPlaying) {
      innerAudioContextRef.current?.stop()
      return
    }

    // 这里应该播放真实的语音文件
    // innerAudioContextRef.current!.src = currentStory.audioUrl
    // innerAudioContextRef.current?.play()

    // 模拟播放
    setIsPlaying(true)
    setTimeout(() => {
      setIsPlaying(false)
    }, 5000)
  }, 'play-story')

  // 开始录音跟读
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

    initAudioManagers()

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
          duration: 60000,
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

  // 停止录音
  const handleStopRecord = safeEventHandler(() => {
    recorderManagerRef.current?.stop()
  }, 'stop-record')

  // 处理录音完成
  const handleRecordComplete = safeAsync(
    async (_filePath: string, _duration: number) => {
      Taro.showLoading({ title: '评分中...', mask: true })

      // 这里应该调用真实的语音评分API
      // const score = await api.post('/pronunciation/score', { audioFile: filePath, text: currentStory?.story })

      // 模拟评分结果
      setTimeout(() => {
        const mockScore: PronunciationScore = {
          overall: Math.floor(Math.random() * 30) + 70,
          accuracy: Math.floor(Math.random() * 30) + 70,
          fluency: Math.floor(Math.random() * 30) + 70,
          completeness: Math.floor(Math.random() * 30) + 70,
          feedback:
            '发音整体不错！建议多注意单词之间的连读，这样听起来会更自然流畅。',
        }

        setPronunciationScore(mockScore)
        Taro.hideLoading()
      }, 2000)
    },
    'api'
  )

  // 重新生成短文
  const handleRegenerate = safeEventHandler(() => {
    if (currentStory) {
      handleImageSelected(currentStory.imageUrl)
    }
  }, 'regenerate')

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#50C878'
    if (score >= 80) return '#4A90E2'
    if (score >= 70) return '#FF9500'
    return '#E74C3C'
  }

  return (
    <View className="photo-story-page">
      <CustomNavBar title="拍照短文" backgroundColor="#FF9500" />
      <ScrollView className="content-area" scrollY>
        {/* 页面描述 */}
        <View className="page-intro">
          <Text className="page-subtitle">AI智能描述，跟读练习</Text>
        </View>
        {/* 拍照区域 */}
        <GradientCard className="photo-card" gradient="green">
          <View className="photo-container" onClick={handleSelectPhoto}>
            {currentStory?.imageUrl ? (
              <Image
                className="photo-image"
                src={currentStory.imageUrl}
                mode="aspectFill"
              />
            ) : (
              <View className="photo-placeholder">
                <Text className="camera-icon">📸</Text>
                <Text className="placeholder-text">点击拍照或选择图片</Text>
                <Text className="placeholder-hint">AI将为您生成英文描述</Text>
              </View>
            )}
          </View>

          {currentStory && (
            <View className="photo-actions">
              <View className="action-btn" onClick={handleSelectPhoto}>
                <AtIcon value="camera" size="16" color="white" />
                <Text className="action-text">重新选择</Text>
              </View>
              <View className="action-btn" onClick={handleRegenerate}>
                <AtIcon value="reload" size="16" color="white" />
                <Text className="action-text">重新生成</Text>
              </View>
            </View>
          )}
        </GradientCard>

        {/* 生成中状态 */}
        {isGenerating && (
          <View className="generating-section">
            <View className="generating-animation">
              <View className="ai-icon">🤖</View>
              <View className="loading-dots">
                <View className="dot dot-1" />
                <View className="dot dot-2" />
                <View className="dot dot-3" />
              </View>
            </View>
            <Text className="generating-title">AI正在分析图片</Text>
            <Text className="generating-subtitle">
              生成专属英文描述，请稍候...
            </Text>
          </View>
        )}

        {/* 短文内容 */}
        {currentStory && !isGenerating && (
          <>
            <View className="story-section">
              <View className="story-header">
                <Text className="story-title">🌟 AI生成描述</Text>
                <View className="play-btn" onClick={handlePlayStory}>
                  <AtIcon
                    value={isPlaying ? 'pause' : 'play'}
                    size="16"
                    color="#6366f1"
                  />
                </View>
              </View>

              <View className="story-content">
                <Text className="story-text">{currentStory.story}</Text>
              </View>
            </View>

            {/* 跟读练习 */}
            <View className="practice-section">
              <Text className="practice-title">🎤 跟读练习</Text>
              <Text className="practice-desc">跟着朗读，提升发音准确度</Text>

              <View className="record-container">
                {isRecording ? (
                  <View className="recording-area">
                    <View className="recording-animation">
                      <View className="stop-btn" onClick={handleStopRecord}>
                        <AtIcon value="stop" size="20" color="white" />
                      </View>
                      <View className="recording-waves">
                        <View className="wave wave-1" />
                        <View className="wave wave-2" />
                        <View className="wave wave-3" />
                      </View>
                    </View>
                    <Text className="recording-text">
                      正在录音 {formatDuration(recordDuration)}
                    </Text>
                    <Text className="recording-hint">点击停止录音</Text>
                  </View>
                ) : (
                  <View className="record-btn" onClick={handleStartRecord}>
                    <View className="record-icon">
                      <AtIcon value="microphone" size="24" color="white" />
                    </View>
                    <Text className="record-text">开始跟读</Text>
                  </View>
                )}
              </View>

              {/* 发音评分 */}
              {pronunciationScore && (
                <View className="score-section">
                  <Text className="score-title">📊 发音评分</Text>

                  <View className="score-cards">
                    <View className="score-card">
                      <Text className="score-label">总分</Text>
                      <Text
                        className="score-number"
                        style={{
                          color: getScoreColor(pronunciationScore.overall),
                        }}
                      >
                        {pronunciationScore.overall}
                      </Text>
                    </View>
                    <View className="score-card">
                      <Text className="score-label">准确度</Text>
                      <Text
                        className="score-number"
                        style={{
                          color: getScoreColor(pronunciationScore.accuracy),
                        }}
                      >
                        {pronunciationScore.accuracy}
                      </Text>
                    </View>
                    <View className="score-card">
                      <Text className="score-label">流利度</Text>
                      <Text
                        className="score-number"
                        style={{
                          color: getScoreColor(pronunciationScore.fluency),
                        }}
                      >
                        {pronunciationScore.fluency}
                      </Text>
                    </View>
                    <View className="score-card">
                      <Text className="score-label">完整度</Text>
                      <Text
                        className="score-number"
                        style={{
                          color: getScoreColor(pronunciationScore.completeness),
                        }}
                      >
                        {pronunciationScore.completeness}
                      </Text>
                    </View>
                  </View>

                  <View className="feedback-card">
                    <Text className="feedback-title">💡 改进建议</Text>
                    <Text className="feedback-text">
                      {pronunciationScore.feedback}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* 照片来源选择 */}
      <AtActionSheet
        isOpened={actionSheetOpen}
        cancelText="取消"
        onCancel={() => setActionSheetOpen(false)}
        onClose={() => setActionSheetOpen(false)}
      >
        <AtActionSheetItem onClick={handleTakePhoto}>📷 拍照</AtActionSheetItem>
        <AtActionSheetItem onClick={handleChooseFromAlbum}>
          🖼️ 从相册选择
        </AtActionSheetItem>
      </AtActionSheet>
    </View>
  )
}

export default withPageErrorBoundary(PhotoStoryPage, {
  pageName: '拍照短文',
  enableErrorReporting: true,
  showRetry: true,
  onError: (error, errorInfo) => {
    console.log('拍照短文页面发生错误:', error, errorInfo)
  },
})

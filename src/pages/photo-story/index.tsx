import { useState, useRef } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { AtButton, AtIcon, AtActionSheet, AtActionSheetItem } from 'taro-ui'
import { generateId, formatDuration, getStorage, setStorage } from '@/utils'
import type { PhotoStory, PronunciationScore } from '@/types'
import ErrorBoundary from '@/components/ErrorBoundary'
import './index.scss'

const PhotoStoryPage = () => {
  const [currentStory, setCurrentStory] = useState<PhotoStory | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordDuration, setRecordDuration] = useState(0)
  const [pronunciationScore, setPronunciationScore] = useState<PronunciationScore | null>(null)
  const [actionSheetOpen, setActionSheetOpen] = useState(false)

  const recorderManagerRef = useRef<Taro.RecorderManager | null>(null)
  const innerAudioContextRef = useRef<Taro.InnerAudioContext | null>(null)
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 初始化音频管理器
  const initAudioManagers = () => {
    // 录音管理器
    if (!recorderManagerRef.current) {
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
  const handleSelectPhoto = () => {
    setActionSheetOpen(true)
  }

  // 拍照
  const handleTakePhoto = () => {
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
  }

  // 从相册选择
  const handleChooseFromAlbum = () => {
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
  }

  // 处理选中的图片
  const handleImageSelected = async (imagePath: string) => {
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
  }

  // 保存到历史记录
  const saveStoryToHistory = async (story: PhotoStory) => {
    const history = (await getStorage<PhotoStory[]>('photo_stories')) || []
    const newHistory = [story, ...history.slice(0, 19)] // 保留最近20条
    await setStorage('photo_stories', newHistory)
  }

  // 播放短文语音
  const handlePlayStory = () => {
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
  }

  // 开始录音跟读
  const handleStartRecord = () => {
    initAudioManagers()

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
  }

  // 停止录音
  const handleStopRecord = () => {
    recorderManagerRef.current?.stop()
  }

  // 处理录音完成
  const handleRecordComplete = async (_filePath: string, _duration: number) => {
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
        feedback: '发音整体不错！建议多注意单词之间的连读，这样听起来会更自然流畅。',
      }

      setPronunciationScore(mockScore)
      Taro.hideLoading()
    }, 2000)
  }

  // 重新生成短文
  const handleRegenerate = () => {
    if (currentStory) {
      handleImageSelected(currentStory.imageUrl)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#50C878'
    if (score >= 80) return '#4A90E2'
    if (score >= 70) return '#FF9500'
    return '#E74C3C'
  }

  return (
    <ErrorBoundary>
      <View className="photo-story-page">
        <ScrollView className="content-area" scrollY>
          {/* 拍照按钮区域 */}
          <View className="photo-section">
            <View className="photo-placeholder" onClick={handleSelectPhoto}>
              {currentStory?.imageUrl ? (
                <Image className="photo-image" src={currentStory.imageUrl} mode="aspectFill" />
              ) : (
                <View className="placeholder-content">
                  <AtIcon value="camera" size="48" color="#cccccc" />
                  <Text className="placeholder-text">点击拍照或选择图片</Text>
                </View>
              )}
            </View>

            {currentStory && (
              <View className="photo-actions">
                <AtButton size="small" onClick={handleSelectPhoto}>
                  重新选择
                </AtButton>
                <AtButton size="small" onClick={handleRegenerate} loading={isGenerating}>
                  重新生成
                </AtButton>
              </View>
            )}
          </View>

          {/* 生成中状态 */}
          {isGenerating && (
            <View className="generating-state">
              <View className="loading-animation">
                <View className="loading-dot" />
                <View className="loading-dot" />
                <View className="loading-dot" />
              </View>
              <Text className="generating-text">AI正在分析图片并生成短文...</Text>
            </View>
          )}

          {/* 短文内容 */}
          {currentStory && !isGenerating && (
            <View className="story-section">
              <View className="story-header">
                <Text className="story-title">生成的英文短文</Text>
                <View className="play-button" onClick={handlePlayStory}>
                  <AtIcon value={isPlaying ? 'pause' : 'play'} size="20" color="#4A90E2" />
                </View>
              </View>

              <View className="story-content">
                <Text className="story-text">{currentStory.story}</Text>
              </View>

              {/* 跟读练习区域 */}
              <View className="practice-section">
                <Text className="practice-title">跟读练习</Text>
                <Text className="practice-tip">点击下方按钮开始跟读练习</Text>

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
                      <Text className="record-text">开始跟读</Text>
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
                          style={{ color: getScoreColor(pronunciationScore.accuracy) }}
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
                          style={{ color: getScoreColor(pronunciationScore.completeness) }}
                        >
                          {pronunciationScore.completeness}
                        </Text>
                      </View>
                    </View>

                    <View className="feedback-section">
                      <Text className="feedback-title">改进建议</Text>
                      <Text className="feedback-text">{pronunciationScore.feedback}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* 照片来源选择菜单 */}
        <AtActionSheet
          isOpened={actionSheetOpen}
          cancelText="取消"
          onCancel={() => setActionSheetOpen(false)}
          onClose={() => setActionSheetOpen(false)}
        >
          <AtActionSheetItem onClick={handleTakePhoto}>拍照</AtActionSheetItem>
          <AtActionSheetItem onClick={handleChooseFromAlbum}>从相册选择</AtActionSheetItem>
        </AtActionSheet>
      </View>
    </ErrorBoundary>
  )
}

export default PhotoStoryPage

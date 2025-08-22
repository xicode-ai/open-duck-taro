import React, { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import { useUserStore } from '../../stores/user'
import './index.scss'

interface PhotoStory {
  id: string
  imageUrl: string
  story: string
  translation: string
  audioUrl?: string
  createdAt: number
  score?: number
}

const PhotoStoryPage = () => {
  const { updateDailyUsage, checkUsage } = useUserStore()

  // 状态管理
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [storyResult, setStoryResult] = useState<PhotoStory | null>(null)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recentStories, setRecentStories] = useState<PhotoStory[]>([])

  // 页面初始化
  useEffect(() => {
    loadRecentStories()
  }, [])

  // 加载最近的照片短文
  const loadRecentStories = async () => {
    // 模拟加载最近的照片短文
    const mockStories: PhotoStory[] = [
      {
        id: '1',
        imageUrl:
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
        story:
          'A beautiful sunset over the mountains creates a peaceful and serene atmosphere.',
        translation: '山峦上美丽的日落营造出宁静祥和的氛围。',
        createdAt: Date.now() - 3600000,
        score: 85,
      },
      {
        id: '2',
        imageUrl:
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300',
        story:
          'The busy city street is filled with people rushing to their destinations.',
        translation: '繁忙的城市街道上满是匆忙赶往目的地的人们。',
        createdAt: Date.now() - 7200000,
        score: 92,
      },
    ]

    setRecentStories(mockStories)
  }

  // 拍照功能
  const takePhoto = async () => {
    try {
      const usage = checkUsage('photo')
      if (!usage.canUse) {
        Taro.showModal({
          title: '使用次数已用完',
          content: '今日拍照短文功能使用次数已用完，开通会员可无限使用',
          confirmText: '开通会员',
          cancelText: '取消',
          success: res => {
            if (res.confirm) {
              Taro.navigateTo({ url: '/pages/membership/index' })
            }
          },
        })
        return
      }

      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera'],
      })

      if (res.tempFilePaths.length > 0) {
        setCurrentImage(res.tempFilePaths[0])
        updateDailyUsage('photo')
      }
    } catch (error) {
      console.error('拍照失败:', error)
      Taro.showToast({
        title: '拍照失败，请重试',
        icon: 'error',
      })
    }
  }

  // 从相册选择
  const chooseFromAlbum = async () => {
    try {
      const usage = checkUsage('photo')
      if (!usage.canUse) {
        Taro.showModal({
          title: '使用次数已用完',
          content: '今日拍照短文功能使用次数已用完，开通会员可无限使用',
          confirmText: '开通会员',
          cancelText: '取消',
          success: res => {
            if (res.confirm) {
              Taro.navigateTo({ url: '/pages/membership/index' })
            }
          },
        })
        return
      }

      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album'],
      })

      if (res.tempFilePaths.length > 0) {
        setCurrentImage(res.tempFilePaths[0])
        updateDailyUsage('photo')
      }
    } catch (_error) {
      console.error('选择图片失败:', _error)
      Taro.showToast({
        title: '选择图片失败，请重试',
        icon: 'error',
      })
    }
  }

  // 生成短文
  const generateStory = async () => {
    if (!currentImage) return

    setIsGenerating(true)

    try {
      // 模拟AI分析图片和生成短文的过程
      await new Promise(resolve => setTimeout(resolve, 3000))

      // 模拟生成的短文
      const generatedStory: PhotoStory = {
        id: Date.now().toString(),
        imageUrl: currentImage,
        story:
          'This image shows a beautiful landscape with mountains in the background and a clear blue sky. The natural scenery creates a sense of tranquility and wonder.',
        translation:
          '这张图片展示了一个美丽的风景，背景是山脉，天空湛蓝清澈。这自然风光营造出宁静和惊叹的感觉。',
        createdAt: Date.now(),
      }

      setStoryResult(generatedStory)

      Taro.showToast({
        title: '短文生成完成',
        icon: 'success',
      })
    } catch (_error) {
      console.error('生成短文失败:', _error)
      Taro.showToast({
        title: '生成失败，请重试',
        icon: 'error',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // 播放音频
  const playStoryAudio = () => {
    if (!storyResult) return

    const audioId = `story-${storyResult.id}`

    if (playingAudio === audioId) {
      setPlayingAudio(null)
      Taro.stopBackgroundAudio()
    } else {
      setPlayingAudio(audioId)

      // 模拟音频播放
      setTimeout(() => {
        setPlayingAudio(null)
      }, 5000)

      Taro.showToast({
        title: '播放中',
        icon: 'none',
      })
    }
  }

  // 复制文本
  const copyStory = () => {
    if (!storyResult) return

    Taro.setClipboardData({
      data: storyResult.story,
      success: () => {
        Taro.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
        })
      },
    })
  }

  // 保存短文
  const saveStory = () => {
    if (!storyResult) return

    // 添加到最近故事列表
    setRecentStories([storyResult, ...recentStories])

    Taro.showToast({
      title: '保存成功',
      icon: 'success',
    })
  }

  // 跟读练习
  const startRecording = async () => {
    if (!storyResult) return

    try {
      const { authSetting } = await Taro.getSetting()

      if (!authSetting['scope.record']) {
        await Taro.authorize({ scope: 'scope.record' })
      }

      setIsRecording(true)

      // 模拟录音5秒后自动停止
      setTimeout(() => {
        setIsRecording(false)

        // 模拟发音评分
        const score = Math.floor(Math.random() * 30) + 70 // 70-100分
        setStoryResult({
          ...storyResult,
          score,
        })

        Taro.showToast({
          title: `发音得分: ${score}分`,
          icon: 'success',
        })
      }, 5000)
    } catch (_error) {
      setIsRecording(false)
      Taro.showModal({
        title: '需要录音权限',
        content: '请在设置中开启录音权限',
        showCancel: false,
      })
    }
  }

  // 重新拍照
  const retakePhoto = () => {
    setCurrentImage(null)
    setStoryResult(null)
  }

  // 查看历史记录
  const viewHistory = () => {
    Taro.showToast({
      title: '历史记录功能开发中',
      icon: 'none',
    })
  }

  // 下拉刷新
  // const onPullDownRefresh = () => {
  //   loadRecentStories().then(() => {
  //     Taro.stopPullDownRefresh()
  //   })
  // }

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes}分钟前`
    } else if (hours < 24) {
      return `${hours}小时前`
    } else {
      const days = Math.floor(hours / 24)
      return `${days}天前`
    }
  }

  return (
    <View className="photo-story-page">
      {/* 页面头部 */}
      <View className="photo-header">
        <View className="header-content">
          <Text className="header-title">拍照短文</Text>
          <Text className="header-subtitle">
            拍摄照片，AI为你生成英文描述
            {'\n'}
            练习发音，提升口语表达能力
          </Text>
        </View>
      </View>

      <View className="photo-content">
        {/* 拍照区域 */}
        <View className="photo-capture">
          <View className={`capture-area ${currentImage ? 'has-image' : ''}`}>
            {currentImage ? (
              <>
                <Image
                  src={currentImage}
                  className="captured-image"
                  mode="aspectFill"
                />
                <View className="image-overlay">
                  <View className="overlay-actions">
                    <View className="overlay-btn" onClick={retakePhoto}>
                      <AtIcon value="camera" />
                    </View>
                    <View className="overlay-btn" onClick={chooseFromAlbum}>
                      <AtIcon value="image" />
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <View className="capture-placeholder">
                <Text className="placeholder-icon">📸</Text>
                <Text className="placeholder-title">添加照片</Text>
                <Text className="placeholder-desc">
                  拍摄或选择一张照片
                  {'\n'}
                  AI将为你生成精彩的英文描述
                </Text>
              </View>
            )}
          </View>

          <View className="capture-actions">
            <View className="capture-btn camera-btn" onClick={takePhoto}>
              <AtIcon value="camera" className="btn-icon" />
              <Text>拍照</Text>
            </View>
            <View className="capture-btn album-btn" onClick={chooseFromAlbum}>
              <AtIcon value="image" className="btn-icon" />
              <Text>相册</Text>
            </View>
          </View>

          {currentImage && (
            <View
              className={`generate-btn ${isGenerating ? 'generating' : ''}`}
              onClick={generateStory}
              style={{
                opacity: isGenerating ? 0.7 : 1,
                pointerEvents: isGenerating ? 'none' : 'auto',
              }}
            >
              <AtIcon
                value={isGenerating ? 'loading-3' : 'lightning'}
                className="generate-icon"
              />
              <Text>{isGenerating ? 'AI分析中...' : '生成英文描述'}</Text>
            </View>
          )}
        </View>

        {/* 生成结果 */}
        {storyResult && (
          <View className="story-result show">
            <View className="result-header">
              <Text className="result-title">
                <Text className="title-icon">✨</Text>
                AI生成的描述
              </Text>

              <View className="result-actions">
                <View
                  className={`action-btn play-btn ${playingAudio === `story-${storyResult.id}` ? 'playing' : ''}`}
                  onClick={playStoryAudio}
                >
                  <AtIcon
                    value={
                      playingAudio === `story-${storyResult.id}`
                        ? 'pause'
                        : 'sound'
                    }
                  />
                  <Text>
                    {playingAudio === `story-${storyResult.id}`
                      ? '停止'
                      : '朗读'}
                  </Text>
                </View>

                <View className="action-btn copy-btn" onClick={copyStory}>
                  <AtIcon value="copy" />
                  <Text>复制</Text>
                </View>

                <View className="action-btn save-btn" onClick={saveStory}>
                  <AtIcon value="download" />
                  <Text>保存</Text>
                </View>
              </View>
            </View>

            <View className="story-content">
              <Text className="story-text">{storyResult.story}</Text>
              <Text className="story-translation">
                {storyResult.translation}
              </Text>

              <View className="practice-section">
                <Text className="practice-header">
                  <Text className="header-icon">🎤</Text>
                  跟读练习
                </Text>

                <View className="practice-controls">
                  <View
                    className={`practice-btn listen-btn ${playingAudio === `story-${storyResult.id}` ? 'active' : ''}`}
                    onClick={playStoryAudio}
                  >
                    <AtIcon value="sound" />
                    <Text>听录音</Text>
                  </View>

                  <View
                    className={`practice-btn record-btn ${isRecording ? 'recording' : ''}`}
                    onClick={startRecording}
                  >
                    <AtIcon value="sound" />
                    <Text>{isRecording ? '录音中...' : '开始跟读'}</Text>
                  </View>
                </View>

                {storyResult.score && (
                  <View
                    className="score-display"
                    style={
                      {
                        '--score-percent': `${storyResult.score}%`,
                      } as React.CSSProperties
                    }
                  >
                    <View className="score-circle">
                      <Text className="score-text">{storyResult.score}</Text>
                    </View>
                    <Text className="score-label">发音得分</Text>
                    <Text className="score-feedback">
                      {storyResult.score >= 90
                        ? '发音很棒！'
                        : storyResult.score >= 80
                          ? '发音不错，继续加油！'
                          : '多练习会更好哦！'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* 最近的照片短文 */}
        <View className="photo-gallery">
          <View className="gallery-header">
            <Text className="gallery-title">
              <Text className="title-icon">📱</Text>
              最近创作
            </Text>

            <View className="view-all-btn" onClick={viewHistory}>
              <Text>查看全部</Text>
              <AtIcon value="chevron-right" size="16" />
            </View>
          </View>

          <View className="gallery-grid">
            {recentStories.slice(0, 4).map(story => (
              <View key={story.id} className="gallery-item">
                <Image
                  src={story.imageUrl}
                  className="item-image"
                  mode="aspectFill"
                />

                <View className="item-overlay">
                  <Text className="overlay-time">
                    {formatTime(story.createdAt)}
                  </Text>
                </View>

                <View className="item-actions">
                  <View className="item-action-btn">
                    <AtIcon value="sound" />
                  </View>
                  <View className="item-action-btn">
                    <AtIcon value="share" />
                  </View>
                </View>
              </View>
            ))}

            {/* 空位占位符 */}
            {Array.from({ length: 4 - Math.min(recentStories.length, 4) }).map(
              (_, index) => (
                <View key={`placeholder-${index}`} className="gallery-item">
                  <View className="item-placeholder">
                    <Text className="placeholder-icon">📷</Text>
                    <Text className="placeholder-text">空位</Text>
                  </View>
                </View>
              )
            )}
          </View>
        </View>

        {/* 使用提示 */}
        <View className="tips-section">
          <Text className="tips-title">
            <Text className="title-icon">💡</Text>
            使用技巧
          </Text>

          <View className="tips-list">
            <View className="tip-item">
              <View className="tip-icon">1</View>
              <View className="tip-content">
                <Text className="tip-title">选择清晰照片</Text>
                <Text className="tip-desc">
                  选择光线充足、主题明确的照片，AI能生成更准确的描述
                </Text>
              </View>
            </View>

            <View className="tip-item">
              <View className="tip-icon">2</View>
              <View className="tip-content">
                <Text className="tip-title">跟读练习</Text>
                <Text className="tip-desc">
                  先听标准发音，再跟读练习，系统会为你的发音打分
                </Text>
              </View>
            </View>

            <View className="tip-item">
              <View className="tip-icon">3</View>
              <View className="tip-content">
                <Text className="tip-title">保存收藏</Text>
                <Text className="tip-desc">
                  保存喜欢的短文，随时回顾练习，建立个人学习库
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 悬浮拍照按钮 */}
      <View
        className={`floating-camera-btn ${isGenerating ? 'generating' : ''}`}
        onClick={takePhoto}
      >
        <AtIcon value="camera" />
      </View>

      {/* 生成加载遮罩 */}
      {isGenerating && (
        <View className="loading-overlay">
          <View className="loading-content">
            <AtIcon value="loading-3" className="loading-icon" />
            <Text className="loading-title">AI正在分析图片</Text>
            <Text className="loading-desc">
              正在识别图片内容并生成
              {'\n'}
              精彩的英文描述...
            </Text>

            <View className="loading-progress">
              <View className="progress-bar">
                <View className="progress-fill"></View>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default PhotoStoryPage

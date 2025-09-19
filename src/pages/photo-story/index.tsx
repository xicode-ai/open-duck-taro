import React, { useState, useCallback, useEffect, useRef } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import { CustomNavBar, ModernBubbleMenu } from '@/components/common'
import { usePhotoStoryStore } from '@/stores/photoStory'
import {
  useGenerateStory,
  useSpeechScore as useSpeechScoreHook,
  useToggleFavorite,
  useUpdateStoryScore,
} from '@/hooks/usePhotoStory'
import { useAudioRecording } from '@/hooks/useAudioRecording'
import type { PhotoStoryScore } from '@/types'
import './index.scss'

const PhotoStoryPage: React.FC = () => {
  // 翻译状态管理
  const [showStandardTranslation, setShowStandardTranslation] = useState(false)
  const [showNativeTranslation, setShowNativeTranslation] = useState(false)

  // 浮动菜单状态
  const [floatMenuConfig, setFloatMenuConfig] = useState<{
    isOpened: boolean
    type: 'standard' | 'native' | null
    position?: { x: number; y: number }
  }>({ isOpened: false, type: null })

  // 跟读模态框状态
  const [showSpeechModal, setShowSpeechModal] = useState(false)
  const [speechContent, setSpeechContent] = useState('')
  const [speechContentType, setSpeechContentType] = useState<
    'standard' | 'native'
  >('standard')
  const [_speechScore, setSpeechScore] = useState<PhotoStoryScore | null>(null)

  // 音频播放状态管理
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const audioContextRef = useRef<Taro.InnerAudioContext | null>(null)

  const {
    currentImage,
    currentStory,
    isGenerating,
    setCurrentImage,
    toggleFavorite,
    clearAll,
  } = usePhotoStoryStore()

  const generateStory = useGenerateStory()
  const speechScoreApi = useSpeechScoreHook()
  const toggleFavoriteMutation = useToggleFavorite()
  const updateStoryScoreWithCache = useUpdateStoryScore()

  // 清理页面离开时可能残留的blob URL
  useEffect(() => {
    return () => {
      // 组件卸载时清理blob URL以防止内存泄漏
      if (currentImage?.startsWith('blob:')) {
        try {
          window.URL.revokeObjectURL(currentImage)
        } catch (error) {
          console.warn('清理blob URL时出现错误:', error)
        }
      }
    }
  }, [currentImage])

  // 组件卸载时清理音频上下文
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.stop()
        audioContextRef.current.destroy()
        audioContextRef.current = null
      }
    }
  }, [])

  // 导航到历史页面
  const navigateToHistory = () => {
    Taro.navigateTo({
      url: '/pages/photo-story-history/index',
    })
  }

  // 将图片转换为base64
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convertImageToBase64 = (res: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log('convertImageToBase64 接收到的数据:', res)

      // H5环境使用FileReader
      if (process.env.TARO_ENV === 'h5') {
        // 检查 tempFiles 是否存在且包含有效的文件对象
        if (res.tempFiles && res.tempFiles.length > 0) {
          const fileInfo = res.tempFiles[0]
          console.log('tempFiles[0]:', fileInfo)

          // 获取实际的文件对象
          let file = fileInfo

          // 如果 fileInfo 有 file 属性，使用该属性
          if (fileInfo.file) {
            file = fileInfo.file
          } else if (fileInfo.originalFileObj) {
            file = fileInfo.originalFileObj
          }

          console.log('最终使用的文件对象:', file)
          console.log('文件对象类型检查:', {
            isFile: file instanceof File,
            // eslint-disable-next-line no-undef
            isBlob: file instanceof Blob,
            type: file?.type,
            size: file?.size,
          })

          // 确保是有效的 File 或 Blob 对象
          // eslint-disable-next-line no-undef
          if (file instanceof File || file instanceof Blob) {
            // eslint-disable-next-line no-undef
            const reader = new FileReader()
            reader.onload = () => {
              resolve(reader.result as string)
            }
            reader.onerror = () => {
              reject(new Error('文件读取失败'))
            }
            reader.readAsDataURL(file)
          } else {
            console.error('无效的文件对象:', file)
            reject(new Error('无效的文件对象'))
          }
        } else if (res.tempFilePaths && res.tempFilePaths.length > 0) {
          // 如果没有 tempFiles，但有 tempFilePaths，尝试通过路径获取文件
          const imagePath = res.tempFilePaths[0]
          console.log('使用 tempFilePaths:', imagePath)

          // 对于 H5 环境，tempFilePaths 可能是 blob URL 或者 data URL
          if (imagePath.startsWith('data:')) {
            // 已经是 base64 格式
            resolve(imagePath)
          } else if (imagePath.startsWith('blob:')) {
            // 是 blob URL，需要转换为 base64
            fetch(imagePath)
              .then(response => response.blob())
              .then(blob => {
                // eslint-disable-next-line no-undef
                const reader = new FileReader()
                reader.onload = () => {
                  resolve(reader.result as string)
                }
                reader.onerror = () => {
                  reject(new Error('Blob 读取失败'))
                }
                reader.readAsDataURL(blob)
              })
              .catch(error => {
                console.error('Fetch blob 失败:', error)
                reject(error)
              })
          } else {
            // 其他情况，直接使用路径
            resolve(imagePath)
          }
        } else {
          reject(new Error('未找到有效的图片数据'))
        }
      } else {
        // 小程序环境使用文件系统API
        try {
          const fileManager = Taro.getFileSystemManager()
          const base64 = fileManager.readFileSync(
            res.tempFilePaths[0],
            'base64'
          )
          const imageBase64 = `data:image/jpeg;base64,${base64}`
          resolve(imageBase64)
        } catch (error) {
          reject(error)
        }
      }
    })
  }

  // 通用的图片处理函数
  const processSelectedImage = async (
    res: Taro.chooseImage.SuccessCallbackResult
  ) => {
    if (res.tempFilePaths.length > 0) {
      const imagePath = res.tempFilePaths[0]
      console.log('选择的图片路径:', imagePath)
      setCurrentImage(imagePath)

      // 图片选择成功后立即生成短文
      try {
        const imageBase64 = await convertImageToBase64(res)
        await generateStory.mutateAsync({ imageBase64 })
      } catch (error) {
        console.error('生成短文失败:', error)
        Taro.showToast({
          title: '生成短文失败，请重试',
          icon: 'error',
        })
      }
    }
  }

  // 选择图片（从相册/文件）
  const handleChooseImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album'], // 从相册选择
      })

      await processSelectedImage(res)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('选择图片失败:', error)
      if (error?.errMsg !== 'chooseImage:fail cancel') {
        Taro.showToast({
          title: '选择图片失败',
          icon: 'error',
        })
      }
    }
  }

  // 拍照（调用摄像头）
  const handleTakePhoto = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera'], // 使用摄像头
      })

      await processSelectedImage(res)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('拍照失败:', error)

      if (error?.errMsg !== 'chooseImage:fail cancel') {
        Taro.showToast({
          title: '拍照失败',
          icon: 'error',
        })
      }
    }
  }

  // 显示图片选择菜单
  const showImageActionSheet = () => {
    Taro.showActionSheet({
      itemList: ['从相册选择', '拍照'],
      success: res => {
        if (res.tapIndex === 0) {
          handleChooseImage()
        } else {
          handleTakePhoto()
        }
      },
    })
  }

  // 播放音频 - 参考翻译页面的实现
  const playAudio = useCallback(
    (text: string, type: string) => {
      const audioId = `${type}-audio`

      if (playingAudio === audioId) {
        // 停止播放
        try {
          if (audioContextRef.current) {
            audioContextRef.current.stop()
            audioContextRef.current.destroy()
            audioContextRef.current = null
          }
          setPlayingAudio(null)
          Taro.showToast({
            title: '已停止播放',
            icon: 'success',
          }).catch(err => {
            console.warn('显示Toast失败:', err)
          })
        } catch (error) {
          console.error('停止播放失败:', error)
          setPlayingAudio(null)
        }
      } else {
        // 先停止当前播放的音频
        if (audioContextRef.current) {
          try {
            audioContextRef.current.stop()
            audioContextRef.current.destroy()
            audioContextRef.current = null
          } catch (error) {
            console.error('清理音频上下文失败:', error)
          }
        }

        // 开始播放 - 这里应该调用TTS API
        try {
          setPlayingAudio(audioId)

          // 创建音频上下文
          const audioContext = Taro.createInnerAudioContext()
          audioContextRef.current = audioContext

          // 模拟音频播放（实际应该使用TTS API获取音频URL）
          // audioContext.src = 'your-tts-audio-url'

          // 监听播放结束事件
          audioContext.onEnded(() => {
            setPlayingAudio(null)
            if (audioContextRef.current) {
              audioContextRef.current = null
            }
          })

          // 监听播放错误事件
          audioContext.onError(error => {
            console.error('音频播放错误:', error)
            setPlayingAudio(null)
            if (audioContextRef.current) {
              audioContextRef.current = null
            }
            Taro.showToast({
              title: '播放失败',
              icon: 'error',
            }).catch(err => {
              console.warn('显示Toast失败:', err)
            })
          })

          // 模拟播放完成（实际应该调用audioContext.play()）
          const playTimer = setTimeout(() => {
            if (audioContextRef.current) {
              setPlayingAudio(null)
              try {
                audioContextRef.current.destroy()
              } catch (error) {
                console.error('销毁音频上下文失败:', error)
              }
              audioContextRef.current = null
            }
          }, 3000)

          // 保存定时器引用以便清理
          audioContext.onEnded(() => {
            clearTimeout(playTimer)
          })
          audioContext.onError(() => {
            clearTimeout(playTimer)
          })

          Taro.showToast({
            title: '播放中',
            icon: 'success',
          }).catch(err => {
            console.warn('显示Toast失败:', err)
          })
        } catch (error) {
          console.error('播放失败:', error)
          setPlayingAudio(null)
          if (audioContextRef.current) {
            audioContextRef.current = null
          }
          Taro.showToast({
            title: '播放失败',
            icon: 'error',
          }).catch(err => {
            console.warn('显示Toast失败:', err)
          })
        }
      }
    },
    [playingAudio]
  )

  // 复制文本
  const copyText = useCallback((text: string) => {
    Taro.setClipboardData({
      data: text,
      success: () => {
        Taro.showToast({
          title: '已复制',
          icon: 'success',
          duration: 1500,
        }).catch(err => {
          console.warn('显示复制成功Toast失败:', err)
        })
      },
      fail: error => {
        console.error('复制失败:', error)
        Taro.showToast({
          title: '复制失败',
          icon: 'error',
        }).catch(err => {
          console.warn('显示复制失败Toast失败:', err)
        })
      },
    }).catch(error => {
      console.error('设置剪贴板数据失败:', error)
    })
  }, [])

  // 切换收藏状态
  const handleToggleFavorite = useCallback(async () => {
    try {
      if (!currentStory?.id) {
        Taro.showToast({
          title: '短文信息无效',
          icon: 'none',
        }).catch(err => {
          console.warn('显示Toast失败:', err)
        })
        return
      }

      // 先更新本地状态，提供即时反馈
      toggleFavorite()

      try {
        await toggleFavoriteMutation.mutateAsync({
          id: currentStory.id,
          isFavorite: !currentStory.isFavorite,
        })
      } catch (error) {
        // API 调用失败时，回滚本地状态
        toggleFavorite()
        console.error('切换收藏状态失败:', error)
        Taro.showToast({
          title: '操作失败，请重试',
          icon: 'error',
        }).catch(err => {
          console.warn('显示错误Toast失败:', err)
        })
      }
    } catch (error) {
      console.error('切换收藏状态异常:', error)
    }
  }, [currentStory, toggleFavoriteMutation, toggleFavorite])

  // 触摸状态管理（用于增强长按功能）
  const touchTimeoutRef = useRef<number | null>(null)
  const touchStartPositionRef = useRef<{ x: number; y: number } | null>(null)

  // 组件卸载时清理计时器
  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current)
        touchTimeoutRef.current = null
      }
    }
  }, [])

  // 使用 useRef 存储长按处理函数，避免依赖循环
  const handleLongPressRef =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useRef<(type: 'standard' | 'native', event?: any) => void>()

  // 长按显示浮动菜单
  handleLongPressRef.current = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (type: 'standard' | 'native', event?: any) => {
      console.log('长按事件触发，显示浮动菜单', type, event)

      // 防止事件冒泡
      if (event && event.stopPropagation) {
        event.stopPropagation()
      }

      // 获取触摸位置
      const position = touchStartPositionRef.current
      console.log('使用触摸位置:', position)

      // 显示浮动菜单
      setFloatMenuConfig({
        isOpened: true,
        type: type,
        position: position || undefined,
      })

      // 安全的震动反馈
      try {
        if (process.env.TARO_ENV === 'weapp' && Taro.vibrateShort) {
          Taro.vibrateShort().catch(err => {
            console.log('震动反馈调用失败:', err)
          })
        }
      } catch (error) {
        console.log('震动反馈不支持:', error)
      }
    },
    [setFloatMenuConfig]
  )

  const handleLongPress = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (type: 'standard' | 'native', event?: any) => {
      if (handleLongPressRef.current) {
        handleLongPressRef.current(type, event)
      }
    },
    []
  )

  // 简化的触摸事件处理，记录触摸位置
  const handleTouchStart = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (type: 'standard' | 'native', event: any) => {
      try {
        // 防止重复触发
        if (touchTimeoutRef.current) {
          clearTimeout(touchTimeoutRef.current)
          touchTimeoutRef.current = null
        }

        // 记录触摸位置
        let touchX = 0
        let touchY = 0
        try {
          if (event.touches && event.touches.length > 0) {
            // 原生触摸事件
            const touch = event.touches[0]
            touchX = touch.clientX
            touchY = touch.clientY
          } else if (event.changedTouches && event.changedTouches.length > 0) {
            // changedTouches
            const touch = event.changedTouches[0]
            touchX = touch.clientX
            touchY = touch.clientY
          } else if (event.detail && event.detail.x !== undefined) {
            // Taro 事件格式
            touchX = event.detail.x
            touchY = event.detail.y
          } else if (event.clientX !== undefined) {
            // 鼠标事件
            touchX = event.clientX
            touchY = event.clientY
          } else {
            // 备用方案：屏幕中心
            touchX = window.innerWidth / 2
            touchY = window.innerHeight / 2
          }
        } catch (error) {
          console.log('获取触摸位置失败，使用屏幕中心:', error)
          touchX = window.innerWidth / 2
          touchY = window.innerHeight / 2
        }

        touchStartPositionRef.current = { x: touchX, y: touchY }
        console.log('记录触摸位置:', touchStartPositionRef.current)

        // 设置长按计时器
        touchTimeoutRef.current = window.setTimeout(() => {
          try {
            if (handleLongPressRef.current) {
              handleLongPressRef.current(type, event)
            }
          } catch (error) {
            console.error('长按处理出错:', error)
          } finally {
            touchTimeoutRef.current = null
          }
        }, 800) // 增加到800ms，避免误触
      } catch (error) {
        console.error('触摸开始处理出错:', error)
      }
    },
    []
  )

  const handleTouchEnd = useCallback(() => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current)
      touchTimeoutRef.current = null
    }
    // 清理位置记录
    touchStartPositionRef.current = null
  }, [])

  const handleTouchMove = useCallback(() => {
    // 如果有移动，取消长按
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current)
      touchTimeoutRef.current = null
    }
  }, [])

  // 图片加载错误处理
  const handleImageError = useCallback(() => {
    console.log('图片加载失败，清理无效的图片URL')
    setCurrentImage(null)
  }, [setCurrentImage])

  // 打开跟读模态框
  const openSpeechModal = (type: 'standard' | 'native') => {
    const content =
      type === 'standard'
        ? currentStory?.standardStory
        : currentStory?.nativeStory
    if (content) {
      setSpeechContent(content)
      setSpeechContentType(type)
      setShowSpeechModal(true)
      setSpeechScore(null) // 重置评分
    }
  }

  // 浮动菜单操作处理
  const handleFloatMenuTranslate = () => {
    if (floatMenuConfig.type === 'standard') {
      setShowStandardTranslation(true)
    } else {
      setShowNativeTranslation(true)
    }
    setFloatMenuConfig({ ...floatMenuConfig, isOpened: false })
  }

  const handleFloatMenuCopy = () => {
    const text =
      floatMenuConfig.type === 'standard'
        ? currentStory?.standardStory
        : currentStory?.nativeStory
    if (text) {
      copyText(text)
    }
    setFloatMenuConfig({ ...floatMenuConfig, isOpened: false })
  }

  // 关闭浮动菜单
  const handleFloatMenuClose = () => {
    setFloatMenuConfig({ isOpened: false, type: null, position: undefined })
  }

  // 跟读模态框组件
  const SpeechPracticeModal: React.FC = () => {
    // 录音相关 - 必须在顶层调用Hook
    const {
      isRecording: modalRecording,
      startRecording: modalStartRecording,
      stopRecording: modalStopRecording,
      formattedDuration: modalFormattedDuration,
    } = useAudioRecording({
      maxDuration: 60000,
      format: 'mp3',
      sampleRate: 16000,
      onStop: async result => {
        console.log('模态框录音结束', result)
        // 调用评分接口
        try {
          const scoreResult = await speechScoreApi.mutateAsync({
            audioBase64: result.base64 || result.tempFilePath,
            sentenceId: `modal-${speechContentType}`,
            expectedText: speechContent,
          })
          if (scoreResult.score) {
            setSpeechScore(scoreResult.score)
            // 更新 store 中的故事评分和状态，同时同步更新历史数据缓存
            updateStoryScoreWithCache(scoreResult.score, speechContentType)
          }
        } catch (error) {
          console.error('评分失败:', error)
          Taro.showToast({
            title: '评分失败，请重试',
            icon: 'error',
          })
        }
      },
      onError: error => {
        console.error('模态框录音错误:', error)
        Taro.showToast({
          title: '录音失败，请重试',
          icon: 'error',
        })
      },
    })

    if (!showSpeechModal) return null

    const handleModalRecordToggle = async () => {
      if (modalRecording) {
        await modalStopRecording()
      } else {
        setSpeechScore(null) // 开始新录音时清除之前的评分
        await modalStartRecording()
      }
    }

    const handleClose = () => {
      setShowSpeechModal(false)
      setSpeechScore(null)
      if (modalRecording) {
        modalStopRecording()
      }
    }

    return (
      <View className="speech-practice-modal">
        <View className="modal-overlay" onClick={handleClose} />
        <View className="modal-content">
          <View className="modal-header">
            <Text className="modal-title">跟读练习</Text>
            <View className="close-button" onClick={handleClose}>
              <AtIcon value="close" size="24" color="#666" />
            </View>
          </View>

          <View className="modal-body">
            {/* 短文内容展示 */}
            <View className="content-section">
              <Text className="content-label">
                {speechContentType === 'standard' ? '标准短文' : '地道短文'}
              </Text>
              <ScrollView className="content-scroll" scrollY>
                <Text className="content-text">{speechContent}</Text>
              </ScrollView>
            </View>

            {/* 控制按钮区 */}
            <View className="control-section">
              {/* 播放按钮 */}
              <View className="play-section">
                <View
                  className={`play-btn ${playingAudio === `modal-${speechContentType}` ? 'playing' : ''}`}
                  onClick={() =>
                    playAudio(speechContent, `modal-${speechContentType}`)
                  }
                >
                  <AtIcon
                    value="volume-plus"
                    size="20"
                    color={
                      playingAudio === `modal-${speechContentType}`
                        ? '#fff'
                        : '#2196F3'
                    }
                  />
                </View>
                <Text className="play-label">播放原音</Text>
              </View>

              {/* 录音按钮 */}
              <View className="record-section">
                <View
                  className={`record-btn ${modalRecording ? 'recording' : ''}`}
                  onClick={handleModalRecordToggle}
                >
                  <AtIcon
                    value={modalRecording ? 'stop' : 'volume-plus'}
                    size="20"
                    color="#ffffff"
                  />
                </View>
                <Text className="record-label">
                  {modalRecording ? modalFormattedDuration : '读一遍'}
                </Text>
              </View>
            </View>

            {/* 发音评分展示区域 - 参照话题聊天样式 */}
            {_speechScore && (
              <View className="speech-score-section">
                <View className="score-header">
                  <AtIcon value="star-2" size="16" color="#FCD34D" />
                  <Text className="score-title">发音评分</Text>
                </View>

                <View className="score-display">
                  <View className="score-item accuracy">
                    <Text className="score-label">识别准确度: </Text>
                    <Text className="score-value green">
                      {_speechScore.accuracy || 0}%
                    </Text>
                  </View>

                  <View className="score-item rating">
                    <AtIcon value="star-2" size="12" color="#FCD34D" />
                    <Text className="score-label">发音评分: </Text>
                    <Text className="score-value orange">
                      {_speechScore.overall || 0}分
                    </Text>
                  </View>
                </View>

                {/* 详细评分展示 */}
                <View className="score-breakdown">
                  <View className="score-item">
                    <Text className="label">发音准确度</Text>
                    <View className="progress-container">
                      <View
                        className="progress-bar pronunciation"
                        style={{ width: `${_speechScore.accuracy || 0}%` }}
                      />
                    </View>
                    <Text className="value">{_speechScore.accuracy || 0}%</Text>
                  </View>

                  <View className="score-item">
                    <Text className="label">语音流畅度</Text>
                    <View className="progress-container">
                      <View
                        className="progress-bar fluency"
                        style={{ width: `${_speechScore.fluency || 0}%` }}
                      />
                    </View>
                    <Text className="value">{_speechScore.fluency || 0}%</Text>
                  </View>

                  <View className="score-item">
                    <Text className="label">语速控制</Text>
                    <View className="progress-container">
                      <View
                        className="progress-bar speed"
                        style={{ width: `${_speechScore.speed || 0}%` }}
                      />
                    </View>
                    <Text className="value">{_speechScore.speed || 0}%</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className="photo-story-page">
      {/* 导航栏 */}
      <CustomNavBar
        title="拍照短文"
        backgroundColor="#f97316"
        renderRight={
          <View className="history-btn" onClick={navigateToHistory}>
            <AtIcon value="clock" size="20" color="#ffffff" />
          </View>
        }
      />

      <ScrollView className="page-content" scrollY>
        {/* 拍照模块 */}
        <View className="photo-section">
          {currentImage ? (
            <View className="photo-preview">
              <View className="image-container">
                <Image
                  src={currentImage}
                  mode="aspectFit"
                  className="preview-image"
                  onError={handleImageError}
                />
                <View className="image-actions-overlay">
                  <View
                    className="action-btn clear-btn"
                    onClick={() => {
                      Taro.showModal({
                        title: '确认清除',
                        content: '清除图片将删除所有相关内容，确认继续？',
                        success: res => {
                          if (res.confirm) {
                            clearAll()
                          }
                        },
                      })
                    }}
                  >
                    <AtIcon value="close" size="14" color="#999" />
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View className="photo-upload" onClick={showImageActionSheet}>
              <View className="upload-placeholder">
                <AtIcon value="camera" size="48" color="#9ca3af" />
                <Text className="upload-text">点击拍照或从相册选择图片</Text>
                <Text className="upload-hint">轻触此区域开始拍照</Text>
              </View>
            </View>
          )}
        </View>

        {/* 生成的短文内容 */}
        {currentStory && (
          <>
            {/* 标准短文卡片 */}
            <View className="story-card">
              <View className="card-header">
                <View className="card-title">
                  <View className="title-icon book-icon">
                    <AtIcon value="bookmark" size="16" color="#2196F3" />
                  </View>
                  <Text className="title-text">标准短文</Text>
                  <Text className="tag tag-written">书面语</Text>
                </View>
              </View>
              <View className="card-content">
                <View className="story-title">
                  <Text className="title-en">{currentStory.title}</Text>
                  <Text className="title-cn">{currentStory.titleCn}</Text>
                </View>
                <View className="story-section">
                  <View
                    className="story-text-container"
                    onLongPress={e => handleLongPress('standard', e)}
                    onTouchStart={e => handleTouchStart('standard', e)}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchMove}
                  >
                    <Text className="story-text">
                      {currentStory.standardStory}
                    </Text>
                  </View>

                  {/* 播放和跟读按钮移到短文内容下方 */}
                  <View className="story-actions">
                    <View
                      className={`story-action-button play-button ${playingAudio === 'standard-audio' ? 'playing' : ''}`}
                      onClick={() =>
                        playAudio(currentStory.standardStory, 'standard')
                      }
                    >
                      <AtIcon
                        value="sound"
                        size="16"
                        color={
                          playingAudio === 'standard-audio' ? '#fff' : '#2196F3'
                        }
                      />
                      <Text className="action-text">播放</Text>
                    </View>
                    <View
                      className="story-action-button speech-button"
                      onClick={() => openSpeechModal('standard')}
                    >
                      <AtIcon value="volume-plus" size="16" color="#fff" />
                      <Text className="action-text">跟读</Text>
                    </View>
                  </View>
                </View>
                {/* 条件渲染翻译内容 */}
                {showStandardTranslation && (
                  <View className="translation-section">
                    <Text className="translation-text">
                      {currentStory.standardStoryCn}
                    </Text>
                  </View>
                )}
              </View>
              <View className="card-footer">
                {/* 标准短文发音分显示区域 */}
                {currentStory?.standardScore && (
                  <View className="score-display-inline">
                    <View className="score-item">
                      <AtIcon value="star-2" size="12" color="#FCD34D" />
                      <Text className="score-text">
                        发音分: {currentStory.standardScore.overall}分
                      </Text>
                    </View>
                  </View>
                )}
                <View
                  className="footer-action favorite-action"
                  onClick={() => handleToggleFavorite()}
                >
                  <AtIcon
                    value={currentStory.isFavorite ? 'star-2' : 'star'}
                    size="18"
                    color={currentStory.isFavorite ? '#FFD700' : '#cccccc'}
                  />
                </View>
              </View>
            </View>

            {/* 地道短文卡片 */}
            <View className="story-card native-card">
              <View className="card-header">
                <View className="card-title">
                  <View className="title-icon chat-icon">
                    <AtIcon value="message" size="16" color="#4CAF50" />
                  </View>
                  <Text className="title-text">地道短文</Text>
                  <Text className="tag tag-recommended">推荐</Text>
                </View>
              </View>
              <View className="card-content">
                <View className="story-title">
                  <Text className="title-en">{currentStory.title}</Text>
                  <Text className="title-cn">{currentStory.titleCn}</Text>
                </View>
                <View className="story-section">
                  <View
                    className="story-text-container"
                    onLongPress={e => handleLongPress('native', e)}
                    onTouchStart={e => handleTouchStart('native', e)}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchMove}
                  >
                    <Text className="story-text">
                      {currentStory.nativeStory}
                    </Text>
                  </View>

                  {/* 播放和跟读按钮移到短文内容下方 */}
                  <View className="story-actions">
                    <View
                      className={`story-action-button play-button native-play ${playingAudio === 'native-audio' ? 'playing' : ''}`}
                      onClick={() =>
                        playAudio(currentStory.nativeStory, 'native')
                      }
                    >
                      <AtIcon
                        value="sound"
                        size="16"
                        color={
                          playingAudio === 'native-audio' ? '#fff' : '#4CAF50'
                        }
                      />
                      <Text className="action-text">播放</Text>
                    </View>
                    <View
                      className="story-action-button speech-button"
                      onClick={() => openSpeechModal('native')}
                    >
                      <AtIcon value="volume-plus" size="16" color="#fff" />
                      <Text className="action-text">跟读</Text>
                    </View>
                  </View>
                </View>
                {/* 条件渲染翻译内容 */}
                {showNativeTranslation && (
                  <View className="translation-section">
                    <Text className="translation-text">
                      {currentStory.nativeStoryCn}
                    </Text>
                  </View>
                )}
              </View>
              <View className="card-footer">
                {/* 地道短文发音分显示区域 */}
                {currentStory?.nativeScore && (
                  <View className="score-display-inline">
                    <View className="score-item">
                      <AtIcon value="star-2" size="12" color="#FCD34D" />
                      <Text className="score-text">
                        发音分: {currentStory.nativeScore.overall}分
                      </Text>
                    </View>
                  </View>
                )}
                <View
                  className="footer-action favorite-action"
                  onClick={() => handleToggleFavorite()}
                >
                  <AtIcon
                    value={currentStory.isFavorite ? 'star-2' : 'star'}
                    size="18"
                    color={currentStory.isFavorite ? '#FFD700' : '#cccccc'}
                  />
                </View>
              </View>
            </View>
          </>
        )}

        {/* 加载中状态 */}
        {isGenerating && (
          <View className="loading-overlay">
            <View className="loading-content">
              <AtIcon value="loading-3" size="32" color="#4a90e2" />
              <Text className="loading-text">正在生成短文...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 现代化气泡菜单 */}
      <ModernBubbleMenu
        visible={floatMenuConfig.isOpened}
        position={floatMenuConfig.position}
        onClose={handleFloatMenuClose}
        onTranslate={handleFloatMenuTranslate}
        onCopy={handleFloatMenuCopy}
      />

      {/* 跟读模态框 */}
      <SpeechPracticeModal />
    </View>
  )
}

export default PhotoStoryPage

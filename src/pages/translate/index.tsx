import { useState, useRef, useCallback, useEffect } from 'react'
import { View, Text, Textarea, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import { useQueryClient } from '@tanstack/react-query'
import CustomNavBar from '../../components/common/CustomNavBar'
import CopyIcon from '../../components/common/CopyIcon'
import { useUserStore } from '../../stores/user'
import { translateApi } from '../../services/api'
import {
  TRANSLATE_HISTORY_KEYS,
  useToggleFavorite,
} from '@/hooks/useTranslateHistory'
import type { TranslationResult } from '@/types'
import './index.scss'

const TranslatePage = () => {
  const { updateDailyUsage, checkUsage } = useUserStore()
  const queryClient = useQueryClient()

  // 状态管理
  const [inputText, setInputText] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState<'zh' | 'en'>('zh')
  const [isRecording, setIsRecording] = useState(false)
  const [translationResult, setTranslationResult] =
    useState<TranslationResult | null>(null)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const audioContextRef = useRef<Taro.InnerAudioContext | null>(null)

  // 使用收藏Hook
  const toggleFavoriteMutation = useToggleFavorite()

  const recordingTimer = useRef<NodeJS.Timeout | null>(null)

  // 组件卸载时清理音频上下文
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.stop()
        audioContextRef.current.destroy()
        audioContextRef.current = null
      }
      if (recordingTimer.current) {
        clearTimeout(recordingTimer.current)
        recordingTimer.current = null
      }
    }
  }, [])

  // 切换语言
  const toggleLanguage = () => {
    setSourceLanguage(sourceLanguage === 'zh' ? 'en' : 'zh')
    setInputText('')
    setTranslationResult(null)
    setIsFavorited(false)
  }

  // 清空输入内容
  const clearInput = () => {
    setInputText('')
    setTranslationResult(null)
    setIsFavorited(false)
  }

  // 翻译功能 - 调用API
  const handleTranslate = useCallback(async () => {
    // 检查输入
    if (!inputText.trim()) {
      Taro.showToast({
        title: '请输入要翻译的内容',
        icon: 'none',
      })
      return
    }

    // 检查使用限制
    const usage = checkUsage('translate')
    if (!usage.canUse) {
      Taro.showModal({
        title: '使用次数已用完',
        content: '今日翻译功能使用次数已用完，开通会员可无限使用',
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

    updateDailyUsage('translate')

    try {
      const response = await translateApi.translate(
        inputText,
        sourceLanguage,
        sourceLanguage === 'zh' ? 'en' : 'zh'
      )

      if (response.code === 200 && response.data) {
        setTranslationResult(response.data)
        // 重置收藏状态为false（新的翻译结果默认未收藏）
        setIsFavorited(false)

        // 使翻译历史缓存失效，触发重新获取
        queryClient.invalidateQueries({
          queryKey: TRANSLATE_HISTORY_KEYS.lists(),
        })
      } else {
        throw new Error(response.message || '翻译失败')
      }
    } catch (error) {
      console.error('翻译失败:', error)
      Taro.showToast({
        title: '翻译失败，请重试',
        icon: 'error',
      })
    }
  }, [inputText, sourceLanguage, updateDailyUsage, checkUsage, queryClient])

  // 语音输入
  const handleVoiceInput = async () => {
    if (isRecording) {
      stopVoiceInput()
      return
    }

    try {
      // 检查录音权限
      const { authSetting } = await Taro.getSetting()

      if (!authSetting['scope.record']) {
        await Taro.authorize({ scope: 'scope.record' })
      }

      setIsRecording(true)

      Taro.startRecord({
        success: res => {
          console.log('开始录音', res)
        },
        fail: err => {
          console.error('录音失败', err)
          setIsRecording(false)
          Taro.showToast({
            title: '录音失败',
            icon: 'error',
          })
        },
      })

      // 最多录音30秒
      recordingTimer.current = setTimeout(() => {
        stopVoiceInput()
      }, 30000)
    } catch (error) {
      console.error('语音输入错误:', error)
      Taro.showModal({
        title: '需要录音权限',
        content: '请在设置中开启录音权限',
        showCancel: false,
      })
    }
  }

  // 停止语音输入
  const stopVoiceInput = () => {
    if (!isRecording) return

    if (recordingTimer.current) {
      clearTimeout(recordingTimer.current)
      recordingTimer.current = null
    }

    setIsRecording(false)

    Taro.stopRecord({
      success: res => {
        console.log(
          '录音结束',
          (res as unknown as { tempFilePath: string }).tempFilePath
        )

        // 模拟语音识别结果
        const recognizedText =
          sourceLanguage === 'zh'
            ? '这是语音识别的结果'
            : 'This is the voice recognition result'

        setInputText(recognizedText)

        Taro.showToast({
          title: '语音识别完成',
          icon: 'success',
        })
      },
      fail: err => {
        console.error('停止录音失败', err)
        Taro.showToast({
          title: '录音失败',
          icon: 'error',
        })
      },
    })
  }

  // 拍照识别功能
  const handlePhotoRecognition = async () => {
    try {
      const { tempFilePaths } = await Taro.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
      })

      if (tempFilePaths && tempFilePaths.length > 0) {
        Taro.showLoading({ title: '识别中...' })

        // 模拟OCR识别
        await new Promise(resolve => setTimeout(resolve, 2000))

        // 模拟识别结果
        const recognizedText =
          sourceLanguage === 'zh'
            ? '我想去咖啡店买一杯拿铁，但不知道怎么用英语点单。'
            : "I want to order a coffee but I'm not sure how to say it in Chinese."

        setInputText(recognizedText)

        Taro.hideLoading()
        Taro.showToast({
          title: '识别成功',
          icon: 'success',
        })
      }
    } catch (error) {
      console.error('拍照识别失败:', error)
      Taro.showToast({
        title: '识别失败，请重试',
        icon: 'error',
      })
    }
  }

  // 复制文本
  const copyText = (text: string) => {
    Taro.setClipboardData({
      data: text,
      success: () => {
        Taro.showToast({
          title: '已复制',
          icon: 'success',
          duration: 1500,
        })
      },
    })
  }

  // 播放音频
  const playAudio = (text: string, type: string) => {
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
        })
      } catch (error) {
        console.error('停止播放失败:', error)
        setPlayingAudio(null)
      }
    } else {
      // 先停止当前播放的音频
      if (audioContextRef.current) {
        audioContextRef.current.stop()
        audioContextRef.current.destroy()
        audioContextRef.current = null
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
          audioContextRef.current = null
        })

        // 监听播放错误事件
        audioContext.onError(error => {
          console.error('音频播放错误:', error)
          setPlayingAudio(null)
          audioContextRef.current = null
          Taro.showToast({
            title: '播放失败',
            icon: 'error',
          })
        })

        // 模拟播放完成（实际应该调用audioContext.play()）
        setTimeout(() => {
          if (audioContextRef.current) {
            setPlayingAudio(null)
            audioContextRef.current.destroy()
            audioContextRef.current = null
          }
        }, 3000)

        Taro.showToast({
          title: '播放中',
          icon: 'success',
        })
      } catch (error) {
        console.error('播放失败:', error)
        setPlayingAudio(null)
        audioContextRef.current = null
        Taro.showToast({
          title: '播放失败',
          icon: 'error',
        })
      }
    }
  }

  // 切换收藏状态
  const handleToggleFavorite = useCallback(async () => {
    if (!translationResult?.id) {
      Taro.showToast({
        title: '翻译结果无效',
        icon: 'none',
      })
      return
    }

    const newFavoriteStatus = !isFavorited
    try {
      setIsFavorited(newFavoriteStatus) // 乐观更新UI

      await toggleFavoriteMutation.mutateAsync({
        id: translationResult.id,
        isFavorited: newFavoriteStatus,
      })
    } catch (error) {
      // 失败时回滚状态
      setIsFavorited(!newFavoriteStatus)
      console.error('切换收藏状态失败:', error)
    }
  }, [translationResult?.id, isFavorited, toggleFavoriteMutation])

  return (
    <View className="translate-page">
      {/* 导航栏 */}
      <CustomNavBar
        title="翻译功能"
        backgroundColor="#8B5CF6"
        renderRight={
          <View
            className="nav-right-btn"
            onClick={() =>
              Taro.navigateTo({ url: '/pages/translate-history/index' })
            }
          >
            <AtIcon value="clock" size="20" color="#fff" />
          </View>
        }
      />

      <ScrollView className="page-content" scrollY>
        {/* 语言选择器 */}
        <View className="language-selector-card">
          <View className="language-selector">
            <View className="language-pair">
              <Text className="language-item">
                {sourceLanguage === 'zh' ? '中文' : 'English'}
              </Text>
              <AtIcon value="arrow-right" size="14" color="#8B5CF6" />
              <Text className="language-item">
                {sourceLanguage === 'zh' ? 'English' : '中文'}
              </Text>
            </View>
            <View className="swap-button" onClick={toggleLanguage}>
              <AtIcon value="reload" size="16" color="#8B5CF6" />
            </View>
          </View>
        </View>

        {/* 翻译输入模块 */}
        <View className="translate-input-card">
          {!inputText && (
            <View className="input-placeholder">
              <Text>
                {sourceLanguage === 'zh'
                  ? '请输入要翻译的中文内容...'
                  : 'Please enter English text to translate...'}
              </Text>
            </View>
          )}
          <Textarea
            className="text-input"
            value={inputText}
            onInput={(e: { detail: { value: string } }) => {
              setInputText(e.detail.value)
              // 如果按下了回车键，在下一个tick触发翻译
              if (e.detail.value.includes('\n')) {
                const cleanText = e.detail.value.replace(/\n/g, '')
                setInputText(cleanText)
                if (cleanText.trim()) {
                  setTimeout(() => handleTranslate(), 0)
                }
              }
            }}
            placeholder=""
            maxlength={1000}
            autoHeight
            showConfirmBar={false}
          />
          {inputText && (
            <View className="clear-button" onClick={clearInput}>
              <AtIcon value="close" size="14" color="#999" />
            </View>
          )}
        </View>

        {/* 操作按钮 */}
        <View className="action-buttons">
          <View
            className={`action-btn ${isRecording ? 'recording' : ''}`}
            onClick={handleVoiceInput}
          >
            <AtIcon
              value={isRecording ? 'stop-circle' : 'volume-plus'}
              size="18"
              color={isRecording ? '#ff4757' : '#666'}
            />
            <Text>{isRecording ? '停止录音' : '语音输入'}</Text>
          </View>
          <View className="action-btn" onClick={handlePhotoRecognition}>
            <AtIcon value="image" size="18" color="#666" />
            <Text>拍照识别</Text>
          </View>
        </View>

        {/* 翻译结果展示 */}
        {translationResult && (
          <>
            {/* 标准翻译卡片 */}
            <View className="result-card">
              <View className="card-header">
                <View className="card-title">
                  <View className="title-icon book-icon">
                    <AtIcon value="bookmark" size="16" color="#2196F3" />
                  </View>
                  <Text className="title-text">标准翻译</Text>
                  <Text className="tag tag-written">书面语</Text>
                </View>
              </View>
              <View className="card-content">
                <View className="translation-section">
                  <Text className="translation-text">
                    {translationResult.standardTranslation}
                  </Text>
                </View>
                <View className="play-button-row">
                  <View
                    className={`play-button ${playingAudio === 'standard' ? 'playing' : ''}`}
                    onClick={() =>
                      playAudio(
                        translationResult.standardTranslation,
                        'standard'
                      )
                    }
                  >
                    <AtIcon
                      value="volume-plus"
                      size="20"
                      color={playingAudio === 'standard' ? '#fff' : '#2196F3'}
                    />
                  </View>
                </View>
              </View>
              <View className="card-footer">
                <View
                  className="copy-button"
                  onClick={() =>
                    copyText(translationResult.standardTranslation)
                  }
                >
                  <CopyIcon size={16} color="#666" />
                </View>
                <View
                  className="footer-action favorite-action"
                  onClick={handleToggleFavorite}
                >
                  <AtIcon
                    value={isFavorited ? 'star-2' : 'star'}
                    size="18"
                    color={isFavorited ? '#FFD700' : '#cccccc'}
                  />
                </View>
              </View>
            </View>

            {/* 地道口语卡片 */}
            <View className="result-card colloquial-card">
              <View className="card-header">
                <View className="card-title">
                  <View className="title-icon chat-icon">
                    <AtIcon value="message" size="16" color="#4CAF50" />
                  </View>
                  <Text className="title-text">地道口语</Text>
                  <Text className="tag tag-recommended">推荐</Text>
                </View>
              </View>

              {/* 翻译内容区域 */}
              <View className="card-content">
                <View className="translation-section">
                  <Text className="translation-text">
                    {translationResult.colloquialTranslation}
                  </Text>
                </View>

                {/* 对比说明区域 */}
                {translationResult.comparisonNotes &&
                  translationResult.comparisonNotes.length > 0 && (
                    <View className="comparison-section">
                      <Text className="comparison-title">更自然的表达：</Text>
                      {translationResult.comparisonNotes.map(note => (
                        <View key={note.id} className="comparison-item">
                          <Text className="comparison-text">
                            • &ldquo;{note.colloquial}&rdquo; 比 &ldquo;
                            {note.standard}&rdquo;{' '}
                            {note.explanation.split('比')[1]}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                <View className="play-button-row">
                  <View
                    className={`play-button ${playingAudio === 'colloquial' ? 'playing' : ''}`}
                    onClick={() =>
                      playAudio(
                        translationResult.colloquialTranslation,
                        'colloquial'
                      )
                    }
                  >
                    <AtIcon
                      value="volume-plus"
                      size="20"
                      color={playingAudio === 'colloquial' ? '#fff' : '#4CAF50'}
                    />
                  </View>
                </View>
              </View>

              <View className="card-footer">
                <View
                  className="copy-button"
                  onClick={() =>
                    copyText(translationResult.colloquialTranslation)
                  }
                >
                  <CopyIcon size={16} color="#666" />
                </View>
                <View
                  className="footer-action favorite-action"
                  onClick={handleToggleFavorite}
                >
                  <AtIcon
                    value={isFavorited ? 'star-2' : 'star'}
                    size="18"
                    color={isFavorited ? '#FFD700' : '#cccccc'}
                  />
                </View>
              </View>
            </View>

            {/* 相关实用短语 */}
            {translationResult.relatedPhrases &&
              translationResult.relatedPhrases.length > 0 && (
                <View className="phrases-card">
                  <View className="card-header">
                    <View className="card-title">
                      <View className="title-icon">
                        <Text className="emoji-icon">💡</Text>
                      </View>
                      <Text className="title-text">相关实用短语</Text>
                    </View>
                  </View>
                  <View className="phrases-list">
                    {translationResult.relatedPhrases.map(phrase => (
                      <View key={phrase.id} className="phrase-item">
                        <View className="phrase-content">
                          <Text className="phrase-english">
                            {phrase.english}
                          </Text>
                          <Text className="phrase-chinese">
                            {phrase.chinese}
                            {phrase.pinyin && (
                              <Text className="phrase-pinyin">
                                {' '}
                                ({phrase.pinyin})
                              </Text>
                            )}
                          </Text>
                        </View>
                        <View
                          className={`phrase-action ${playingAudio === `phrase-${phrase.id}` ? 'playing' : ''}`}
                          onClick={() =>
                            playAudio(phrase.english, `phrase-${phrase.id}`)
                          }
                        >
                          <AtIcon
                            value={
                              playingAudio === `phrase-${phrase.id}`
                                ? 'pause'
                                : 'play'
                            }
                            size="20"
                            color="#8B5CF6"
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
          </>
        )}
      </ScrollView>
    </View>
  )
}

export default TranslatePage

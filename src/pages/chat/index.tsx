import { useState, useEffect, useRef } from 'react'
import Taro, { useDidHide } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import { useChatStore } from '@/stores'
import {
  generateId,
  formatDuration,
  safeAsync,
  safeEventHandler,
} from '@/utils'
import { formatRelativeTime } from '@/utils/format'
import type { ChatMessage } from '@/types'
import { withPageErrorBoundary } from '@/components/ErrorBoundary/PageErrorBoundary'
import { CustomNavBar } from '@/components/common'
import './index.scss'

const Chat = () => {
  const { messages, isRecording, addMessage, setRecording, setPlaying } =
    useChatStore()

  const [recordDuration, setRecordDuration] = useState(0)
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null)
  const [showMoreOptions, setShowMoreOptions] = useState(false)

  const scrollViewRef = useRef<{
    scrollIntoView: (id: string) => void
    scrollToLower?: () => void
  }>(null)
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null)
  const recorderManagerRef = useRef<Taro.RecorderManager | null>(null)
  const innerAudioContextRef = useRef<Taro.InnerAudioContext | null>(null)

  // 页面隐藏时清理资源
  useDidHide(() => {
    // 停止录音
    if (isRecording) {
      handleRecordEnd()
    }

    // 停止播放
    if (currentPlayingId) {
      innerAudioContextRef.current?.stop()
    }

    // 清理定时器
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current)
      recordTimerRef.current = null
    }
  })

  useEffect(() => {
    // 检查当前运行环境是否支持录音功能
    const env = Taro.getEnv()

    // 初始化录音管理器（仅在支持的环境中）
    if (env !== Taro.ENV_TYPE.WEB) {
      try {
        const recorderManager = Taro.getRecorderManager()
        if (recorderManager && typeof recorderManager.onStart === 'function') {
          recorderManagerRef.current = recorderManager

          recorderManager.onStart(() => {
            // 开始录音
            setRecording(true)
            startRecordTimer()
          })

          recorderManager.onStop(res => {
            // 停止录音
            setRecording(false)
            stopRecordTimer()
            handleRecordComplete(res.tempFilePath, res.duration / 1000)
          })

          recorderManager.onError(() => {
            // 录音错误处理
            setRecording(false)
            stopRecordTimer()
            Taro.showToast({ title: '录音失败', icon: 'none' })
          })
        }
      } catch (error) {
        console.warn('录音管理器初始化失败:', error)
      }
    }

    // 初始化音频播放器
    const innerAudioContext = Taro.createInnerAudioContext()
    innerAudioContextRef.current = innerAudioContext

    if (innerAudioContext && typeof innerAudioContext.onPlay === 'function') {
      innerAudioContext.onPlay(() => {
        setPlaying(true)
      })

      innerAudioContext.onStop(() => {
        setPlaying(false)
        setCurrentPlayingId(null)
      })

      innerAudioContext.onEnded(() => {
        setPlaying(false)
        setCurrentPlayingId(null)
      })

      innerAudioContext.onError(() => {
        setPlaying(false)
        setCurrentPlayingId(null)
        Taro.showToast({ title: '播放失败', icon: 'none' })
      })
    }

    return () => {
      // 清理录音管理器
      if (
        recorderManagerRef.current &&
        typeof recorderManagerRef.current.onStart === 'function'
      ) {
        try {
          recorderManagerRef.current.onStart(() => {})
          recorderManagerRef.current.onStop(() => {})
          recorderManagerRef.current.onError(() => {})
        } catch (error) {
          console.warn('清理录音管理器失败:', error)
        }
      }

      // 清理音频播放器
      if (
        innerAudioContext &&
        typeof innerAudioContext.destroy === 'function'
      ) {
        innerAudioContext.destroy()
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleRecordStart = safeEventHandler(() => {
    const env = Taro.getEnv()

    // 在H5环境中使用mock数据进行模拟（仅开发环境）
    if (env === Taro.ENV_TYPE.WEB) {
      if (process.env.NODE_ENV === 'development') {
        // 开发环境使用mock数据
        setRecording(true)
        startRecordTimer()

        // 模拟录音过程
        setTimeout(
          () => {
            setRecording(false)
            stopRecordTimer()

            // 生成mock语音数据
            const mockDuration = Math.floor(Math.random() * 5) + 2 // 2-6秒随机时长
            handleRecordComplete('mock-voice-url', mockDuration)
          },
          Math.floor(Math.random() * 3000) + 1000
        ) // 1-4秒随机录音时长

        return
      } else {
        Taro.showModal({
          title: '提示',
          content: 'H5环境暂不支持录音功能，请在小程序或APP中使用语音对话',
          showCancel: false,
        })
        return
      }
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
          content: '需要获取麦克风权限才能进行语音对话',
          success: res => {
            if (res.confirm) {
              Taro.openSetting()
            }
          },
        })
      },
    })
  }, 'record-start')

  const handleRecordEnd = safeEventHandler(() => {
    const env = Taro.getEnv()

    // 在H5环境中的处理
    if (env === Taro.ENV_TYPE.WEB) {
      if (process.env.NODE_ENV === 'development' && isRecording) {
        // 开发环境下手动停止录音
        setRecording(false)
        stopRecordTimer()

        // 生成mock语音数据
        const mockDuration = Math.floor(Math.random() * 5) + 2
        handleRecordComplete('mock-voice-url', mockDuration)
      }
      return
    }

    recorderManagerRef.current?.stop()
  }, 'record-end')

  const handleRecordComplete = safeAsync(
    async (filePath: string, duration: number) => {
      // 创建用户消息
      const userMessage: ChatMessage = {
        id: generateId(),
        content: '',
        type: 'voice',
        sender: 'user',
        timestamp: Date.now(),
        voiceUrl: filePath,
        duration,
      }

      addMessage(userMessage)

      // 模拟发送语音到后端并获取AI回复
      Taro.showLoading({ title: '思考中...', mask: true })

      // 模拟AI回复
      setTimeout(() => {
        // 随机选择AI回复内容（开发环境mock数据）
        const mockResponses = [
          { duration: 3, content: 'Hello! How are you today?' },
          { duration: 4, content: "That's great! Tell me more about it." },
          {
            duration: 5,
            content: 'I see. Can you practice saying that again?',
          },
          { duration: 2, content: 'Perfect pronunciation!' },
          {
            duration: 6,
            content:
              "Let's try a different sentence. How about describing your day?",
          },
          { duration: 4, content: 'Excellent! Your English is improving.' },
        ]

        const randomResponse =
          mockResponses[Math.floor(Math.random() * mockResponses.length)]

        const aiMessage: ChatMessage = {
          id: generateId(),
          content:
            process.env.NODE_ENV === 'development'
              ? randomResponse.content
              : '',
          type: 'voice',
          sender: 'ai',
          timestamp: Date.now(),
          voiceUrl: 'mock-ai-voice-url',
          duration: randomResponse.duration,
        }

        addMessage(aiMessage)
        Taro.hideLoading()
        scrollToBottom()
      }, 2000)

      scrollToBottom()
    },
    'api'
  )

  const handlePlayVoice = safeEventHandler((message: ChatMessage) => {
    if (currentPlayingId === message.id) {
      // 停止当前播放
      if (
        Taro.getEnv() === Taro.ENV_TYPE.WEB &&
        process.env.NODE_ENV === 'development'
      ) {
        setCurrentPlayingId(null)
        setPlaying(false)
      } else {
        innerAudioContextRef.current?.stop()
      }
      return
    }

    if (message.voiceUrl) {
      setCurrentPlayingId(message.id)
      setPlaying(true)

      if (
        Taro.getEnv() === Taro.ENV_TYPE.WEB &&
        process.env.NODE_ENV === 'development'
      ) {
        // 开发环境模拟播放
        const duration = (message.duration || 3) * 1000
        setTimeout(() => {
          setCurrentPlayingId(null)
          setPlaying(false)
        }, duration)
      } else {
        // 真实环境播放
        if (innerAudioContextRef.current) {
          innerAudioContextRef.current.src = message.voiceUrl
        }
        innerAudioContextRef.current?.play()
      }
    }
  }, 'play-voice')

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToLower?.()
    }, 100)
  }

  const handleAddFunction = safeEventHandler(() => {
    setShowMoreOptions(!showMoreOptions)
    Taro.showToast({ title: '更多功能开发中', icon: 'none' })
  }, 'add-function')

  const handleEmoji = safeEventHandler(() => {
    Taro.showToast({ title: '表情功能开发中', icon: 'none' })
  }, 'emoji')

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.sender === 'user'
    const isPlaying = currentPlayingId === message.id

    return (
      <View
        key={message.id}
        className={`chat-message ${isUser ? 'user' : 'ai'}`}
      >
        {/* AI头像 */}
        {!isUser && (
          <View className="message-avatar ai-avatar">
            <Text className="avatar-icon">👩</Text>
          </View>
        )}

        {/* 消息内容 */}
        <View className="message-content">
          <View
            className={`message-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}
          >
            {message.type === 'voice' ? (
              <View
                className="voice-message"
                onClick={() => handlePlayVoice(message)}
              >
                {/* 播放按钮 */}
                <View className={`play-button ${isPlaying ? 'playing' : ''}`}>
                  <AtIcon
                    value={isPlaying ? 'pause' : 'play'}
                    size="20"
                    color={isUser ? '#ffffff' : '#7c3aed'}
                  />
                </View>

                {/* 音频波形 */}
                <View className="voice-waves">
                  <View
                    className={`wave wave-1 ${isPlaying ? 'animating' : ''}`}
                  />
                  <View
                    className={`wave wave-2 ${isPlaying ? 'animating' : ''}`}
                  />
                  <View
                    className={`wave wave-3 ${isPlaying ? 'animating' : ''}`}
                  />
                  <View
                    className={`wave wave-4 ${isPlaying ? 'animating' : ''}`}
                  />
                </View>

                {/* 时长 */}
                <Text className="voice-duration">
                  {message.duration ? `${message.duration}"` : ''}
                </Text>
              </View>
            ) : (
              <Text className="text-content">{message.content}</Text>
            )}
          </View>

          {/* 消息时间 */}
          <Text className="message-time">
            {isUser ? formatRelativeTime(message.timestamp) : '刚刚'}
          </Text>
        </View>

        {/* 用户头像 */}
        {isUser && (
          <View className="message-avatar user-avatar">
            <Text className="avatar-icon">😊</Text>
          </View>
        )}
      </View>
    )
  }

  return (
    <View className="chat-container">
      {/* 自定义导航栏 */}
      <View className="custom-chat-header">
        <CustomNavBar title="Emma (AI外教)" backgroundColor="#7c3aed" />
        <View className="online-status-bar">
          <View className="status-dot" />
          <Text className="status-text">在线</Text>
        </View>
      </View>

      {/* 聊天消息区域 */}
      <ScrollView
        ref={scrollViewRef}
        className={`chat-messages-area ${
          messages.length === 0 ? 'is-empty' : ''
        }`}
        scrollY
        scrollIntoView={`msg-${messages[messages.length - 1]?.id}`}
        scrollWithAnimation
      >
        {/* 欢迎消息 */}
        {messages.length === 0 && (
          <View className="welcome-wrapper">
            <View className="welcome-container">
              <View className="welcome-avatar">
                <Text className="welcome-emoji">🤖</Text>
              </View>
              <Text className="welcome-title">开始与AI对话吧！</Text>
              <Text className="welcome-subtitle">
                按住下方按钮说话，我会帮你练习英语口语
              </Text>
            </View>
          </View>
        )}

        {/* 消息列表 */}
        {messages.map(renderMessage)}
        <View id="bottom" style={{ height: '20px' }} />
      </ScrollView>

      {/* 录音状态指示器 */}
      {isRecording && (
        <View className="recording-overlay">
          <View className="recording-modal">
            <View className="recording-icon-container">
              <View className="recording-pulse" />
              <AtIcon value="microphone" size="40" color="#ffffff" />
            </View>
            <Text className="recording-text">
              正在录音 {formatDuration(recordDuration)}
            </Text>
            <Text className="recording-hint">松开发送，上滑取消</Text>
          </View>
        </View>
      )}

      {/* 底部输入栏 */}
      <View className="chat-input-bar">
        {/* 添加功能按钮 */}
        <View className="input-button add-button" onClick={handleAddFunction}>
          <AtIcon value="add" size="24" color="#ffffff" />
        </View>

        {/* 录音按钮 */}
        <View
          className={`record-main-button ${isRecording ? 'recording' : ''}`}
          onTouchStart={handleRecordStart}
          onTouchEnd={handleRecordEnd}
          onTouchCancel={handleRecordEnd}
        >
          <AtIcon value="microphone" size="24" color="#ffffff" />
          {!isRecording && <Text className="record-text">按住说话</Text>}
        </View>

        {/* 表情按钮 */}
        <View className="input-button emoji-button" onClick={handleEmoji}>
          <Text className="emoji-icon">😊</Text>
        </View>
      </View>
    </View>
  )
}

export default withPageErrorBoundary(Chat, {
  pageName: 'AI对话',
  enableErrorReporting: true,
  showRetry: true,
  onError: (error, errorInfo) => {
    console.log('AI对话页面发生错误:', error, errorInfo)
  },
})

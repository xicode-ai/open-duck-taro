import { useState, useEffect, useRef } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { AtIcon, AtActionSheet, AtActionSheetItem } from 'taro-ui'
import { useChatStore } from '@/stores'
import { generateId, formatDuration } from '@/utils'
import type { ChatMessage } from '@/types'
import ErrorBoundary from '@/components/ErrorBoundary'
import './index.scss'

const Chat = () => {
  const { messages, isRecording, addMessage, setRecording, setPlaying, updateMessage } =
    useChatStore()

  const [longPressMessage, setLongPressMessage] = useState<ChatMessage | null>(null)
  const [actionSheetOpen, setActionSheetOpen] = useState(false)
  const [recordDuration, setRecordDuration] = useState(0)
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null)

  const scrollViewRef = useRef<{
    scrollIntoView: (id: string) => void
    scrollToLower?: () => void
  }>(null)
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null)
  const recorderManagerRef = useRef<Taro.RecorderManager | null>(null)
  const innerAudioContextRef = useRef<Taro.InnerAudioContext | null>(null)

  useEffect(() => {
    // 初始化录音管理器
    const recorderManager = Taro.getRecorderManager()
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

    // 初始化音频播放器
    const innerAudioContext = Taro.createInnerAudioContext()
    innerAudioContextRef.current = innerAudioContext

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

    return () => {
      recorderManager.onStart(() => {
        // 录音开始回调
      })
      recorderManager.onStop(() => {
        // 录音结束回调
      })
      recorderManager.onError(() => {
        // 录音错误回调
      })
      innerAudioContext.destroy()
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

  const handleRecordStart = () => {
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
  }

  const handleRecordEnd = () => {
    recorderManagerRef.current?.stop()
  }

  const handleRecordComplete = async (filePath: string, duration: number) => {
    // 创建用户消息
    const userMessage: ChatMessage = {
      id: generateId(),
      content: '语音消息',
      type: 'voice',
      sender: 'user',
      timestamp: Date.now(),
      voiceUrl: filePath,
      duration,
    }

    addMessage(userMessage)

    // 模拟发送语音到后端并获取AI回复
    Taro.showLoading({ title: '思考中...', mask: true })

    // 这里应该调用真实的API
    // const aiResponse = await api.post('/chat/voice', { audioFile: filePath })

    // 模拟AI回复
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: generateId(),
        content: 'Hello! How are you today?',
        type: 'voice',
        sender: 'ai',
        timestamp: Date.now(),
        voiceUrl: 'mock-ai-voice-url',
        duration: 3,
      }

      addMessage(aiMessage)
      Taro.hideLoading()
      scrollToBottom()
    }, 2000)

    scrollToBottom()
  }

  const handlePlayVoice = (message: ChatMessage) => {
    if (currentPlayingId === message.id) {
      innerAudioContextRef.current?.stop()
      return
    }

    if (message.voiceUrl) {
      setCurrentPlayingId(message.id)
      if (innerAudioContextRef.current) {
        innerAudioContextRef.current.src = message.voiceUrl
      }
      innerAudioContextRef.current?.play()
    }
  }

  const handleLongPress = (message: ChatMessage) => {
    setLongPressMessage(message)
    setActionSheetOpen(true)
  }

  const handleTranslate = async () => {
    if (!longPressMessage) return

    Taro.showLoading({ title: '翻译中...', mask: true })

    // 这里应该调用真实的翻译API
    // const translation = await api.post('/translate', { text: longPressMessage.content })

    // 模拟翻译结果
    setTimeout(() => {
      const translation =
        longPressMessage.sender === 'ai' ? '你好！你今天好吗？' : 'Hello! How are you today?'

      updateMessage(longPressMessage.id, { translation })
      Taro.hideLoading()
      setActionSheetOpen(false)
    }, 1000)
  }

  const handleGetHelp = async () => {
    if (!longPressMessage) return

    Taro.showLoading({ title: '分析中...', mask: true })

    // 模拟求助结果
    setTimeout(() => {
      const helpMessage: ChatMessage = {
        id: generateId(),
        content: `
原文翻译：Hello! How are you today?
地道表达：Hey there! How's it going?
说明：这是更加自然的日常问候方式
        `,
        type: 'text',
        sender: 'ai',
        timestamp: Date.now(),
      }

      addMessage(helpMessage)
      Taro.hideLoading()
      setActionSheetOpen(false)
      scrollToBottom()
    }, 1500)
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToLower?.()
    }, 100)
  }

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.sender === 'user'
    const isPlaying = currentPlayingId === message.id

    return (
      <View key={message.id} className={`message ${isUser ? 'user' : 'ai'}`}>
        <View className="message-content">
          {message.type === 'voice' ? (
            <View
              className={`voice-message ${isPlaying ? 'playing' : ''}`}
              onClick={() => handlePlayVoice(message)}
              onLongPress={() => handleLongPress(message)}
            >
              <AtIcon value={isPlaying ? 'pause' : 'play'} size="20" color="white" />
              <Text className="duration">{formatDuration(message.duration || 0)}</Text>
            </View>
          ) : (
            <View className="text-message" onLongPress={() => handleLongPress(message)}>
              <Text>{message.content}</Text>
            </View>
          )}

          {message.translation && (
            <View className="translation">
              <Text className="translation-text">{message.translation}</Text>
            </View>
          )}
        </View>
      </View>
    )
  }

  return (
    <ErrorBoundary>
      <View className="chat-page">
        {/* 聊天消息区域 */}
        <ScrollView
          ref={scrollViewRef}
          className="messages-container"
          scrollY
          scrollIntoView="bottom"
          enableBackToTop
        >
          {messages.map(renderMessage)}
          <View id="bottom" />
        </ScrollView>

        {/* 录音状态指示器 */}
        {isRecording && (
          <View className="recording-indicator">
            <View className="recording-animation">
              <View className="recording-dot" />
            </View>
            <Text className="recording-text">正在录音... {formatDuration(recordDuration)}</Text>
            <Text className="recording-tip">松开发送，上滑取消</Text>
          </View>
        )}

        {/* 底部录音按钮 */}
        <View className="bottom-bar">
          <View
            className={`record-button ${isRecording ? 'recording' : ''}`}
            onTouchStart={handleRecordStart}
            onTouchEnd={handleRecordEnd}
            onTouchCancel={handleRecordEnd}
          >
            <AtIcon value="microphone" size="24" color="white" />
            <Text className="record-text">{isRecording ? '松开发送' : '按住说话'}</Text>
          </View>
        </View>

        {/* 长按操作菜单 */}
        <AtActionSheet
          isOpened={actionSheetOpen}
          cancelText="取消"
          onCancel={() => setActionSheetOpen(false)}
          onClose={() => setActionSheetOpen(false)}
        >
          <AtActionSheetItem onClick={handleTranslate}>翻译</AtActionSheetItem>
          {longPressMessage?.sender === 'user' && (
            <AtActionSheetItem onClick={handleGetHelp}>求助</AtActionSheetItem>
          )}
        </AtActionSheet>
      </View>
    </ErrorBoundary>
  )
}

export default Chat

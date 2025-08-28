import { useState, useRef, useEffect } from 'react'
import { View, Text, ScrollView, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import CustomIcon from '../../components/CustomIcon'
import VoiceWaveform from '../../components/VoiceWaveform'
import { useChatStore } from '../../stores/chat'
import { useUserStore } from '../../stores/user'
import { formatRelativeTime } from '../../utils/date'

import {
  mockStartRecording,
  mockStopRecording,
  shouldUseMockAudio,
} from '../../services/mockAudio'
import { chatApi } from '../../services/api'
import './index.scss'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  audioUrl?: string
  duration?: number // 语音时长（秒）
  timestamp: number
  translation?: string
  helpContent?: {
    original: string
    corrected: string
  }
  reaction?: string // emoji反馈
}

interface SpeechToTextResponse {
  text: string
  confidence: number
  language: string
}

interface ChatResponse {
  content: string
  audioUrl?: string
  duration?: number
}

const ChatPage = () => {
  const { messages, isRecording, addMessage, startRecording, stopRecording } =
    useChatStore()
  const { updateDailyUsage } = useUserStore()

  // 本地状态
  const [isTyping, setIsTyping] = useState(false)
  const [showTextInput, setShowTextInput] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const [messageReactions, setMessageReactions] = useState<Map<string, string>>(
    new Map()
  )
  const [aiStatus, setAiStatus] = useState<'online' | 'offline' | 'typing'>(
    'online'
  )

  // 引用
  const scrollViewRef = useRef<{
    scrollToBottom?: (options?: { animated?: boolean }) => void
  } | null>(null)
  const recordingTimer = useRef<NodeJS.Timeout | null>(null)

  // 页面初始化
  useEffect(() => {
    // 添加欢迎消息
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content:
          "Hi! I'm your AI English tutor. Let's practice speaking English together! 🦆",
        timestamp: Date.now(),
        translation: '嗨！我是你的AI英语老师。让我们一起练习说英语吧！🦆',
      }
      addMessage(welcomeMessage)
    }
  }, [messages.length, addMessage])

  // AI状态管理
  useEffect(() => {
    if (isTyping) {
      setAiStatus('typing')
    } else {
      setAiStatus('online')
    }
  }, [isTyping])

  // 滚动到底部
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToBottom?.({ animated: true })
    }, 100)
  }

  // 开始录音
  const handleStartRecording = async () => {
    try {
      // 在开发环境下使用mock录音
      if (shouldUseMockAudio()) {
        console.log('🎤 开发环境：使用Mock录音功能')
        startRecording()
        await mockStartRecording()

        // 设置最大录音时长
        recordingTimer.current = setTimeout(() => {
          handleStopRecording()
        }, 60000) // 最多录音60秒
        return
      }

      // 生产环境使用真实录音
      const { authSetting } = await Taro.getSetting()

      if (!authSetting['scope.record']) {
        try {
          await Taro.authorize({
            scope: 'scope.record',
          })
        } catch (_error) {
          Taro.showModal({
            title: '需要录音权限',
            content: '请在设置中开启录音权限以使用语音对话功能',
            showCancel: false,
          })
          return
        }
      }

      startRecording()

      // 开始录音
      Taro.startRecord({
        success: res => {
          console.log('录音成功', res)
        },
        fail: err => {
          console.error('录音失败', err)
          stopRecording()
          Taro.showToast({
            title: '录音失败，请重试',
            icon: 'error',
          })
        },
      })

      // 设置最大录音时长
      recordingTimer.current = setTimeout(() => {
        handleStopRecording()
      }, 60000) // 最多录音60秒
    } catch (error) {
      console.error('开始录音错误', error)
      Taro.showToast({
        title: '录音失败，请重试',
        icon: 'error',
      })
    }
  }

  // 停止录音
  const handleStopRecording = async () => {
    if (!isRecording) return

    if (recordingTimer.current) {
      clearTimeout(recordingTimer.current)
      recordingTimer.current = null
    }

    stopRecording()

    try {
      // 在开发环境下使用mock录音
      if (shouldUseMockAudio()) {
        console.log('🎤 开发环境：停止Mock录音')
        const mockAudioData = await mockStopRecording()

        try {
          // 创建模拟的FormData
          const formData = new FormData()
          // 在小程序环境中，使用File对象代替Blob
          const mockFile = new File(['mock audio data'], 'mock-recording.wav', {
            type: 'audio/wav',
          })
          formData.append('audio', mockFile)

          // 使用MSW API进行语音转文字
          const speechResult = await chatApi.speechToText(formData)

          // 添加用户消息
          const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: (speechResult.data as SpeechToTextResponse).text,
            audioUrl: mockAudioData.audioUrl,
            duration: mockAudioData.duration,
            timestamp: Date.now(),
          }

          addMessage(userMessage)
          scrollToBottom()

          // AI回复
          handleAIResponse(userMessage.content)
        } catch (error) {
          console.error('Mock语音转文字失败:', error)
          Taro.showToast({
            title: '语音识别失败',
            icon: 'error',
          })
        }
        return
      }

      // 生产环境使用真实录音
      Taro.stopRecord({
        success: res => {
          const audioPath = (res as unknown as { tempFilePath: string })
            .tempFilePath

          // 添加用户消息（模拟语音时长）
          const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: "Hello, I'd like to practice speaking English.", // 模拟语音转文字结果
            audioUrl: audioPath,
            duration: Math.floor(Math.random() * 10 + 3), // 模拟3-13秒的语音
            timestamp: Date.now(),
          }

          addMessage(userMessage)
          scrollToBottom()

          // 模拟AI处理和回复
          handleAIResponse(userMessage.content)
        },
        fail: err => {
          console.error('停止录音失败', err)
          Taro.showToast({
            title: '录音失败，请重试',
            icon: 'error',
          })
        },
      })
    } catch (error) {
      console.error('停止录音错误', error)
    }
  }

  // AI回复处理
  const handleAIResponse = async (userInput: string) => {
    setIsTyping(true)

    try {
      // 使用MSW API发送消息并获取AI回复
      const response = await chatApi.sendMessage({
        sessionId: 'default-session',
        content: userInput,
        type: 'voice',
      })

      const aiResponseData = response.data as ChatResponse

      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: aiResponseData.content,
        audioUrl: aiResponseData.audioUrl,
        duration: aiResponseData.duration || Math.floor(Math.random() * 5 + 3),
        timestamp: Date.now(),
      }

      setIsTyping(false)
      addMessage(aiMessage)
      scrollToBottom()
    } catch (error) {
      console.error('AI回复失败:', error)
      setIsTyping(false)
      Taro.showToast({
        title: 'AI回复失败，请重试',
        icon: 'error',
      })
    }
  }

  // 发送文本消息
  const handleSendText = async () => {
    if (!textInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: textInput.trim(),
      timestamp: Date.now(),
    }

    addMessage(userMessage)
    setTextInput('')
    setShowTextInput(false)
    scrollToBottom()

    // AI回复
    handleAIResponse(userMessage.content)
  }

  // 播放音频
  const handlePlayAudio = (messageId: string, audioUrl?: string) => {
    if (!audioUrl) return

    if (playingAudioId === messageId) {
      // 停止播放
      Taro.stopBackgroundAudio()
      setPlayingAudioId(null)
    } else {
      // 开始播放
      Taro.playBackgroundAudio({
        dataUrl: audioUrl,
        success: () => {
          setPlayingAudioId(messageId)
        },
        fail: err => {
          console.error('播放音频失败', err)
          Taro.showToast({
            title: '播放失败',
            icon: 'error',
          })
        },
      })

      // 模拟播放结束
      setTimeout(() => {
        setPlayingAudioId(null)
      }, 5000)
    }
  }

  // 翻译功能
  const handleTranslate = (messageId: string, content: string) => {
    updateDailyUsage('translate')

    // 模拟翻译结果
    const translations: { [key: string]: string } = {
      "Hi! I'm your AI English tutor. Let's practice speaking English together! 🦆":
        '嗨！我是你的AI英语老师。让我们一起练习说英语吧！🦆',
      "That's great! What topics would you like to discuss today?":
        '太好了！今天你想讨论什么话题呢？',
      'Excellent pronunciation! Your English is improving.':
        '发音很棒！你的英语在进步。',
      'I understand. Could you tell me more about that?':
        '我明白了。你能详细说说吗？',
      'Interesting point! How do you usually practice English?':
        '有趣的观点！你平时是怎么练习英语的？',
      'Good job! Let me help you with a more natural expression.':
        '做得好！让我帮你用更地道的表达方式。',
    }

    const translation = translations[content] || '这是翻译结果示例'

    // 更新消息添加翻译
    const updatedMessages = messages.map(msg =>
      msg.id === messageId ? { ...msg, translation } : msg
    )

    // 这里应该调用store方法更新消息
    console.log('翻译:', translation, updatedMessages)

    Taro.showToast({
      title: '翻译完成',
      icon: 'success',
    })
  }

  // Emoji反馈
  const handleEmojiReaction = (messageId: string, emoji: string) => {
    const newReactions = new Map(messageReactions)

    // 如果已经是同一个emoji，则取消反馈
    if (newReactions.get(messageId) === emoji) {
      newReactions.delete(messageId)
    } else {
      newReactions.set(messageId, emoji)
    }

    setMessageReactions(newReactions)
  }

  // 返回上一页
  const handleBack = () => {
    Taro.navigateBack()
  }

  return (
    <View className="chat-page">
      {/* AI头部信息 */}
      <View className="ai-header">
        <View className="header-content">
          <View className="back-btn" onClick={handleBack}>
            <AtIcon value="chevron-left" size="24" color="#fff" />
          </View>

          <View className="ai-info">
            <View className="ai-avatar">
              <Text className="avatar-emoji">🤖</Text>
            </View>

            <View className="ai-details">
              <Text className="ai-name">Emma (AI外教)</Text>
              <View className="ai-status">
                <View className={`status-dot ${aiStatus}`}></View>
                <Text className="status-text">
                  {aiStatus === 'typing' ? '正在输入...' : '在线'}
                </Text>
              </View>
            </View>
          </View>

          <View className="header-actions">
            <CustomIcon name="more-horizontal" size={24} color="#fff" />
          </View>
        </View>
      </View>

      {/* 消息列表 */}
      <ScrollView
        className="message-container"
        scrollY
        scrollIntoView="bottom"
        ref={scrollViewRef}
        enhanced
        showScrollbar={false}
      >
        {messages.map(message => (
          <View key={message.id} className={`message ${message.type}`}>
            {/* 头像 */}
            <View className="message-avatar">
              {message.type === 'ai' ? (
                <View className="avatar-ai">
                  <Text className="avatar-emoji">🤖</Text>
                </View>
              ) : (
                <View className="avatar-user">
                  <Text className="avatar-emoji">😊</Text>
                </View>
              )}
            </View>

            {/* 消息内容 */}
            <View className="message-content">
              <View className="message-bubble">
                {/* 语音消息显示波形 */}
                {message.audioUrl && message.duration ? (
                  <View
                    className="message-voice"
                    onClick={() =>
                      handlePlayAudio(message.id, message.audioUrl)
                    }
                  >
                    <View className="play-button">
                      <AtIcon
                        value={playingAudioId === message.id ? 'pause' : 'play'}
                        size="16"
                        color={message.type === 'user' ? '#fff' : '#7c3aed'}
                      />
                    </View>
                    <VoiceWaveform
                      duration={message.duration}
                      isPlaying={playingAudioId === message.id}
                    />
                  </View>
                ) : (
                  <Text className="message-text">{message.content}</Text>
                )}

                {/* 翻译内容 */}
                {message.translation && (
                  <View className="translation">
                    <Text className="translation-text">
                      {message.translation}
                    </Text>
                  </View>
                )}
              </View>

              {/* 消息操作和时间 */}
              <View className="message-footer">
                <Text className="message-time">
                  {formatRelativeTime(message.timestamp)}
                </Text>

                {message.type === 'ai' && (
                  <View className="message-actions">
                    <View
                      className="action-btn"
                      onClick={() =>
                        handleTranslate(message.id, message.content)
                      }
                    >
                      <CustomIcon name="globe" size={14} />
                      <Text className="action-text">翻译</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Emoji反馈 */}
            {message.type === 'user' && (
              <View className="emoji-reaction">
                <View
                  className={`emoji-btn ${messageReactions.get(message.id) === '😊' ? 'active' : ''}`}
                  onClick={() => handleEmojiReaction(message.id, '😊')}
                >
                  😊
                </View>
              </View>
            )}
          </View>
        ))}

        {isTyping && (
          <View className="message ai typing-message">
            <View className="message-avatar">
              <View className="avatar-ai">
                <Text className="avatar-emoji">🤖</Text>
              </View>
            </View>
            <View className="message-content">
              <View className="typing-indicator">
                <View className="typing-dot"></View>
                <View className="typing-dot"></View>
                <View className="typing-dot"></View>
              </View>
            </View>
          </View>
        )}

        <View id="bottom" style={{ height: '1rpx' }}></View>
      </ScrollView>

      {/* 输入工具栏 */}
      <View className="input-bar">
        <View className="input-left">
          <View className="icon-btn" onClick={() => {}}>
            <CustomIcon name="plus-circle" size={24} color="#999" />
          </View>
        </View>

        <View
          className={`record-button ${isRecording ? 'recording' : ''}`}
          onTouchStart={handleStartRecording}
          onTouchEnd={handleStopRecording}
        >
          <CustomIcon name="mic" size={20} color="#fff" />
          <Text className="record-text">
            {isRecording ? '松开结束' : '按住说话'}
          </Text>
          {shouldUseMockAudio() && (
            <Text className="mock-indicator">🎤 Mock</Text>
          )}
        </View>

        <View className="input-right">
          <View className="icon-btn emoji-btn" onClick={() => {}}>
            <Text className="emoji-icon">😊</Text>
          </View>
        </View>
      </View>

      {/* 文本输入弹窗 */}
      {showTextInput && (
        <View className="text-input-modal">
          <View className="input-panel">
            <View className="input-header">
              <Text className="input-title">输入文字</Text>
              <View
                className="close-btn"
                onClick={() => setShowTextInput(false)}
              >
                <CustomIcon name="x-circle" size={20} />
              </View>
            </View>

            <Textarea
              className="text-input"
              value={textInput}
              onInput={(e: { detail: { value: string } }) =>
                setTextInput(e.detail.value)
              }
              placeholder="输入你想说的话..."
              maxlength={500}
              autoFocus
            />

            <View className="input-actions">
              <View className="send-btn" onClick={handleSendText}>
                发送
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default ChatPage

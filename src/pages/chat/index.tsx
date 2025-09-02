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

  // 长按菜单相关状态
  const [longPressMenu, setLongPressMenu] = useState<{
    show: boolean
    messageId: string | null
    messageType: 'user' | 'ai' | null
    position: { x: number; y: number }
  }>({
    show: false,
    messageId: null,
    messageType: null,
    position: { x: 0, y: 0 },
  })

  // 翻译详情弹窗
  const [translationModal, setTranslationModal] = useState<{
    show: boolean
    data: {
      original: string
      translation: string
      pronunciation: Record<string, { phonetic: string; note: string }>
      comparison: { userExpression: string; betterExpression: string }
      improvements: string[]
      vocabulary: { word: string; meaning: string }[]
    } | null
  }>({
    show: false,
    data: null,
  })

  // 求助建议弹窗
  const [helpModal, setHelpModal] = useState<{
    show: boolean
    data: {
      status: string
      suggestion: { recommended: string; reasons: string[] }
      pronunciation: Record<string, { phonetic: string; note: string }>
    } | null
  }>({
    show: false,
    data: null,
  })

  // 引用
  const scrollViewRef = useRef<{
    scrollToBottom?: (options?: { animated?: boolean }) => void
  } | null>(null)
  const recordingTimer = useRef<NodeJS.Timeout | null>(null)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

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
      // 优先检查是否应该使用Mock录音
      const useMock = shouldUseMockAudio()
      console.log('🎤 录音环境检测:', { useMock, env: process.env.TARO_ENV })

      if (useMock) {
        console.log('🎤 开发环境：使用Mock录音功能')
        startRecording()
        await mockStartRecording()

        // 设置最大录音时长
        recordingTimer.current = setTimeout(() => {
          handleStopRecording()
        }, 60000) // 最多录音60秒
        return
      }

      // 只有在非H5环境才尝试使用真实录音API
      if (process.env.TARO_ENV === 'h5') {
        console.warn('⚠️ H5环境不支持录音API，强制使用Mock')
        // 强制使用Mock
        console.log('🎤 H5环境：强制使用Mock录音功能')
        startRecording()
        await mockStartRecording()

        recordingTimer.current = setTimeout(() => {
          handleStopRecording()
        }, 60000)
        return
      }

      // 生产环境小程序/APP使用真实录音
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
      // 如果真实API失败，尝试使用Mock作为fallback
      console.log('🎤 API失败，回退到Mock录音功能')
      try {
        startRecording()
        await mockStartRecording()
        recordingTimer.current = setTimeout(() => {
          handleStopRecording()
        }, 60000)
      } catch (mockError) {
        console.error('Mock录音也失败', mockError)
        Taro.showToast({
          title: '录音功能不可用',
          icon: 'error',
        })
      }
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
      // 检查环境，优先使用Mock
      const useMock = shouldUseMockAudio() || process.env.TARO_ENV === 'h5'

      if (useMock) {
        console.log('🎤 开发/H5环境：停止Mock录音')
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

      // 生产环境小程序/APP使用真实录音
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
      // Fallback到Mock
      console.log('🎤 停止录音API失败，尝试Mock处理')
      try {
        const mockAudioData = await mockStopRecording()
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'user',
          content: mockAudioData.text,
          audioUrl: mockAudioData.audioUrl,
          duration: mockAudioData.duration,
          timestamp: Date.now(),
        }
        addMessage(userMessage)
        scrollToBottom()
        handleAIResponse(userMessage.content)
      } catch (fallbackError) {
        console.error('Fallback Mock也失败', fallbackError)
        Taro.showToast({
          title: '录音处理失败',
          icon: 'error',
        })
      }
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

  // 长按语音条处理
  const handleLongPress = (
    messageId: string,
    messageType: 'user' | 'ai',
    e: {
      touches?: { clientX: number; clientY: number }[]
      changedTouches?: { clientX: number; clientY: number }[]
    }
  ) => {
    // 获取触摸位置
    const { clientX, clientY } = e.touches?.[0] ||
      e.changedTouches?.[0] || { clientX: 0, clientY: 0 }

    setLongPressMenu({
      show: true,
      messageId,
      messageType,
      position: { x: clientX, y: clientY },
    })

    // 震动反馈
    Taro.vibrateShort?.().catch(() => {})
  }

  // 开始长按检测
  const handleTouchStart = (
    messageId: string,
    messageType: 'user' | 'ai',
    e: {
      touches?: { clientX: number; clientY: number }[]
      changedTouches?: { clientX: number; clientY: number }[]
    }
  ) => {
    // 如果正在录音，不启动长按检测
    if (isRecording) return

    longPressTimer.current = setTimeout(() => {
      handleLongPress(messageId, messageType, e)
    }, 500) // 500ms 长按时间
  }

  // 结束长按检测
  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  // 关闭长按菜单
  const closeLongPressMenu = () => {
    setLongPressMenu({
      show: false,
      messageId: null,
      messageType: null,
      position: { x: 0, y: 0 },
    })
  }

  // 显示翻译详情
  const showTranslationDetail = async (message: ChatMessage) => {
    try {
      closeLongPressMenu()

      // 通过API获取翻译详情
      const response = await chatApi.getTranslationDetail(
        message.id,
        message.content,
        message.type
      )

      if (response.code === 200) {
        setTranslationModal({
          show: true,
          data: response.data as typeof translationModal.data,
        })
        updateDailyUsage('translate')
      } else {
        throw new Error(response.message || '获取翻译详情失败')
      }
    } catch (error) {
      console.error('获取翻译详情失败:', error)
      Taro.showToast({
        title: '翻译失败，请重试',
        icon: 'error',
      })
    }
  }

  // 显示求助建议
  const showHelpSuggestion = async (message: ChatMessage) => {
    try {
      closeLongPressMenu()

      // 通过API获取求助建议
      const response = await chatApi.getHelpSuggestion(
        message.id,
        message.content
      )

      if (response.code === 200) {
        setHelpModal({
          show: true,
          data: response.data as typeof helpModal.data,
        })
        updateDailyUsage('help')
      } else {
        throw new Error(response.message || '获取求助建议失败')
      }
    } catch (error) {
      console.error('获取求助建议失败:', error)
      Taro.showToast({
        title: '求助失败，请重试',
        icon: 'error',
      })
    }
  }

  // 关闭翻译弹窗
  const closeTranslationModal = () => {
    setTranslationModal({ show: false, data: null })
  }

  // 关闭求助弹窗
  const closeHelpModal = () => {
    setHelpModal({ show: false, data: null })
  }

  // 播放发音
  const playPronunciation = (text: string) => {
    // 模拟播放发音
    Taro.showToast({
      title: `播放: ${text}`,
      icon: 'none',
      duration: 1000,
    })
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
                {(shouldUseMockAudio() || process.env.TARO_ENV === 'h5') && (
                  <Text className="env-indicator">
                    [{process.env.TARO_ENV || 'dev'}]
                  </Text>
                )}
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
                    onTouchStart={e =>
                      handleTouchStart(
                        message.id,
                        message.type,
                        e as {
                          touches?: { clientX: number; clientY: number }[]
                          changedTouches?: {
                            clientX: number
                            clientY: number
                          }[]
                        }
                      )
                    }
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
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
          onTouchStart={e => {
            e.stopPropagation()
            handleStartRecording()
          }}
          onTouchEnd={e => {
            e.stopPropagation()
            handleStopRecording()
          }}
          onTouchCancel={e => {
            e.stopPropagation()
            handleStopRecording()
          }}
        >
          <CustomIcon name="mic" size={20} color="#fff" />
          <Text className="record-text">
            {isRecording ? '松开结束' : '按住说话'}
          </Text>
          {(shouldUseMockAudio() || process.env.TARO_ENV === 'h5') && (
            <Text className="mock-indicator">🎤 开发模式</Text>
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

      {/* 长按操作菜单 */}
      {longPressMenu.show && !isRecording && (
        <View className="long-press-overlay" onClick={closeLongPressMenu}>
          <View
            className="long-press-menu"
            style={{
              left: `${Math.max(20, Math.min(longPressMenu.position.x - 60, 300))}px`,
              top: `${Math.max(100, longPressMenu.position.y - 80)}px`,
            }}
            onClick={e => e.stopPropagation()}
          >
            <View
              className="menu-item translate-btn"
              onClick={() => {
                const message = messages.find(
                  m => m.id === longPressMenu.messageId
                )
                if (message) showTranslationDetail(message)
              }}
            >
              <CustomIcon name="globe" size={16} color="#7c3aed" />
              <Text className="menu-text">翻译</Text>
            </View>

            {longPressMenu.messageType === 'user' && (
              <View
                className="menu-item help-btn"
                onClick={() => {
                  const message = messages.find(
                    m => m.id === longPressMenu.messageId
                  )
                  if (message) showHelpSuggestion(message)
                }}
              >
                <CustomIcon name="help-circle" size={16} color="#ec4899" />
                <Text className="menu-text">求助</Text>
              </View>
            )}

            {/* 菜单箭头 */}
            <View className="menu-arrow"></View>
          </View>
        </View>
      )}

      {/* 翻译详情弹窗 */}
      {translationModal.show && translationModal.data && (
        <View
          className="translation-modal-overlay"
          onClick={closeTranslationModal}
        >
          <View
            className="translation-modal"
            onClick={e => e.stopPropagation()}
          >
            <View className="modal-header">
              <Text className="modal-title">
                &ldquo;{translationModal.data.original}&rdquo;
              </Text>
              <View className="close-btn" onClick={closeTranslationModal}>
                <CustomIcon name="x" size={20} color="#666" />
              </View>
            </View>

            <View className="translation-content">
              {/* 翻译结果 */}
              <View className="translation-result">
                <Text className="translation-label">翻译:</Text>
                <Text className="translation-text">
                  &ldquo;{translationModal.data.translation}&rdquo;
                </Text>
              </View>

              {/* 发音要点 */}
              <View className="pronunciation-section">
                <View className="section-header">
                  <CustomIcon name="volume-2" size={16} color="#7c3aed" />
                  <Text className="section-title">发音要点</Text>
                  <View
                    className="play-btn"
                    onClick={() =>
                      playPronunciation(
                        translationModal.data?.translation || ''
                      )
                    }
                  >
                    <CustomIcon name="play" size={14} color="#fff" />
                    <Text className="play-text">播放</Text>
                  </View>
                </View>

                {Object.entries(translationModal.data.pronunciation || {}).map(
                  ([word, info]: [
                    string,
                    { phonetic: string; note: string },
                  ]) => (
                    <View key={word} className="pronunciation-item">
                      <Text className="word">&ldquo;{word}&rdquo;</Text>
                      <Text className="phonetic">{info.phonetic}</Text>
                      <Text className="note">- {info.note}</Text>
                    </View>
                  )
                )}
              </View>

              {/* 表达对比 */}
              <View className="comparison-section">
                <View className="section-header">
                  <CustomIcon name="repeat" size={16} color="#f59e0b" />
                  <Text className="section-title">表达对比</Text>
                </View>

                <View className="comparison-item">
                  <Text className="comparison-label">你的表达:</Text>
                  <Text className="comparison-text">
                    &ldquo;{translationModal.data.comparison.userExpression}
                    &rdquo;
                  </Text>
                </View>

                <View className="comparison-item">
                  <Text className="comparison-label">更地道:</Text>
                  <Text className="comparison-text better">
                    &ldquo;{translationModal.data.comparison.betterExpression}
                    &rdquo;
                  </Text>
                </View>
              </View>

              {/* 词汇扩展 */}
              <View className="vocabulary-section">
                <View className="section-header">
                  <CustomIcon name="book-open" size={16} color="#10b981" />
                  <Text className="section-title">词汇扩展</Text>
                </View>

                {translationModal.data.vocabulary?.map(
                  (item: { word: string; meaning: string }, index: number) => (
                    <View key={index} className="vocabulary-item">
                      <Text className="vocabulary-word">{item.word}</Text>
                      <Text className="vocabulary-meaning">
                        ({item.meaning})
                      </Text>
                    </View>
                  )
                )}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 求助建议弹窗 */}
      {helpModal.show && helpModal.data && (
        <View className="help-modal-overlay" onClick={closeHelpModal}>
          <View className="help-modal" onClick={e => e.stopPropagation()}>
            <View className="modal-header">
              <Text className="modal-title">计划去公园散步</Text>
              <View className="close-btn" onClick={closeHelpModal}>
                <CustomIcon name="x" size={20} color="#666" />
              </View>
            </View>

            <View className="help-content">
              {/* 求助状态 */}
              <View className="help-status">
                <CustomIcon name="check-circle" size={16} color="#10b981" />
                <Text className="status-text">{helpModal.data.status}</Text>
              </View>

              {/* 地道表达建议 */}
              <View className="suggestion-section">
                <View className="section-header">
                  <CustomIcon name="lightbulb" size={16} color="#f59e0b" />
                  <Text className="section-title">地道表达建议</Text>
                </View>

                <View className="suggestion-item">
                  <Text className="suggestion-label">推荐表达:</Text>
                  <Text className="suggestion-text">
                    &ldquo;{helpModal.data.suggestion.recommended}&rdquo;
                  </Text>
                </View>

                <View className="improvement-reasons">
                  <Text className="reasons-title">改进原因:</Text>
                  {helpModal.data.suggestion.reasons?.map(
                    (reason: string, index: number) => (
                      <Text key={index} className="reason-text">
                        &ldquo;{reason}&rdquo;
                      </Text>
                    )
                  )}
                </View>
              </View>

              {/* 发音要点 */}
              <View className="pronunciation-section">
                <View className="section-header">
                  <CustomIcon name="volume-2" size={16} color="#7c3aed" />
                  <Text className="section-title">发音要点</Text>
                  <View
                    className="play-btn"
                    onClick={() =>
                      playPronunciation(
                        helpModal.data?.suggestion.recommended || ''
                      )
                    }
                  >
                    <CustomIcon name="play" size={14} color="#fff" />
                    <Text className="play-text">播放</Text>
                  </View>
                </View>

                {Object.entries(helpModal.data.pronunciation || {}).map(
                  ([word, info]: [
                    string,
                    { phonetic: string; note: string },
                  ]) => (
                    <View key={word} className="pronunciation-item">
                      <Text className="word">&ldquo;{word}&rdquo;</Text>
                      <Text className="phonetic">{info.phonetic}</Text>
                      <Text className="note">- {info.note}</Text>
                    </View>
                  )
                )}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default ChatPage

import { useState, useRef, useEffect } from 'react'
import { View, Text, ScrollView, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import { useChatStore } from '../../stores/chat'
import { useUserStore } from '../../stores/user'
import './index.scss'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  audioUrl?: string
  timestamp: number
  translation?: string
  helpContent?: {
    original: string
    corrected: string
  }
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

  // 引用
  const scrollViewRef = useRef<{
    scrollToBottom?: (options?: { animated?: boolean }) => void
  } | null>(null)
  const recordingTimer = useRef<NodeJS.Timeout | null>(null)

  // 页面初始化
  useEffect(() => {
    // 添加欢迎消息
    if (messages.length === 0) {
      addMessage({
        id: Date.now().toString(),
        type: 'ai',
        content:
          "Hi! I'm your AI English tutor. Let's practice speaking English together! 🦆",
        timestamp: Date.now(),
      })
    }
  }, [messages.length, addMessage])

  // 滚动到底部
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToBottom?.({ animated: true })
    }, 100)
  }

  // 开始录音
  const handleStartRecording = async () => {
    try {
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
      Taro.stopRecord({
        success: res => {
          const audioPath = (res as unknown as { tempFilePath: string })
            .tempFilePath

          // 添加用户消息
          const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: '[语音消息]', // 这里应该是语音转文字的结果
            audioUrl: audioPath,
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
  const handleAIResponse = async (_userInput: string) => {
    setIsTyping(true)

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 模拟AI回复
    const responses = [
      "That's interesting! Can you tell me more about it?",
      'Great job! Your pronunciation is getting better.',
      'I understand. How do you feel about that?',
      'That sounds wonderful! What happened next?',
      'Good point! I agree with you on that.',
    ]

    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)]

    const aiMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content: randomResponse,
      timestamp: Date.now(),
    }

    setIsTyping(false)
    addMessage(aiMessage)
    scrollToBottom()
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
    }
  }

  // 翻译功能
  const handleTranslate = (messageId: string, content: string) => {
    updateDailyUsage('translate')

    // 模拟翻译结果
    const translation =
      content ===
      "Hi! I'm your AI English tutor. Let's practice speaking English together! 🦆"
        ? '你好！我是你的AI英语老师。让我们一起练习说英语吧！🦆'
        : '这是翻译结果示例'

    // 更新消息添加翻译
    // 这里应该调用store方法更新消息
    console.log('翻译:', translation)

    Taro.showToast({
      title: '翻译完成',
      icon: 'success',
    })
  }

  // 求助功能
  const handleHelp = (messageId: string, content: string) => {
    updateDailyUsage('help')

    // 模拟求助结果
    const helpContent = {
      original: content,
      corrected: "Here's a more natural way to say it...",
    }

    console.log('求助结果:', helpContent)

    Taro.showToast({
      title: '获取帮助成功',
      icon: 'success',
    })
  }

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <View className="chat-page">
      {/* 聊天头部 */}
      <View className="chat-header">
        <View className="ai-info">
          <View className={`duck-avatar ${isTyping ? 'speaking' : ''}`}></View>
          <View className="ai-details">
            <Text className="ai-name">AI外教 Duck</Text>
            <Text className={`ai-status ${isTyping ? 'typing' : 'online'}`}>
              {isTyping ? '正在输入...' : '在线'}
            </Text>
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
            <View className="message-bubble">
              <Text className="message-text">{message.content}</Text>

              {message.audioUrl && (
                <View className="message-audio">
                  <View
                    className={`play-btn ${playingAudioId === message.id ? 'playing' : ''}`}
                    onClick={() =>
                      handlePlayAudio(message.id, message.audioUrl)
                    }
                  >
                    <AtIcon
                      value={playingAudioId === message.id ? 'pause' : 'play'}
                      className="play-icon"
                    />
                  </View>
                  <Text className="audio-duration">0:15</Text>
                </View>
              )}

              {message.type === 'ai' && (
                <View className="message-actions">
                  <View
                    className="action-btn translate-btn"
                    onClick={() => handleTranslate(message.id, message.content)}
                  >
                    翻译
                  </View>
                </View>
              )}

              {message.type === 'user' && (
                <View className="message-actions">
                  <View
                    className="action-btn help-btn"
                    onClick={() => handleHelp(message.id, message.content)}
                  >
                    求助
                  </View>
                </View>
              )}

              <Text className="message-time">
                {formatTime(message.timestamp)}
              </Text>

              {message.translation && (
                <View className="translation">
                  <Text className="translation-text">
                    {message.translation}
                  </Text>
                </View>
              )}

              {message.helpContent && (
                <View className="help-content">
                  <Text className="original-text">
                    {message.helpContent.original}
                  </Text>
                  <Text className="corrected-text">
                    {message.helpContent.corrected}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}

        {isTyping && (
          <View className="typing-indicator">
            <View className="typing-bubble">
              <View className="typing-animation">
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
        <View
          className={`record-button ${isRecording ? 'recording' : ''}`}
          onTouchStart={handleStartRecording}
          onTouchEnd={handleStopRecording}
        >
          <AtIcon value="sound" className="record-icon" />
          <Text className="record-text">
            {isRecording ? '松开结束' : '按住说话'}
          </Text>
        </View>

        <View className="function-buttons">
          <View
            className="function-btn keyboard-btn"
            onClick={() => setShowTextInput(true)}
          >
            <AtIcon value="edit" />
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
                <AtIcon value="close" />
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

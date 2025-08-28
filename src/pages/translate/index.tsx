import { useState, useRef } from 'react'
import { View, Text, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import CustomNavBar from '../../components/common/CustomNavBar'
import { useUserStore } from '../../stores/user'
import './index.scss'

interface TranslateResult {
  standard: string
  colloquial: string
  audioUrl?: string
}

interface TranslateHistory {
  id: string
  original: string
  result: TranslateResult
  timestamp: number
  sourceLanguage: 'zh' | 'en'
}

const TranslatePage = () => {
  const { updateDailyUsage, checkUsage } = useUserStore()

  // 状态管理
  const [inputText, setInputText] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState<'zh' | 'en'>('zh')
  const [isTranslating, setIsTranslating] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [translateResult, setTranslateResult] =
    useState<TranslateResult | null>(null)
  const [activeTab, setActiveTab] = useState<'standard' | 'colloquial'>(
    'standard'
  )
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)

  // 历史记录(模拟数据)
  const [history] = useState<TranslateHistory[]>([
    {
      id: '1',
      original: '你好，很高兴认识你',
      result: {
        standard: 'Hello, nice to meet you',
        colloquial: 'Hi there! Great to meet you!',
      },
      timestamp: Date.now() - 3600000,
      sourceLanguage: 'zh',
    },
    {
      id: '2',
      original: '今天天气真不错',
      result: {
        standard: 'The weather is really nice today',
        colloquial: 'What a beautiful day!',
      },
      timestamp: Date.now() - 7200000,
      sourceLanguage: 'zh',
    },
  ])

  // 常用短语
  const quickPhrases = [
    { icon: '👋', text: '问候语', template: '你好，很高兴认识你' },
    { icon: '🍽️', text: '点餐', template: '我想点一杯咖啡' },
    { icon: '🛣️', text: '问路', template: '请问洗手间在哪里？' },
    { icon: '🛒', text: '购物', template: '这个多少钱？' },
  ]

  const recordingTimer = useRef<NodeJS.Timeout | null>(null)

  // 切换语言
  const toggleLanguage = () => {
    setSourceLanguage(sourceLanguage === 'zh' ? 'en' : 'zh')
    setInputText('')
    setTranslateResult(null)
  }

  // 检查输入限制
  const checkInputLimit = () => {
    if (!inputText.trim()) {
      Taro.showToast({
        title: '请输入要翻译的内容',
        icon: 'none',
      })
      return false
    }

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
      return false
    }

    return true
  }

  // 翻译功能
  const handleTranslate = async () => {
    if (!checkInputLimit()) return

    setIsTranslating(true)
    updateDailyUsage('translate')

    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1500))

      // 模拟翻译结果
      const result: TranslateResult = {
        standard:
          sourceLanguage === 'zh'
            ? 'This is a standard translation result'
            : '这是一个标准翻译结果',
        colloquial:
          sourceLanguage === 'zh'
            ? "Hey! This is how we'd actually say it!"
            : '嘿！我们平时会这么说！',
      }

      setTranslateResult(result)

      Taro.showToast({
        title: '翻译完成',
        icon: 'success',
      })
    } catch (error) {
      console.error('翻译失败:', error)
      Taro.showToast({
        title: '翻译失败，请重试',
        icon: 'error',
      })
    } finally {
      setIsTranslating(false)
    }
  }

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

  // 清空输入
  const clearInput = () => {
    setInputText('')
    setTranslateResult(null)
  }

  // 复制文本
  const copyText = (text: string) => {
    Taro.setClipboardData({
      data: text,
      success: () => {
        Taro.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
        })
      },
    })
  }

  // 播放音频
  const playAudio = (text: string, type: string) => {
    const audioId = `${type}-audio`

    if (playingAudio === audioId) {
      // 停止播放
      Taro.stopBackgroundAudio()
      setPlayingAudio(null)
    } else {
      // 开始播放 - 这里应该调用TTS API
      setPlayingAudio(audioId)

      // 模拟播放完成
      setTimeout(() => {
        setPlayingAudio(null)
      }, 3000)

      Taro.showToast({
        title: '播放中',
        icon: 'success',
      })
    }
  }

  // 使用快速短语 - 已移除，直接使用 setInputText

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
    <View className="translate-page">
      {/* 导航栏 */}
      <CustomNavBar
        title="智能翻译"
        backgroundColor="#2196F3"
        renderRight={
          <View
            className="nav-right-btn"
            onClick={() =>
              Taro.navigateTo({ url: '/pages/translate-history/index' })
            }
          >
            <AtIcon value="clock" size="20" />
          </View>
        }
      />

      <View className="page-content">
        {/* 翻译卡片 */}
        <View className="translate-card">
          {/* 输入区域 */}
          <View className="input-section">
            <View className="section-header">
              <Text className="section-title">
                <Text className="flag-icon">
                  {sourceLanguage === 'zh' ? '🇨🇳' : '🇺🇸'}
                </Text>
                {sourceLanguage === 'zh' ? '中文' : 'English'}
              </Text>
              <View className="language-switch" onClick={toggleLanguage}>
                <AtIcon value="reload" size="16" />
              </View>
            </View>

            <View className="input-container">
              <Textarea
                className="text-input"
                value={inputText}
                onInput={(e: { detail: { value: string } }) =>
                  setInputText(e.detail.value)
                }
                placeholder={
                  sourceLanguage === 'zh'
                    ? '请输入要翻译的中文...'
                    : 'Please enter English text...'
                }
                maxlength={1000}
                autoHeight
              />

              <View className="input-actions">
                {inputText && (
                  <View className="action-btn clear-btn" onClick={clearInput}>
                    <AtIcon value="close" />
                  </View>
                )}

                <View
                  className={`action-btn voice-btn ${isRecording ? 'recording' : ''}`}
                  onClick={handleVoiceInput}
                >
                  <AtIcon value="sound" />
                </View>
              </View>

              <Text
                className={`char-count ${inputText.length > 800 ? 'warning' : inputText.length > 900 ? 'error' : ''}`}
              >
                {inputText.length}/1000
              </Text>
            </View>
          </View>

          {/* 翻译按钮 */}
          <View
            className={`translate-button ${isTranslating ? 'loading' : ''}`}
            onClick={handleTranslate}
          >
            <AtIcon
              value={isTranslating ? 'loading-3' : 'reload'}
              className="translate-icon"
            />
            <Text>{isTranslating ? '翻译中...' : '开始翻译'}</Text>
          </View>

          {/* 翻译结果 */}
          {translateResult && (
            <View className="result-section show">
              <View className="result-tabs">
                <View
                  className={`tab-item ${activeTab === 'standard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('standard')}
                >
                  标准翻译
                </View>
                <View
                  className={`tab-item ${activeTab === 'colloquial' ? 'active' : ''}`}
                  onClick={() => setActiveTab('colloquial')}
                >
                  地道口语
                </View>
              </View>

              <View className="result-content">
                <View className="result-item">
                  <View className="result-header">
                    <Text className="result-title">
                      <Text className={`title-icon ${activeTab}`}>
                        {activeTab === 'standard' ? '📖' : '💬'}
                      </Text>
                      {activeTab === 'standard' ? '标准翻译' : '地道表达'}
                    </Text>

                    <View className="result-actions">
                      <View
                        className="action-btn copy-btn"
                        onClick={() =>
                          copyText(
                            activeTab === 'standard'
                              ? translateResult.standard
                              : translateResult.colloquial
                          )
                        }
                      >
                        <AtIcon value="copy" />
                        <Text>复制</Text>
                      </View>

                      <View
                        className={`action-btn play-btn ${playingAudio === `${activeTab}-audio` ? 'playing' : ''}`}
                        onClick={() =>
                          playAudio(
                            activeTab === 'standard'
                              ? translateResult.standard
                              : translateResult.colloquial,
                            activeTab
                          )
                        }
                      >
                        <AtIcon
                          value={
                            playingAudio === `${activeTab}-audio`
                              ? 'pause'
                              : 'play'
                          }
                        />
                        <Text>
                          {playingAudio === `${activeTab}-audio`
                            ? '停止'
                            : '朗读'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text className={`result-text ${activeTab}`}>
                    {activeTab === 'standard'
                      ? translateResult.standard
                      : translateResult.colloquial}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* 快速短语 */}
        <View className="quick-phrases">
          <Text className="section-title">
            <Text className="title-icon">⚡</Text>
            常用短语
          </Text>

          <View className="phrases-grid">
            {quickPhrases.map((phrase, index) => (
              <View
                key={index}
                className="phrase-item"
                onClick={() => setInputText(phrase.template)}
              >
                <Text className="phrase-icon">{phrase.icon}</Text>
                <Text className="phrase-text">{phrase.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 翻译历史 */}
        <View className="history-section">
          <View className="section-header">
            <Text className="section-title">
              <Text className="title-icon">📝</Text>
              翻译历史
            </Text>

            <View
              className="view-all-btn"
              onClick={() =>
                Taro.navigateTo({ url: '/pages/translate-history/index' })
              }
            >
              查看全部
            </View>
          </View>

          <View className="history-list">
            {history.slice(0, 3).map(item => (
              <View key={item.id} className="history-item">
                <View className="history-content">
                  <Text className="original-text">{item.original}</Text>
                  <Text className="translated-text">
                    {item.result.standard}
                  </Text>
                  <Text className="history-time">
                    {formatTime(item.timestamp)}
                  </Text>
                </View>

                <View className="history-actions">
                  <View
                    className="history-action-btn"
                    onClick={() => setInputText(item.original)}
                  >
                    重新翻译
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  )
}

export default TranslatePage

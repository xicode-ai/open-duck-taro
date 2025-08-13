import { useState, useRef } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Textarea } from '@tarojs/components'
import { AtButton, AtIcon, AtTabs, AtTabsPane, AtActionSheet, AtActionSheetItem } from 'taro-ui'
import { getStorage, setStorage } from '@/utils'
import type { TranslationResult } from '@/types'
import ErrorBoundary from '@/components/ErrorBoundary'
import './index.scss'

const Translate = () => {
  const [inputText, setInputText] = useState('')
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPlayingType, setCurrentPlayingType] = useState<'formal' | 'casual' | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [translationHistory, setTranslationHistory] = useState<TranslationResult[]>([])
  const [actionSheetOpen, setActionSheetOpen] = useState(false)
  const [selectedResult, setSelectedResult] = useState<TranslationResult | null>(null)

  const innerAudioContextRef = useRef<Taro.InnerAudioContext | null>(null)

  const tabList = [{ title: '翻译' }, { title: '历史记录' }]

  // 初始化音频播放器
  const initAudioContext = () => {
    if (!innerAudioContextRef.current) {
      const innerAudioContext = Taro.createInnerAudioContext()
      innerAudioContextRef.current = innerAudioContext

      innerAudioContext.onPlay(() => {
        setIsPlaying(true)
      })

      innerAudioContext.onStop(() => {
        setIsPlaying(false)
        setCurrentPlayingType(null)
      })

      innerAudioContext.onEnded(() => {
        setIsPlaying(false)
        setCurrentPlayingType(null)
      })

      innerAudioContext.onError(() => {
        setIsPlaying(false)
        setCurrentPlayingType(null)
        Taro.showToast({ title: '播放失败', icon: 'none' })
      })
    }
  }

  // 加载历史记录
  const loadHistory = async () => {
    const history = (await getStorage<TranslationResult[]>('translation_history')) || []
    setTranslationHistory(history)
  }

  // 保存到历史记录
  const saveToHistory = async (result: TranslationResult) => {
    const history = (await getStorage<TranslationResult[]>('translation_history')) || []
    const newHistory = [result, ...history.slice(0, 19)] // 保留最近20条
    await setStorage('translation_history', newHistory)
    setTranslationHistory(newHistory)
  }

  // 处理翻译
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      Taro.showToast({ title: '请输入要翻译的内容', icon: 'none' })
      return
    }

    setIsTranslating(true)

    // 这里应该调用真实的翻译API
    // const result = await api.post('/translate', { text: inputText })

    // 模拟翻译结果
    await new Promise(resolve => setTimeout(resolve, 1500))

    const mockResult: TranslationResult = {
      original: inputText,
      formal: getRandomFormalTranslation(inputText),
      casual: getRandomCasualTranslation(inputText),
      audioUrl: 'mock-audio-url',
    }

    setTranslationResult(mockResult)
    await saveToHistory(mockResult)
    setIsTranslating(false)
  }

  // 模拟正式翻译
  const getRandomFormalTranslation = (text: string): string => {
    const formalExamples: Record<string, string> = {
      你好: 'Hello, how do you do?',
      谢谢: 'Thank you very much.',
      再见: 'Goodbye, have a nice day.',
      请问: 'Excuse me, may I ask...',
      不好意思: 'I beg your pardon.',
      没关系: 'It does not matter.',
      对不起: 'I apologize.',
      请稍等: 'Please wait a moment.',
      很高兴见到你: 'It is a pleasure to meet you.',
      祝你好运: 'I wish you the best of luck.',
    }

    return formalExamples[text] || 'This is a formal translation of your input text.'
  }

  // 模拟口语翻译
  const getRandomCasualTranslation = (text: string): string => {
    const casualExamples: Record<string, string> = {
      你好: 'Hey there!',
      谢谢: 'Thanks!',
      再见: 'See ya!',
      请问: 'Hey, can I ask...',
      不好意思: 'Sorry about that.',
      没关系: 'No worries!',
      对不起: "I'm sorry.",
      请稍等: 'Just a sec.',
      很高兴见到你: 'Nice to meet you!',
      祝你好运: 'Good luck!',
    }

    return casualExamples[text] || 'This is a casual/spoken translation of your input text.'
  }

  // 播放语音
  const handlePlayAudio = (type: 'formal' | 'casual') => {
    initAudioContext()

    if (isPlaying && currentPlayingType === type) {
      innerAudioContextRef.current?.stop()
      return
    }

    if (!translationResult) return

    setCurrentPlayingType(type)

    // 这里应该播放真实的语音文件
    // innerAudioContextRef.current!.src = translationResult.audioUrl + `?type=${type}`
    // innerAudioContextRef.current?.play()

    // 模拟播放
    setIsPlaying(true)
    setTimeout(() => {
      setIsPlaying(false)
      setCurrentPlayingType(null)
    }, 3000)
  }

  // 复制文本
  const handleCopyText = (text: string) => {
    Taro.setClipboardData({
      data: text,
      success: () => {
        Taro.showToast({ title: '已复制到剪贴板', icon: 'success' })
      },
    })
  }

  // 分享功能暂时不需要

  // 删除历史记录
  const handleDeleteHistory = async (index: number) => {
    const newHistory = translationHistory.filter((_, i) => i !== index)
    setTranslationHistory(newHistory)
    await setStorage('translation_history', newHistory)
    Taro.showToast({ title: '已删除', icon: 'success' })
  }

  // 处理历史记录长按
  const handleHistoryLongPress = (result: TranslationResult) => {
    setSelectedResult(result)
    setActionSheetOpen(true)
  }

  // 渲染翻译结果卡片
  const renderTranslationCard = (result: TranslationResult, showActions = true) => (
    <View className="translation-card">
      <View className="original-text">
        <Text className="label">原文：</Text>
        <Text className="text">{result.original}</Text>
      </View>

      <View className="translation-item">
        <View className="translation-header">
          <Text className="label">标准翻译：</Text>
          {showActions && (
            <View className="action-buttons">
              <View className="action-btn" onClick={() => handlePlayAudio('formal')}>
                <AtIcon
                  value={isPlaying && currentPlayingType === 'formal' ? 'pause' : 'play'}
                  size="16"
                  color="#4A90E2"
                />
              </View>
              <View className="action-btn" onClick={() => handleCopyText(result.formal)}>
                <AtIcon value="copy" size="16" color="#4A90E2" />
              </View>
            </View>
          )}
        </View>
        <Text className="translation-text">{result.formal}</Text>
      </View>

      <View className="translation-item">
        <View className="translation-header">
          <Text className="label">口语表达：</Text>
          {showActions && (
            <View className="action-buttons">
              <View className="action-btn" onClick={() => handlePlayAudio('casual')}>
                <AtIcon
                  value={isPlaying && currentPlayingType === 'casual' ? 'pause' : 'play'}
                  size="16"
                  color="#50C878"
                />
              </View>
              <View className="action-btn" onClick={() => handleCopyText(result.casual)}>
                <AtIcon value="copy" size="16" color="#50C878" />
              </View>
            </View>
          )}
        </View>
        <Text className="translation-text casual">{result.casual}</Text>
      </View>
    </View>
  )

  return (
    <ErrorBoundary>
      <View className="translate-page">
        <AtTabs
          current={activeTab}
          tabList={tabList}
          onClick={index => {
            setActiveTab(index)
            if (index === 1) {
              loadHistory()
            }
          }}
          className="translate-tabs"
        >
          {/* 翻译页面 */}
          <AtTabsPane current={activeTab} index={0}>
            <View className="translate-content">
              {/* 输入区域 */}
              <View className="input-section">
                <Text className="input-label">请输入中文：</Text>
                <Textarea
                  className="input-textarea"
                  value={inputText}
                  onInput={e => setInputText(e.detail.value)}
                  placeholder="在这里输入你想翻译的中文..."
                  maxlength={500}
                  showConfirmBar={false}
                />
                <View className="input-footer">
                  <Text className="char-count">{inputText.length}/500</Text>
                  <AtButton
                    type="primary"
                    size="small"
                    loading={isTranslating}
                    onClick={handleTranslate}
                    disabled={!inputText.trim()}
                  >
                    {isTranslating ? '翻译中...' : '翻译'}
                  </AtButton>
                </View>
              </View>

              {/* 翻译结果 */}
              {translationResult && renderTranslationCard(translationResult)}
            </View>
          </AtTabsPane>

          {/* 历史记录页面 */}
          <AtTabsPane current={activeTab} index={1}>
            <View className="history-content">
              {translationHistory.length === 0 ? (
                <View className="empty-state">
                  <AtIcon value="clock" size="48" color="#cccccc" />
                  <Text className="empty-text">暂无翻译记录</Text>
                </View>
              ) : (
                translationHistory.map((result, index) => (
                  <View
                    key={index}
                    className="history-item"
                    onLongPress={() => handleHistoryLongPress(result)}
                  >
                    {renderTranslationCard(result, false)}
                  </View>
                ))
              )}
            </View>
          </AtTabsPane>
        </AtTabs>

        {/* 操作菜单 */}
        <AtActionSheet
          isOpened={actionSheetOpen}
          cancelText="取消"
          onCancel={() => setActionSheetOpen(false)}
          onClose={() => setActionSheetOpen(false)}
        >
          <AtActionSheetItem
            onClick={() => {
              if (selectedResult) {
                setInputText(selectedResult.original)
                setActiveTab(0)
              }
              setActionSheetOpen(false)
            }}
          >
            重新翻译
          </AtActionSheetItem>
          <AtActionSheetItem
            onClick={() => {
              if (selectedResult) {
                handleCopyText(`${selectedResult.formal}\n${selectedResult.casual}`)
              }
              setActionSheetOpen(false)
            }}
          >
            复制翻译
          </AtActionSheetItem>
          <AtActionSheetItem
            onClick={() => {
              const index = translationHistory.findIndex(h => h === selectedResult)
              if (index !== -1) {
                handleDeleteHistory(index)
              }
              setActionSheetOpen(false)
            }}
          >
            删除记录
          </AtActionSheetItem>
        </AtActionSheet>
      </View>
    </ErrorBoundary>
  )
}

export default Translate

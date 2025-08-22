import { useState, useRef } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Textarea } from '@tarojs/components'
import { AtButton, AtIcon } from 'taro-ui'
import { safeAsync, safeEventHandler } from '@/utils'
import type { TranslationResult } from '@/types'
import { withPageErrorBoundary } from '@/components/ErrorBoundary/PageErrorBoundary'
import { CustomNavBar } from '@/components/common'
import './index.scss'

const TranslatePage = () => {
  const [inputText, setInputText] = useState('')
  const [translationResult, setTranslationResult] =
    useState<TranslationResult | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [activeTranslationType, setActiveTranslationType] = useState<
    'formal' | 'casual'
  >('formal')

  const _innerAudioContextRef = useRef<Taro.InnerAudioContext | null>(null)

  // 实用短语数据
  const usefulPhrases = [
    {
      chinese: '请给我一杯拿铁，好吗？',
      english: 'Can I have a latte, please?',
    },
    {
      chinese: '我想点一杯咖啡。',
      english: "I'd like to order a coffee.",
    },
    {
      chinese: '你推荐什么？',
      english: 'What would you recommend?',
    },
  ]

  // 语音输入处理
  const handleVoiceInput = safeEventHandler(() => {
    Taro.showToast({ title: '语音输入功能开发中', icon: 'none' })
  }, 'voice-input')

  // 拍照识别处理
  const handlePhotoInput = safeEventHandler(() => {
    Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: () => {
        Taro.showToast({ title: '拍照识别功能开发中', icon: 'none' })
      },
    })
  }, 'photo-input')

  // 历史记录页面处理
  const handleHistoryClick = safeEventHandler(() => {
    Taro.navigateTo({ url: '/pages/translate-history/index' })
  }, 'history-click')

  // 处理翻译
  const handleTranslate = safeAsync(async () => {
    if (!inputText.trim()) {
      Taro.showToast({ title: '请输入要翻译的内容', icon: 'none' })
      return
    }

    setIsTranslating(true)

    // 模拟翻译结果
    await new Promise(resolve => setTimeout(resolve, 1500))

    const mockResult: TranslationResult = {
      original: inputText,
      formal: getFormalTranslation(inputText),
      casual: getCasualTranslation(inputText),
      audioUrl: 'mock-audio-url',
    }

    setTranslationResult(mockResult)
    setIsTranslating(false)
  }, 'api')

  // 获取正式翻译
  const getFormalTranslation = (text: string): string => {
    const examples: Record<string, string> = {
      '我想去咖啡店买一杯拿铁，但是我不知道怎么用英语点餐。':
        "I want to go to a coffee shop to buy a latte, but I don't know how to order in English.",
      你好: 'Hello',
      谢谢: 'Thank you',
      再见: 'Goodbye',
    }
    return examples[text] || 'This is a formal translation of your input text.'
  }

  // 获取地道口语翻译
  const getCasualTranslation = (text: string): string => {
    const examples: Record<string, string> = {
      '我想去咖啡店买一杯拿铁，但是我不知道怎么用英语点餐。':
        "Hey, I'd like to grab a latte from the coffee shop, but I'm not sure how to order it in English.",
      你好: 'Hey there!',
      谢谢: 'Thanks!',
      再见: 'See ya!',
    }
    return examples[text] || 'This is a casual translation of your input text.'
  }

  // 播放语音
  const handlePlayAudio = safeEventHandler(() => {
    Taro.showToast({ title: '语音播放功能开发中', icon: 'none' })
  }, 'play-audio')

  // 复制文本
  const handleCopyText = safeEventHandler((text: string) => {
    Taro.setClipboardData({
      data: text,
      success: () => {
        Taro.showToast({ title: '已复制', icon: 'success' })
      },
    })
  }, 'copy-text')

  // 收藏功能
  const handleFavorite = safeEventHandler(() => {
    Taro.showToast({ title: '已收藏', icon: 'success' })
  }, 'favorite')

  return (
    <View className="page-container">
      <CustomNavBar
        title="智能翻译"
        backgroundColor="#4A90E2"
        renderRight={
          <View onClick={handleHistoryClick}>
            <AtIcon value="clock" size="22" color="white" />
          </View>
        }
      />
      <View className="content-area translate-page">
        {/* 输入区域 */}
        <View className="input-section">
          <Text className="section-title">输入中文</Text>
          <Textarea
            className="input-textarea"
            value={inputText}
            onInput={e => setInputText(e.detail.value)}
            placeholder="我想去咖啡店买一杯拿铁，但是我不知道怎么用英语点餐。"
            maxlength={500}
            showConfirmBar={false}
          />

          {/* 输入功能按钮 */}
          <View className="input-actions">
            <View className="action-btns">
              <View className="action-btn voice" onClick={handleVoiceInput}>
                <AtIcon value="sound" size="16" color="white" />
                <Text className="btn-text">语音输入</Text>
              </View>
              <View className="action-btn photo" onClick={handlePhotoInput}>
                <AtIcon value="camera" size="16" color="white" />
                <Text className="btn-text">拍照识别</Text>
              </View>
            </View>

            <AtButton
              type="primary"
              size="normal"
              loading={isTranslating}
              onClick={handleTranslate}
              disabled={!inputText.trim()}
              className="translate-btn"
            >
              {isTranslating ? '翻译中...' : '翻译'}
            </AtButton>
          </View>
        </View>

        {/* 翻译结果 */}
        {translationResult && (
          <View className="result-section">
            <View className="result-tabs">
              <View
                className={`tab-item ${activeTranslationType === 'formal' ? 'active' : ''}`}
                onClick={() => setActiveTranslationType('formal')}
              >
                <Text className="tab-text">标准翻译</Text>
              </View>
              <View
                className={`tab-item ${activeTranslationType === 'casual' ? 'active' : ''}`}
                onClick={() => setActiveTranslationType('casual')}
              >
                <Text className="tab-text">地道口语</Text>
              </View>
            </View>

            <View className="result-content">
              <View className="result-header">
                <Text className="result-text">
                  {activeTranslationType === 'formal'
                    ? translationResult.formal
                    : translationResult.casual}
                </Text>
                <View className="result-actions">
                  <View className="result-btn" onClick={handlePlayAudio}>
                    <AtIcon value="play" size="16" color="#6366f1" />
                  </View>
                  <View
                    className="result-btn"
                    onClick={() =>
                      handleCopyText(
                        activeTranslationType === 'formal'
                          ? translationResult.formal
                          : translationResult.casual
                      )
                    }
                  >
                    <AtIcon value="copy" size="16" color="#6366f1" />
                  </View>
                  <View className="result-btn" onClick={handleFavorite}>
                    <AtIcon value="heart" size="16" color="#6366f1" />
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 实用短语推荐 */}
        <View className="phrases-section">
          <Text className="section-title">实用短语</Text>
          <View className="phrases-list">
            {usefulPhrases.map((phrase, index) => (
              <View
                key={index}
                className="phrase-item"
                onClick={() => setInputText(phrase.chinese)}
              >
                <Text className="phrase-chinese">{phrase.chinese}</Text>
                <Text className="phrase-english">{phrase.english}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  )
}

export default withPageErrorBoundary(TranslatePage, {
  pageName: '智能翻译',
  enableErrorReporting: true,
  showRetry: true,
  onError: (error, errorInfo) => {
    console.log('智能翻译页面发生错误:', error, errorInfo)
  },
})

import React, { useState, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import CustomNavBar from '@/components/common/CustomNavBar'
import IconFont from '@/components/IconFont'
import Button from '@/components/common/Button'
import Loading from '@/components/common/Loading'
import {
  useStudyWordDetail,
  useToggleWordFavorite,
  useSubmitStudyRecord,
} from '@/hooks/useApiQueries'
import { useVocabularyStudyStore } from '@/stores'
import type { WordKnowledgeLevel } from '@/types'
import './index.scss'

const WordDetail = () => {
  const router = useRouter()
  const { wordId } = router.params
  const [selectedLevel, setSelectedLevel] =
    useState<WordKnowledgeLevel>('unknown')
  const [isPlaying, setIsPlaying] = useState<'us' | 'uk' | null>(null)

  // Hooks
  const {
    data: wordDetail,
    isLoading,
    error,
  } = useStudyWordDetail(wordId || '')
  const toggleWordFavorite = useToggleWordFavorite()
  const submitStudyRecord = useSubmitStudyRecord()
  const { toggleWordFavorite: toggleLocalFavorite, updateWordKnowledgeLevel } =
    useVocabularyStudyStore()

  // 播放发音
  const handlePlayPronunciation = useCallback(
    async (type: 'us' | 'uk') => {
      if (!wordDetail?.audioUrl) return

      setIsPlaying(type)
      try {
        const audioUrl =
          type === 'us' ? wordDetail.audioUrl.us : wordDetail.audioUrl.uk
        // 模拟音频播放
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log(`Playing ${type} pronunciation:`, audioUrl)
      } catch (error) {
        console.error('播放音频失败:', error)
        Taro.showToast({
          title: '播放失败',
          icon: 'error',
        })
      } finally {
        setIsPlaying(null)
      }
    },
    [wordDetail]
  )

  // 切换收藏状态
  const handleToggleFavorite = useCallback(async () => {
    if (!wordDetail) return

    const newFavoriteStatus = !wordDetail.isFavorited
    try {
      await toggleWordFavorite.mutateAsync({
        wordId: wordDetail.id,
        isFavorited: newFavoriteStatus,
      })

      // 更新本地状态
      toggleLocalFavorite(wordDetail.id, newFavoriteStatus)

      Taro.showToast({
        title: newFavoriteStatus ? '已收藏' : '已取消收藏',
        icon: 'success',
      })
    } catch (error) {
      console.error('收藏操作失败:', error)
      Taro.showToast({
        title: '操作失败，请重试',
        icon: 'error',
      })
    }
  }, [wordDetail, toggleWordFavorite, toggleLocalFavorite])

  // 提交学习记录
  const handleSubmitRecord = useCallback(
    async (knowledgeLevel: WordKnowledgeLevel) => {
      if (!wordDetail) return

      try {
        await submitStudyRecord.mutateAsync({
          wordId: wordDetail.id,
          knowledgeLevel,
          stage: wordDetail.stage,
          responseTime: (Date.now() % 5000) + 1000, // 1-6秒反应时间
        })

        // 更新本地状态，触发数据联动
        updateWordKnowledgeLevel(wordDetail.id, knowledgeLevel)

        Taro.showToast({
          title: '已记录学习状态',
          icon: 'success',
        })

        // 延迟返回
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      } catch (error) {
        console.error('提交学习记录失败:', error)
        Taro.showToast({
          title: '记录失败，请重试',
          icon: 'error',
        })
      }
    },
    [wordDetail, submitStudyRecord, updateWordKnowledgeLevel]
  )

  // 获取阶段显示文本
  const getStageText = useCallback((stage: string) => {
    const stageMap: Record<string, string> = {
      beginner: '萌芽期',
      foundation: '基础期',
      development: '发展期',
      acceleration: '加速期',
      mastery: '精通期',
      expert: '大师期',
    }
    return stageMap[stage] || stage
  }, [])

  // 获取知识等级文本和颜色
  const getLevelInfo = useCallback((level: WordKnowledgeLevel) => {
    const levelMap = {
      known: { text: '认识', color: '#52c41a', bg: '#f6ffed' },
      vague: { text: '模糊', color: '#faad14', bg: '#fffbe6' },
      unknown: { text: '不认识', color: '#ff4d4f', bg: '#fff2f0' },
    }
    return levelMap[level]
  }, [])

  if (isLoading) {
    return (
      <View className="word-detail-page">
        <CustomNavBar title="单词详情" />
        <View className="loading-container">
          <Loading />
        </View>
      </View>
    )
  }

  if (error || !wordDetail) {
    return (
      <View className="word-detail-page">
        <CustomNavBar title="单词详情" />
        <View className="error-container">
          <Text className="error-text">加载失败，请重试</Text>
          <Button onClick={() => Taro.navigateBack()}>返回</Button>
        </View>
      </View>
    )
  }

  return (
    <View className="word-detail-page">
      <CustomNavBar
        title="单词详情"
        backgroundColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      />

      <ScrollView scrollY className="page-content">
        {/* 单词头部 */}
        <View className="word-header">
          <View className="word-main">
            <Text className="word-text">{wordDetail.word}</Text>
            <Text className="word-meaning">
              {wordDetail.partOfSpeech}. {wordDetail.meaning}
            </Text>
            <View className="stage-info">
              <Text className="stage-text">
                {getStageText(wordDetail.stage)}
              </Text>
            </View>
          </View>
          <View className="favorite-action">
            <IconFont
              name="star"
              size={28}
              color={wordDetail.isFavorited ? '#ffd700' : '#d0d7de'}
              onClick={handleToggleFavorite}
              className="favorite-icon"
            />
          </View>
        </View>

        {/* 发音区域 */}
        <View className="pronunciation-section">
          <Text className="section-title">发音</Text>
          <View className="pronunciation-list">
            <View className="pronunciation-item">
              <Text className="region">英</Text>
              <Text className="phonetic">{wordDetail.pronunciation.uk}</Text>
              <View
                className={`play-button ${isPlaying === 'uk' ? 'playing' : ''}`}
                onClick={() => handlePlayPronunciation('uk')}
              >
                <IconFont
                  name={isPlaying === 'uk' ? 'loading' : 'play'}
                  size={16}
                  color="#667eea"
                />
              </View>
            </View>
            <View className="pronunciation-item">
              <Text className="region">美</Text>
              <Text className="phonetic">{wordDetail.pronunciation.us}</Text>
              <View
                className={`play-button ${isPlaying === 'us' ? 'playing' : ''}`}
                onClick={() => handlePlayPronunciation('us')}
              >
                <IconFont
                  name={isPlaying === 'us' ? 'loading' : 'play'}
                  size={16}
                  color="#667eea"
                />
              </View>
            </View>
          </View>
        </View>

        {/* 例句区域 */}
        <View className="example-section">
          <Text className="section-title">例句</Text>
          <View className="example-content">
            <Text className="example-english">
              {wordDetail.example.english
                .split(wordDetail.word)
                .map((part, index) => (
                  <React.Fragment key={index}>
                    {part}
                    {index <
                      wordDetail.example.english.split(wordDetail.word).length -
                        1 && (
                      <Text className="highlight">{wordDetail.word}</Text>
                    )}
                  </React.Fragment>
                ))}
            </Text>
            <Text className="example-chinese">
              {wordDetail.example.chinese}
            </Text>
          </View>
        </View>

        {/* 学习状态选择 */}
        <View className="knowledge-section">
          <Text className="section-title">你对这个单词的认识程度</Text>
          <View className="knowledge-options">
            {(['known', 'vague', 'unknown'] as const).map(level => {
              const levelInfo = getLevelInfo(level)
              return (
                <View
                  key={level}
                  className={`knowledge-option ${selectedLevel === level ? 'selected' : ''}`}
                  style={{
                    backgroundColor:
                      selectedLevel === level ? levelInfo.bg : '#f8f9fa',
                    borderColor:
                      selectedLevel === level ? levelInfo.color : '#e9ecef',
                  }}
                  onClick={() => setSelectedLevel(level)}
                >
                  <Text
                    className="option-text"
                    style={{
                      color:
                        selectedLevel === level ? levelInfo.color : '#6c757d',
                    }}
                  >
                    {levelInfo.text}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* 提交按钮 */}
        <View className="submit-section">
          <Button
            type="primary"
            size="large"
            loading={submitStudyRecord.isPending}
            onClick={() => handleSubmitRecord(selectedLevel)}
            className="submit-button"
          >
            记录学习状态
          </Button>
        </View>
      </ScrollView>
    </View>
  )
}

export default WordDetail

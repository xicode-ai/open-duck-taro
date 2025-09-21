import React, { useEffect, useState, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import CustomNavBar from '@/components/common/CustomNavBar'
import IconFont from '@/components/IconFont'
import Loading from '@/components/common/Loading'
import AnimatedNumber from '@/components/common/AnimatedNumber'
import {
  useStudyWordsByStage,
  useDailyProgress,
  useSubmitStudyRecord,
  useToggleWordFavorite,
  useStudyWordDetail,
} from '@/hooks/useApiQueries'
import { useVocabularyStudyStore } from '@/stores'
import type { WordKnowledgeLevel } from '@/types'
import './index.scss'

const VocabularyStudy = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)

  // 从路由参数获取学习阶段和单词ID
  const stage = router.params.stage || 'beginner'
  const stageName = router.params.stageName || '萌芽期'
  const wordId = router.params.wordId // 从历史记录跳转时的单词ID

  // React Query hooks
  const { data: stageWordsData, isLoading: isLoadingWords } =
    useStudyWordsByStage(stage)
  const { data: dailyProgress, isLoading: isLoadingProgress } =
    useDailyProgress()
  const { data: specificWordDetail, isLoading: isLoadingSpecificWord } =
    useStudyWordDetail(wordId || '') // 从历史记录跳转时获取指定单词
  const submitStudyRecord = useSubmitStudyRecord()
  const toggleWordFavorite = useToggleWordFavorite()

  // Zustand store
  const {
    currentWord,
    currentWordIndex,
    dailyProgress: storedProgress,
    setCurrentWord,
    setCurrentWordIndex,
    setTotalWords,
    setDailyProgress,
    submitStudyRecord: storeSubmitStudyRecord,
    toggleWordFavorite: storeToggleWordFavorite,
    startStudySession,
    isCurrentWordFavorited,
  } = useVocabularyStudyStore()

  // 初始化学习会话
  useEffect(() => {
    if (stage) {
      startStudySession(stage)
    }
  }, [stage, startStudySession])

  // 加载单词数据
  useEffect(() => {
    // 如果从历史记录跳转，直接使用指定的单词
    if (wordId && specificWordDetail) {
      setCurrentWord(specificWordDetail)
      setTotalWords(1) // 单个单词学习模式
      setCurrentWordIndex(0)
      return
    }

    // 正常的阶段学习模式
    if (stageWordsData?.words && stageWordsData.words.length > 0) {
      setTotalWords(stageWordsData.words.length)

      // 设置当前索引的单词为当前单词
      if (currentWordIndex < stageWordsData.words.length) {
        setCurrentWord(stageWordsData.words[currentWordIndex])
      }
    }
  }, [
    wordId,
    specificWordDetail,
    stageWordsData,
    currentWordIndex,
    setTotalWords,
    setCurrentWord,
    setCurrentWordIndex,
  ])

  // 加载今日进度数据
  useEffect(() => {
    if (dailyProgress) {
      setDailyProgress(dailyProgress)
    }
  }, [dailyProgress, setDailyProgress])

  // 切换到下一个单词
  const moveToNextWord = useCallback(() => {
    // 如果是从历史记录跳转（单个单词模式），直接返回
    if (wordId && specificWordDetail) {
      Taro.navigateBack()
      return
    }

    if (!stageWordsData?.words) return

    const nextIndex = currentWordIndex + 1
    if (nextIndex < stageWordsData.words.length) {
      setCurrentWordIndex(nextIndex)
      setCurrentWord(stageWordsData.words[nextIndex])
    } else {
      // 学习完成
      Taro.showModal({
        title: '恭喜！',
        content: '本阶段单词学习完成！',
        showCancel: false,
        success: () => {
          Taro.navigateBack()
        },
      })
    }
  }, [
    wordId,
    specificWordDetail,
    stageWordsData,
    currentWordIndex,
    setCurrentWordIndex,
    setCurrentWord,
  ])

  // 处理认识程度按钮点击
  const handleKnowledgeLevel = useCallback(
    async (level: WordKnowledgeLevel) => {
      if (!currentWord || isSubmitting) return

      setIsSubmitting(true)

      try {
        // 记录反应时间（模拟）
        const responseTime = Math.floor(Math.random() * 3000) + 1000

        // 提交到服务器
        await submitStudyRecord.mutateAsync({
          wordId: currentWord.id,
          knowledgeLevel: level,
          stage: stage,
          responseTime,
        })

        // 更新本地状态
        storeSubmitStudyRecord(currentWord.id, level, responseTime)

        // 显示反馈
        const messages = {
          unknown: '继续努力！多练习会掌握的',
          vague: '还不错！继续巩固一下',
          known: '很棒！掌握了一个新单词',
        }

        Taro.showToast({
          title: messages[level],
          icon: 'success',
          duration: 1500,
        })

        // 延迟切换到下一个单词
        setTimeout(() => {
          moveToNextWord()
        }, 1500)
      } catch (error) {
        console.error('提交学习记录失败:', error)
        Taro.showToast({
          title: '提交失败，请重试',
          icon: 'error',
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      currentWord,
      stage,
      submitStudyRecord,
      storeSubmitStudyRecord,
      isSubmitting,
      moveToNextWord,
    ]
  )

  // 处理收藏按钮点击
  const handleToggleFavorite = useCallback(async () => {
    if (!currentWord) return

    const newFavoriteStatus = !isCurrentWordFavorited()

    try {
      await toggleWordFavorite.mutateAsync({
        wordId: currentWord.id,
        isFavorited: newFavoriteStatus,
      })

      storeToggleWordFavorite(currentWord.id, newFavoriteStatus)

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
  }, [
    currentWord,
    isCurrentWordFavorited,
    toggleWordFavorite,
    storeToggleWordFavorite,
  ])

  // 处理历史按钮点击
  const handleHistoryClick = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/vocabulary-history/index',
    })
  }, [])

  // 播放音频
  const handlePlayAudio = useCallback(
    (audioId: string, _text: string) => {
      if (playingAudio === audioId) {
        // 停止播放
        setPlayingAudio(null)
        Taro.showToast({
          title: '已停止播放',
          icon: 'success',
        })
      } else {
        // 开始播放
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
    },
    [playingAudio]
  )

  // 获取当前显示的进度数据
  const displayProgress = storedProgress ||
    dailyProgress || {
      date: new Date().toISOString().split('T')[0],
      knownCount: 0,
      vagueCount: 0,
      unknownCount: 0,
      totalStudied: 0,
      continuousDays: 0,
      targetWords: 20,
    }

  // 点击进度数字跳转到历史页面
  const handleProgressClick = useCallback(
    (knowledgeLevel: 'known' | 'vague' | 'unknown') => {
      Taro.navigateTo({
        url: `/pages/vocabulary-history/index?knowledgeLevel=${knowledgeLevel}`,
      })
    },
    []
  )

  // 加载状态
  if (isLoadingWords || isLoadingProgress || isLoadingSpecificWord) {
    return (
      <View className="vocabulary-study-page">
        <CustomNavBar
          title={`背单词 - ${stageName}`}
          backgroundColor="#f56c6c"
        />
        <Loading />
      </View>
    )
  }

  // 无数据状态
  if (!currentWord) {
    return (
      <View className="vocabulary-study-page">
        <CustomNavBar
          title={`背单词 - ${stageName}`}
          backgroundColor="#f56c6c"
        />
        <View className="page-content">
          <View className="empty-state">
            <Text>暂无单词数据</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className="vocabulary-study-page">
      <CustomNavBar
        title={`背单词 - ${stageName}`}
        backgroundColor="linear-gradient(135deg, #ef5350 0%, #e53935 100%)"
        renderRight={
          <View className="nav-right-btn" onClick={handleHistoryClick}>
            <AtIcon value="clock" size="20" color="#fff" />
          </View>
        }
      />

      <View className="page-content">
        {/* Word Card */}
        <View className="word-card">
          <View className="word-header">
            <Text className="word-text">{currentWord.word}</Text>
            <View
              className={`favorite-button ${isCurrentWordFavorited() ? 'favorited' : ''}`}
              onClick={handleToggleFavorite}
            >
              <AtIcon
                value={isCurrentWordFavorited() ? 'star-2' : 'star'}
                size={18}
                color={isCurrentWordFavorited() ? '#FFD700' : '#cccccc'}
              />
            </View>
          </View>
          <Text className="word-definition">
            {currentWord.partOfSpeech}. {currentWord.meaning}
          </Text>
          <View className="pronunciation">
            <Text className="region">英</Text>
            <Text className="phonetic">{currentWord.pronunciation.uk}</Text>
            <View
              className={`play-button ${playingAudio === 'uk-audio' ? 'playing' : ''}`}
              onClick={() =>
                handlePlayAudio('uk-audio', currentWord.pronunciation.uk)
              }
            >
              <AtIcon
                value="volume-plus"
                size={20}
                color={playingAudio === 'uk-audio' ? '#fff' : '#2196F3'}
              />
            </View>
            <Text className="region" style={{ marginLeft: '20px' }}>
              美
            </Text>
            <Text className="phonetic">{currentWord.pronunciation.us}</Text>
            <View
              className={`play-button ${playingAudio === 'us-audio' ? 'playing' : ''}`}
              onClick={() =>
                handlePlayAudio('us-audio', currentWord.pronunciation.us)
              }
            >
              <AtIcon
                value="volume-plus"
                size={20}
                color={playingAudio === 'us-audio' ? '#fff' : '#2196F3'}
              />
            </View>
          </View>
          <View className="example-sentence">
            <Text className="sentence">
              {currentWord.example.english
                .split(currentWord.word)
                .map((part, index) => (
                  <React.Fragment key={index}>
                    {part}
                    {index <
                      currentWord.example.english.split(currentWord.word)
                        .length -
                        1 && (
                      <Text className="highlight">{currentWord.word}</Text>
                    )}
                  </React.Fragment>
                ))}
            </Text>
            <Text className="translation">{currentWord.example.chinese}</Text>
          </View>
        </View>

        {/* Recognition Buttons */}
        <View className="recognition-controls">
          <View
            className={`control-button unknown ${isSubmitting ? 'disabled' : ''}`}
            onClick={() => handleKnowledgeLevel('unknown')}
          >
            <IconFont name="close" size={24} color="#f56c6c" />
            <Text>不认识</Text>
          </View>
          <View
            className={`control-button vague ${isSubmitting ? 'disabled' : ''}`}
            onClick={() => handleKnowledgeLevel('vague')}
          >
            <Text className="vague-icon">?</Text>
            <Text>模糊</Text>
          </View>
          <View
            className={`control-button known ${isSubmitting ? 'disabled' : ''}`}
            onClick={() => handleKnowledgeLevel('known')}
          >
            <IconFont name="check" size={24} color="#67c23a" />
            <Text>认识</Text>
          </View>
        </View>

        {/* Study Progress */}
        <View className="progress-card">
          <Text className="progress-title">今日学习进度</Text>
          <View className="progress-stats">
            <View
              className="stat-item clickable"
              onClick={() => handleProgressClick('unknown')}
            >
              <AnimatedNumber
                value={displayProgress.unknownCount}
                className="stat-value"
                style={{ color: '#ff4d4f' }}
                duration={1000}
                easing="easeOutBounce"
              />
              <Text className="stat-label">不认识</Text>
            </View>
            <View
              className="stat-item clickable"
              onClick={() => handleProgressClick('vague')}
            >
              <AnimatedNumber
                value={displayProgress.vagueCount}
                className="stat-value"
                style={{ color: '#faad14' }}
                duration={1200}
                easing="easeOutBounce"
              />
              <Text className="stat-label">模糊</Text>
            </View>
            <View
              className="stat-item clickable"
              onClick={() => handleProgressClick('known')}
            >
              <AnimatedNumber
                value={displayProgress.knownCount}
                className="stat-value"
                style={{ color: '#52c41a' }}
                duration={1500}
                easing="easeOutBounce"
              />
              <Text className="stat-label">认识</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export default VocabularyStudy

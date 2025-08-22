import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import { useUserStore } from '../../stores/user'
import './index.scss'

interface Dialogue {
  id: string
  speaker: 'A' | 'B'
  english: string
  chinese: string
  audioUrl?: string
}

interface TopicData {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  dialogues: Dialogue[]
  totalDialogues: number
  estimatedTime: number
}

const TopicChatPage = () => {
  const { updateDailyUsage } = useUserStore()

  // 状态管理
  const [topicData, setTopicData] = useState<TopicData | null>(null)
  const [currentMode, setCurrentMode] = useState<'study' | 'practice'>('study')
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [completedDialogues, setCompletedDialogues] = useState<string[]>([])
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])

  // 页面初始化
  useEffect(() => {
    // 从路由参数获取话题ID和标题
    const instance = Taro.getCurrentInstance()
    const { topicId, topicTitle } = instance.router?.params || {}

    if (topicId && topicTitle) {
      loadTopicData(topicId, decodeURIComponent(topicTitle))
    } else {
      // 如果没有参数，返回话题列表
      Taro.navigateBack()
    }
  }, [])

  // 加载话题数据
  const loadTopicData = async (topicId: string, topicTitle: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 模拟话题数据
      const mockTopicData: TopicData = {
        id: topicId,
        title: topicTitle,
        description: '在咖啡厅的日常对话场景，学习点餐和闲聊的表达方式',
        difficulty: 'easy',
        totalDialogues: 8,
        estimatedTime: 15,
        dialogues: [
          {
            id: '1',
            speaker: 'A',
            english: 'Good morning! What can I get for you today?',
            chinese: '早上好！今天要点什么？',
          },
          {
            id: '2',
            speaker: 'B',
            english: "I'd like a large coffee with milk, please.",
            chinese: '我要一大杯加奶的咖啡，谢谢。',
          },
          {
            id: '3',
            speaker: 'A',
            english: 'Would you like anything else? We have fresh pastries.',
            chinese: '还需要别的吗？我们有新鲜的糕点。',
          },
          {
            id: '4',
            speaker: 'B',
            english: 'That sounds great! What do you recommend?',
            chinese: '听起来不错！你推荐什么？',
          },
          {
            id: '5',
            speaker: 'A',
            english: 'Our chocolate croissant is very popular.',
            chinese: '我们的巧克力牛角包很受欢迎。',
          },
          {
            id: '6',
            speaker: 'B',
            english: "Perfect! I'll take one of those too.",
            chinese: '太好了！我也要一个。',
          },
          {
            id: '7',
            speaker: 'A',
            english: 'Great choice! That will be $8.50 total.',
            chinese: '很好的选择！总共8.50美元。',
          },
          {
            id: '8',
            speaker: 'B',
            english: 'Here you go. Thank you so much!',
            chinese: '给你。非常感谢！',
          },
        ],
      }

      setTopicData(mockTopicData)
    } catch (_error) {
      console.error('加载话题数据失败:', _error)
      Taro.showToast({
        title: '加载失败',
        icon: 'error',
      })
    }
  }

  // 播放音频
  const playAudio = (dialogueId: string) => {
    if (playingAudio === dialogueId) {
      // 停止播放
      setPlayingAudio(null)
      Taro.stopBackgroundAudio()
    } else {
      // 开始播放
      setPlayingAudio(dialogueId)

      // 模拟音频播放
      setTimeout(() => {
        setPlayingAudio(null)
      }, 3000)

      Taro.showToast({
        title: '播放中',
        icon: 'none',
      })
    }
  }

  // 开始录音练习
  const startRecording = async () => {
    try {
      const { authSetting } = await Taro.getSetting()

      if (!authSetting['scope.record']) {
        await Taro.authorize({ scope: 'scope.record' })
      }

      setIsRecording(true)
      updateDailyUsage('practice')

      // 模拟录音3秒后自动停止
      setTimeout(() => {
        setIsRecording(false)

        Taro.showToast({
          title: '练习完成',
          icon: 'success',
        })

        // 标记当前对话为已完成
        if (topicData) {
          const currentDialogue = topicData.dialogues[currentDialogueIndex]
          if (
            currentDialogue &&
            !completedDialogues.includes(currentDialogue.id)
          ) {
            setCompletedDialogues([...completedDialogues, currentDialogue.id])
          }
        }
      }, 3000)
    } catch (_error) {
      setIsRecording(false)
      Taro.showModal({
        title: '需要录音权限',
        content: '请在设置中开启录音权限',
        showCancel: false,
      })
    }
  }

  // 下一个对话
  const nextDialogue = () => {
    if (!topicData) return

    if (currentDialogueIndex < topicData.dialogues.length - 1) {
      setCurrentDialogueIndex(currentDialogueIndex + 1)
    } else {
      // 完成所有对话
      setShowCompletionModal(true)
    }
  }

  // 跳过当前对话
  const skipDialogue = () => {
    nextDialogue()
  }

  // 收藏对话
  const toggleFavorite = (dialogueId: string) => {
    if (favorites.includes(dialogueId)) {
      setFavorites(favorites.filter(id => id !== dialogueId))
    } else {
      setFavorites([...favorites, dialogueId])
    }
  }

  // 重新开始练习
  const restartPractice = () => {
    setCurrentDialogueIndex(0)
    setCompletedDialogues([])
    setShowCompletionModal(false)
  }

  // 继续学习
  const continueLearning = () => {
    setShowCompletionModal(false)
    Taro.navigateBack()
  }

  if (!topicData) {
    return (
      <View className="topic-chat-page">
        <View style={{ padding: '200rpx 0', textAlign: 'center' }}>
          <AtIcon value="loading-3" size="32" color="#10b981" />
          <Text
            style={{ display: 'block', marginTop: '20rpx', color: '#6b7280' }}
          >
            加载中...
          </Text>
        </View>
      </View>
    )
  }

  const currentDialogue = topicData.dialogues[currentDialogueIndex]
  const progress = Math.round(
    ((currentDialogueIndex + 1) / topicData.dialogues.length) * 100
  )

  return (
    <View className="topic-chat-page">
      {/* 话题头部信息 */}
      <View className="topic-header">
        <View className="header-content">
          <View className="topic-info">
            <Text className="topic-title">{topicData.title}</Text>
            <Text className="topic-desc">{topicData.description}</Text>
          </View>

          <View className="topic-stats">
            <View className="stat-item">
              <Text className="stat-number">{topicData.totalDialogues}</Text>
              <Text className="stat-label">对话数</Text>
            </View>
            <View className="stat-item">
              <Text className="stat-number">{topicData.estimatedTime}</Text>
              <Text className="stat-label">分钟</Text>
            </View>
            <View className="stat-item">
              <Text className="stat-number">{completedDialogues.length}</Text>
              <Text className="stat-label">已完成</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 主要内容区域 */}
      <View className="dialogue-container">
        {/* 模式切换 */}
        <View className="dialogue-mode-tabs">
          <View
            className={`mode-tab ${currentMode === 'study' ? 'active' : ''}`}
            onClick={() => setCurrentMode('study')}
          >
            学习模式
          </View>
          <View
            className={`mode-tab ${currentMode === 'practice' ? 'active' : ''}`}
            onClick={() => setCurrentMode('practice')}
          >
            练习模式
          </View>
        </View>

        {/* 对话内容 */}
        <View className={`dialogue-content ${currentMode}-mode`}>
          <View className="dialogue-header">
            <Text className="dialogue-title">
              {currentMode === 'study' ? '完整对话' : '跟读练习'}
            </Text>
            <View className="dialogue-controls">
              <View
                className={`control-btn ${playingAudio ? 'playing' : ''}`}
                onClick={() => playAudio('all')}
              >
                <AtIcon value={playingAudio ? 'pause' : 'play'} />
              </View>
            </View>
          </View>

          {currentMode === 'study' ? (
            /* 学习模式 - 显示所有对话 */
            <View className="dialogue-list">
              {topicData.dialogues.map((dialogue, index) => (
                <View key={dialogue.id} className="dialogue-item">
                  <View className="speaker-info">
                    <Text className="speaker-label">
                      <View className="speaker-icon">{dialogue.speaker}</View>
                      {dialogue.speaker === 'A' ? '服务员' : '顾客'}
                    </Text>
                    <View
                      className={`play-audio ${playingAudio === dialogue.id ? 'playing' : ''}`}
                      onClick={() => playAudio(dialogue.id)}
                    >
                      <AtIcon
                        value={playingAudio === dialogue.id ? 'pause' : 'sound'}
                      />
                    </View>
                  </View>

                  <View className="dialogue-text">
                    <Text className="english-text">{dialogue.english}</Text>
                    <Text className="chinese-text">{dialogue.chinese}</Text>
                  </View>

                  <View className="dialogue-actions">
                    <View
                      className={`action-btn favorite-btn ${favorites.includes(dialogue.id) ? 'active' : ''}`}
                      onClick={() => toggleFavorite(dialogue.id)}
                    >
                      <AtIcon value="heart" />
                      <Text>收藏</Text>
                    </View>
                    <View
                      className="action-btn practice-btn"
                      onClick={() => {
                        setCurrentDialogueIndex(index)
                        setCurrentMode('practice')
                      }}
                    >
                      <AtIcon value="sound" />
                      <Text>练习</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            /* 练习模式 - 逐句练习 */
            <View className="practice-area">
              <View className="current-dialogue">
                <View className="role-indicator">
                  <View className="role-icon">{currentDialogue?.speaker}</View>
                  <Text>
                    {currentDialogue?.speaker === 'A' ? '服务员说:' : '顾客说:'}
                  </Text>
                </View>

                <View className="dialogue-text">
                  <Text className="english-text">
                    {currentDialogue?.english}
                  </Text>
                  <Text className="chinese-text">
                    {currentDialogue?.chinese}
                  </Text>
                </View>

                <View className="audio-controls">
                  <View
                    className={`play-btn ${playingAudio === currentDialogue?.id ? 'playing' : ''}`}
                    onClick={() =>
                      currentDialogue && playAudio(currentDialogue.id)
                    }
                  >
                    <AtIcon
                      value={
                        playingAudio === currentDialogue?.id ? 'pause' : 'play'
                      }
                    />
                  </View>

                  <View className="playback-info">
                    <Text className="speed-control">正常语速播放</Text>
                    <View className="progress-bar">
                      <View className="progress-fill"></View>
                    </View>
                  </View>
                </View>
              </View>

              <View className="practice-controls">
                <View className="recording-area">
                  <View
                    className={`record-btn ${isRecording ? 'recording' : ''}`}
                    onClick={startRecording}
                  >
                    <AtIcon value="sound" />
                  </View>
                  <Text className="record-hint">
                    {isRecording ? '录音中...' : '点击开始跟读练习'}
                  </Text>
                </View>

                <View className="action-buttons">
                  <View className="action-btn skip-btn" onClick={skipDialogue}>
                    跳过
                  </View>
                  <View className="action-btn next-btn" onClick={nextDialogue}>
                    下一个
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* 进度指示器 */}
        <View className="progress-indicator">
          <View className="progress-header">
            <Text className="progress-title">学习进度</Text>
            <Text className="progress-text">
              {currentDialogueIndex + 1} / {topicData.dialogues.length}
            </Text>
          </View>
          <View className="progress-bar">
            <View className="progress-fill" style={{ width: `${progress}%` }} />
          </View>
        </View>
      </View>

      {/* 完成弹窗 */}
      {showCompletionModal && (
        <View className="completion-modal">
          <View className="modal-content">
            <Text className="completion-icon">🎉</Text>
            <Text className="completion-title">恭喜完成！</Text>
            <Text className="completion-desc">
              你已经完成了《{topicData.title}》的所有对话练习！
            </Text>

            <View className="completion-stats">
              <View className="stat-item">
                <Text className="stat-number">
                  {topicData.dialogues.length}
                </Text>
                <Text className="stat-label">完成对话</Text>
              </View>
              <View className="stat-item">
                <Text className="stat-number">{completedDialogues.length}</Text>
                <Text className="stat-label">练习次数</Text>
              </View>
            </View>

            <View className="completion-actions">
              <View className="action-btn retry-btn" onClick={restartPractice}>
                重新练习
              </View>
              <View
                className="action-btn continue-btn"
                onClick={continueLearning}
              >
                继续学习
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default TopicChatPage

import React, { useState, useEffect, useRef } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import {
  useTopicDialogueDetail,
  useRecordDialogue,
  useToggleTopicFavorite,
  useToggleReferenceAnswer,
  useNextDialogue,
  useResetTopicPractice,
  useGetSystemResponse,
} from '@/hooks/useApiQueries'
import { useTopicChatStore } from '@/stores/topicChat'
import {
  shouldUseMockAudio,
  mockStartRecording,
  mockStopRecording,
} from '@/services/mockAudio'
import type { TopicDialogue, UserDialogue, AIDialogue } from '@/types'
import './index.scss'

interface TopicChatParams {
  topicId: string
  topicTitle?: string
  isCustom?: string
}

const TopicChatPage = () => {
  // 路由参数
  const [params, setParams] = useState<TopicChatParams | null>(null)

  // 录音状态
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDialogueId, setRecordingDialogueId] = useState<string | null>(
    null
  )
  const recordingTimer = useRef<NodeJS.Timeout | null>(null)

  // 音频播放状态
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)

  // 话题对话状态管理
  const {
    initializeTopicChat,
    markDialogueCompleted,
    setUserRecording,
    toggleReferenceAnswer: toggleLocalReferenceAnswer,
    goToNextDialoguePair: localGoToNextDialoguePair,
    resetTopicPractice: localResetTopicPractice,
    isDialogueCompleted,
    getReferenceAnswerState,
    getUserRecording,
    clearCurrentDialogueTurn,
  } = useTopicChatStore()

  // API Hooks
  const {
    data: topicDetailResponse,
    isLoading,
    error,
    refetch,
  } = useTopicDialogueDetail(params?.topicId || '')

  const topicDetail = topicDetailResponse?.data

  const recordDialogue = useRecordDialogue()
  const toggleFavorite = useToggleTopicFavorite()
  const toggleReference = useToggleReferenceAnswer()
  const nextDialogue = useNextDialogue()
  const resetPractice = useResetTopicPractice()
  const getSystemResponse = useGetSystemResponse()

  // 获取路由参数
  useEffect(() => {
    const router = Taro.getCurrentInstance().router
    if (router?.params) {
      const { topicId, topicTitle, isCustom } = router.params
      if (topicId) {
        setParams({ topicId, topicTitle, isCustom })
      }
    }
  }, [])

  // 设置导航栏标题
  useEffect(() => {
    if (params?.topicTitle) {
      Taro.setNavigationBarTitle({
        title: decodeURIComponent(params.topicTitle),
      })
    }
  }, [params?.topicTitle])

  // 初始化话题对话状态
  useEffect(() => {
    if (params?.topicId && topicDetail) {
      initializeTopicChat(params.topicId, topicDetail)
    }
  }, [params?.topicId, topicDetail, initializeTopicChat])

  // 播放音频
  const playAudio = async (audioUrl: string, dialogueId: string) => {
    try {
      setPlayingAudioId(dialogueId)

      // 检查是否使用Mock音频
      const useMock = shouldUseMockAudio()
      console.log('🔊 音频播放环境检测:', {
        useMock,
        audioUrl,
        env: process.env.TARO_ENV,
      })

      if (useMock || process.env.TARO_ENV === 'h5') {
        // Mock环境：模拟音频播放
        console.log('🔊 使用Mock音频播放功能')

        // 模拟不同音频的播放时长
        const duration = audioUrl.includes('1.mp3')
          ? 2000
          : audioUrl.includes('2.mp3')
            ? 3000
            : audioUrl.includes('3.mp3')
              ? 4000
              : 2500

        await new Promise(resolve => setTimeout(resolve, duration))

        Taro.showToast({
          title: '播放完成',
          icon: 'success',
          duration: 1000,
        })
      } else {
        // 真实环境：使用Taro播放音频
        const innerAudioContext = Taro.createInnerAudioContext()

        innerAudioContext.src = audioUrl
        innerAudioContext.onPlay(() => {
          console.log('🔊 开始播放')
        })

        innerAudioContext.onEnded(() => {
          console.log('🔊 播放结束')
          Taro.showToast({
            title: '播放完成',
            icon: 'success',
            duration: 1000,
          })
        })

        innerAudioContext.onError(err => {
          console.error('播放音频失败:', err)
          Taro.showToast({
            title: '播放失败',
            icon: 'error',
          })
        })

        innerAudioContext.play()

        // 等待播放结束（使用Promise包装）
        await new Promise((resolve, reject) => {
          innerAudioContext.onEnded(resolve)
          innerAudioContext.onError(reject)
        })

        innerAudioContext.destroy()
      }
    } catch (_error) {
      console.error('播放音频失败:', _error)
      Taro.showToast({
        title: '播放失败',
        icon: 'error',
      })
    } finally {
      setPlayingAudioId(null)
    }
  }

  // 开始录音
  const startRecording = async (dialogueId: string) => {
    // 防止重复录音
    if (isRecording) {
      console.log('⚠️ 已经在录音中，忽略请求')
      return
    }

    try {
      console.log('🎤 开始录音，对话ID:', dialogueId)

      // 清理任何可能的残留状态
      if (recordingTimer.current) {
        clearTimeout(recordingTimer.current)
        recordingTimer.current = null
      }

      // 同时设置两个状态，确保一致性
      setRecordingDialogueId(dialogueId)
      setIsRecording(true)

      // 检查是否使用Mock录音
      const useMock = shouldUseMockAudio()
      console.log('🎤 录音环境检测:', { useMock, env: process.env.TARO_ENV })

      if (useMock || process.env.TARO_ENV === 'h5') {
        console.log('🎤 使用Mock录音功能')
        await mockStartRecording()

        // 设置最大录音时长
        recordingTimer.current = setTimeout(() => {
          stopRecording()
        }, 10000) // 最多录音10秒
        return
      }

      // 真实环境录音权限检查
      const { authSetting } = await Taro.getSetting()
      if (!authSetting['scope.record']) {
        try {
          await Taro.authorize({ scope: 'scope.record' })
        } catch (_error) {
          // 权限被拒绝，重置状态
          setIsRecording(false)
          setRecordingDialogueId(null)
          Taro.showModal({
            title: '需要录音权限',
            content: '请在设置中开启录音权限以使用语音练习功能',
            showCancel: false,
          })
          return
        }
      }

      // 开始录音 (真实环境)
      Taro.startRecord({
        success: () => {
          console.log('录音开始')
        },
        fail: err => {
          console.error('录音失败', err)
          setIsRecording(false)
          setRecordingDialogueId(null)
          Taro.showToast({
            title: '录音失败，请重试',
            icon: 'error',
          })
        },
      })

      // 设置最大录音时长
      recordingTimer.current = setTimeout(() => {
        stopRecording()
      }, 10000) // 最多录音10秒
    } catch (_error) {
      console.error('开始录音失败:', _error)
      setIsRecording(false)
      setRecordingDialogueId(null)
      Taro.showToast({
        title: '录音失败',
        icon: 'error',
      })
    }
  }

  // 停止录音
  const stopRecording = async () => {
    if (!isRecording || !recordingDialogueId) return

    try {
      if (recordingTimer.current) {
        clearTimeout(recordingTimer.current)
        recordingTimer.current = null
      }

      setIsRecording(false)

      // 检查是否使用Mock录音
      const useMock = shouldUseMockAudio()

      if (useMock || process.env.TARO_ENV === 'h5') {
        console.log('🎤 Mock录音结束')
        const mockAudioData = await mockStopRecording()

        // 调用录音API处理
        if (params?.topicId) {
          const result = await recordDialogue.mutateAsync({
            topicId: params.topicId,
            dialogueId: recordingDialogueId,
            audioBlob: mockAudioData.audioUrl, // 使用audioUrl作为blob
            duration: mockAudioData.duration,
          })

          // 保存用户录音到本地状态
          if (result.data) {
            // 将RecordingResult转换为UserRecording格式
            const userRecording = {
              audioUrl: mockAudioData.audioUrl,
              duration: mockAudioData.duration,
              transcription: result.data.transcription,
              translation: result.data.translation,
              score: result.data.score,
            }
            setUserRecording(params.topicId, recordingDialogueId, userRecording)
            markDialogueCompleted(params.topicId, recordingDialogueId)
          }

          Taro.showToast({
            title: '录音完成',
            icon: 'success',
          })

          // 录音完成后，先显示录音结果，然后等待2秒触发系统回答和下一对对话
          setTimeout(async () => {
            await handleAfterRecordingComplete()
          }, 1500)
        }
      } else {
        // 真实环境停止录音
        Taro.stopRecord({
          success: async res => {
            console.log('录音结束', res)

            // 转换录音文件并调用API
            const audioBlob = 'mock-audio-blob' // 实际应该是录音文件
            if (params?.topicId) {
              const result = await recordDialogue.mutateAsync({
                topicId: params.topicId,
                dialogueId: recordingDialogueId,
                audioBlob,
                duration: 3,
              })

              // 保存用户录音到本地状态
              if (result.data) {
                // 将RecordingResult转换为UserRecording格式
                const userRecording = {
                  audioUrl: 'mock-audio-result.mp3',
                  duration: 3,
                  transcription: result.data.transcription,
                  translation: result.data.translation,
                  score: result.data.score,
                }
                setUserRecording(
                  params.topicId,
                  recordingDialogueId,
                  userRecording
                )
                markDialogueCompleted(params.topicId, recordingDialogueId)
              }

              Taro.showToast({
                title: '录音完成',
                icon: 'success',
              })

              // 录音完成后，先显示录音结果，然后等待2秒触发系统回答和下一对对话
              setTimeout(async () => {
                await handleAfterRecordingComplete()
              }, 1500)
            }
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
    } catch (_error) {
      console.error('处理录音失败:', _error)
      Taro.showToast({
        title: '处理录音失败',
        icon: 'error',
      })
    } finally {
      setRecordingDialogueId(null)
    }
  }

  // 切换收藏
  const handleToggleFavorite = async () => {
    if (!params?.topicId) return

    try {
      await toggleFavorite.mutateAsync(params.topicId)
      Taro.showToast({
        title: topicDetail?.isFavorited ? '已收藏' : '已取消收藏',
        icon: 'success',
      })
    } catch (_error) {
      console.error('切换收藏失败:', _error)
      Taro.showToast({
        title: '操作失败',
        icon: 'error',
      })
    }
  }

  // 切换参考答案
  const handleToggleReference = async (dialogueId: string) => {
    if (!params?.topicId) return

    try {
      // 先更新本地状态，提供UI的即时反馈
      toggleLocalReferenceAnswer(params.topicId, dialogueId)

      // 然后同步到服务端
      await toggleReference.mutateAsync({
        topicId: params.topicId,
        dialogueId,
      })
    } catch (_error) {
      console.error('切换参考答案失败:', _error)
      // 如果服务端失败，重新切换本地状态进行回滚
      toggleLocalReferenceAnswer(params.topicId, dialogueId)
      Taro.showToast({
        title: '操作失败',
        icon: 'error',
      })
    }
  }

  // 重新录音
  const handleRetryRecording = (dialogueId: string) => {
    if (!params?.topicId || !topicDetail) return

    try {
      console.log('🔄 [1/6] 开始重置录音状态，对话ID:', dialogueId)
      console.log('🔄 [2/6] 当前状态:', {
        isRecording,
        recordingDialogueId,
        dialogueId,
      })

      // 1. 先清除任何可能在运行的录音计时器
      if (recordingTimer.current) {
        clearTimeout(recordingTimer.current)
        recordingTimer.current = null
        console.log('🔄 [3/6] 录音计时器已清除')
      }

      // 2. 强制停止底层的录音管理器，这是最关键的一步
      // 无论UI状态如何，都确保硬件录音已停止
      if (process.env.TARO_ENV !== 'h5') {
        try {
          const recorderManager = Taro.getRecorderManager()
          recorderManager.stop()
          console.log('🔄 [4/6] 底层录音管理器已强制停止')
        } catch (e) {
          console.log('🔄 [4/6] 停止录音管理器时出错（可能未在录音）:', e)
        }
      }

      // 3. 立即重置所有录音相关的本地状态
      // 使用批量更新确保状态的一致性
      setIsRecording(false)
      setRecordingDialogueId(null)
      console.log('🔄 [5/6] 本地录音状态已重置')

      // 4. 清除Zustand store中的录音数据和完成状态
      // 这一步将移除用户录音结果，并触发UI更新
      // 使用 setTimeout 确保在下一帧执行，避免状态竞争
      setTimeout(() => {
        clearCurrentDialogueTurn(params.topicId, dialogueId, topicDetail)
        console.log('🔄 [6/6] Zustand状态已清除，UI已更新')

        // 验证最终状态
        console.log('🔄 最终验证 - 录音按钮应显示"开始跟读"状态')
      }, 0)

      // 6. 给出清晰的用户反馈
      Taro.showToast({
        title: '请重新录音',
        icon: 'none',
        duration: 1500,
      })
    } catch (error) {
      console.error('重置录音失败:', error)
      // 确保即使在发生错误时，状态也能得到重置
      setIsRecording(false)
      setRecordingDialogueId(null)

      // 清除计时器
      if (recordingTimer.current) {
        clearTimeout(recordingTimer.current)
        recordingTimer.current = null
      }

      Taro.showToast({
        title: '重置失败，请重试',
        icon: 'error',
      })
    }
  }

  // 录音完成后的处理流程
  const handleAfterRecordingComplete = async () => {
    if (!params?.topicId || !topicDetail || !recordingDialogueId) return

    try {
      console.log('🎙️ 开始处理录音完成后的流程')

      // 1. 先让用户看到录音结果（已经在录音完成时显示了）

      // 2. 等待一秒，让用户看清楚自己的录音结果
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 3. 显示系统回答生成过程
      Taro.showToast({
        title: '系统正在回答...',
        icon: 'loading',
        duration: 2500,
      })

      // 4. 调用系统回答接口
      const systemResponseResult = await getSystemResponse.mutateAsync({
        topicId: params.topicId,
        currentDialogueId: recordingDialogueId,
      })

      console.log('📢 系统回答结果:', systemResponseResult.data)

      // 5. 检查是否有系统回答
      if (systemResponseResult.data.hasResponse) {
        console.log('✅ 系统生成了回答，准备显示下一对对话')

        // 显示下一对对话（AI回答 + 下一个用户问题）
        localGoToNextDialoguePair(params.topicId, topicDetail)

        // 同步到服务端
        await nextDialogue.mutateAsync(params.topicId)

        Taro.showToast({
          title: '系统回答完成',
          icon: 'success',
          duration: 1500,
        })
      } else {
        console.log('🏁 对话已完成，无更多系统回答')
        Taro.showToast({
          title: '对话已完成',
          icon: 'success',
          duration: 1500,
        })
      }

      console.log('✅ 录音完成后的流程处理完毕')
    } catch (_error) {
      console.error('处理录音完成流程失败:', _error)
      Taro.showToast({
        title: '系统回答失败',
        icon: 'error',
      })
    }
  }

  // 下一个对话 (保留兼容性)
  const handleNextDialogue = async () => {
    if (!params?.topicId || !topicDetail) return

    try {
      // 更新本地显示状态
      localGoToNextDialoguePair(params.topicId, topicDetail)

      // 同步到服务端
      await nextDialogue.mutateAsync(params.topicId)
    } catch (_error) {
      console.error('切换对话失败:', _error)
      Taro.showToast({
        title: '操作失败',
        icon: 'error',
      })
    }
  }

  // 重新练习
  const handleResetPractice = async () => {
    if (!params?.topicId) return

    Taro.showModal({
      title: '重新练习',
      content: '确定要重新开始练习吗？当前进度将会丢失。',
      success: async res => {
        if (res.confirm) {
          try {
            // 先重置本地状态
            localResetTopicPractice(params.topicId)

            // 再同步到服务端
            await resetPractice.mutateAsync(params.topicId)

            Taro.showToast({
              title: '已重置练习',
              icon: 'success',
            })
          } catch (_error) {
            console.error('重置练习失败:', _error)
            Taro.showToast({
              title: '重置失败',
              icon: 'error',
            })
          }
        }
      },
    })
  }

  // 渲染星级
  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Text key={index} className={`star ${index < count ? '' : 'empty'}`}>
        ★
      </Text>
    ))
  }

  // 渲染AI对话
  const renderAIDialogue = (dialogue: AIDialogue) => (
    <View key={dialogue.id} className="dialogue-item ai-dialogue">
      <View className="dialogue-content">
        <View className="speaker-info">
          <View className="speaker-avatar">👤</View>
          <Text className="speaker-name">{dialogue.speakerName}</Text>
          {dialogue.audioUrl && (
            <>
              <View
                className="play-btn"
                onClick={() => playAudio(dialogue.audioUrl!, dialogue.id)}
              >
                {playingAudioId === dialogue.id ? (
                  <AtIcon value="loading-3" size="10" />
                ) : (
                  <AtIcon value="play" size="8" />
                )}
              </View>
              <Text className="duration">{dialogue.duration || 2}s</Text>
            </>
          )}
        </View>
        <View className="message-bubble">
          <Text className="english-text">{dialogue.english}</Text>
          <Text className="chinese-text">「{dialogue.chinese}」</Text>
        </View>
      </View>
    </View>
  )

  // 渲染用户对话
  const renderUserDialogue = (dialogue: UserDialogue) => {
    if (!params?.topicId) return null

    // 使用本地状态管理
    const localReferenceShow = getReferenceAnswerState(
      params.topicId,
      dialogue.id
    )
    const localUserRecording = getUserRecording(params.topicId, dialogue.id)
    const isCompleted = isDialogueCompleted(params.topicId, dialogue.id)

    return (
      <View key={dialogue.id} className="dialogue-item user-dialogue">
        <View className="dialogue-content">
          <View className="user-answer-section">
            <View className="section-header">
              <View className="user-avatar">😊</View>
              <Text className="section-title">你的回答</Text>
            </View>

            {/* 参考答案 */}
            {dialogue.referenceAnswer && (
              <View className="reference-section">
                <View className="reference-header">
                  <Text className="reference-title">参考答案</Text>
                  <View
                    className={`reference-toggle ${localReferenceShow ? 'show' : ''}`}
                    onClick={() => handleToggleReference(dialogue.id)}
                  >
                    <AtIcon value="eye" size="12" />
                    <Text>{localReferenceShow ? '隐藏' : '查看'}</Text>
                  </View>
                </View>

                {localReferenceShow && (
                  <View className="reference-answer">
                    <Text className="reference-text">
                      {dialogue.referenceAnswer.text}
                    </Text>
                    <Text className="reference-translation">
                      「{dialogue.chinese}」
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* 录音区域 */}
            {!localUserRecording && !isCompleted ? (
              <View className="recording-section">
                <View
                  className={`record-btn ${isRecording && recordingDialogueId === dialogue.id ? 'recording' : ''}`}
                  onClick={() => {
                    console.log('🎯 录音按钮点击，当前状态:', {
                      isRecording,
                      recordingDialogueId,
                      currentDialogueId: dialogue.id,
                      localUserRecording: !!localUserRecording,
                      isCompleted,
                    })

                    // 防止在其他对话录音时点击
                    if (isRecording && recordingDialogueId !== dialogue.id) {
                      console.log('⚠️ 其他对话正在录音中，忽略点击')
                      Taro.showToast({
                        title: '请先完成当前录音',
                        icon: 'none',
                      })
                      return
                    }

                    if (isRecording && recordingDialogueId === dialogue.id) {
                      stopRecording()
                    } else if (!isRecording) {
                      startRecording(dialogue.id)
                    }
                  }}
                >
                  <AtIcon value="sound" size="18" />
                  <Text className="btn-text">
                    {isRecording && recordingDialogueId === dialogue.id
                      ? '停止录音'
                      : '开始跟读'}
                  </Text>
                </View>
                <Text className="record-status">
                  {isRecording && recordingDialogueId === dialogue.id
                    ? '正在录音中...'
                    : '点击开始录音'}
                </Text>
              </View>
            ) : localUserRecording ? (
              /* 用户录音结果 */
              <View className="user-recording">
                <View className="recording-header">
                  <Text className="your-answer-label">你的回答</Text>
                  <View className="actions">
                    <View className="action-btn play">
                      <AtIcon value="play" size="10" />
                      <Text>播放</Text>
                    </View>
                    <View
                      className="action-btn retry"
                      onClick={() => {
                        console.log('🔄 点击重新录音按钮，对话ID:', dialogue.id)
                        handleRetryRecording(dialogue.id)
                      }}
                    >
                      <AtIcon value="reload" size="10" />
                      <Text>重新录音</Text>
                    </View>
                  </View>
                </View>

                <Text className="transcription">
                  {localUserRecording.transcription || '录音内容识别中...'}
                </Text>

                {localUserRecording.translation && (
                  <Text className="translation">
                    「{localUserRecording.translation}」
                  </Text>
                )}

                <View className="score-display">
                  <View className="score-item accuracy">
                    <Text className="score-label">识别准确度: </Text>
                    <Text className="score-value green">
                      {localUserRecording.score?.pronunciation || 0}%
                    </Text>
                  </View>

                  <View className="score-item rating">
                    <AtIcon value="star-2" size="12" color="#FCD34D" />
                    <Text className="score-label">发音评分: </Text>
                    <Text className="score-value orange">
                      {localUserRecording.score?.overallScore || 0}分
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    )
  }

  // 渲染对话内容
  const renderDialogue = (dialogue: TopicDialogue) => {
    if (dialogue.speaker === 'ai') {
      return renderAIDialogue(dialogue as AIDialogue)
    } else {
      return renderUserDialogue(dialogue as UserDialogue)
    }
  }

  // 渲染对话对（简化的成对渲染逻辑）
  const renderDialoguePairs = () => {
    if (!params?.topicId || !topicDetail) return null

    const renderedPairs: React.ReactNode[] = []
    const visibleIndex =
      useTopicChatStore.getState().visibleDialogueIndices[params.topicId] || 0

    // 按成对方式渲染所有应该显示的对话
    for (let i = 0; i <= visibleIndex; i++) {
      const dialogue = topicDetail.dialogues[i]
      if (!dialogue) continue

      // 如果是AI对话，检查是否有配对的用户对话
      if (
        dialogue.speaker === 'ai' &&
        i + 1 <= topicDetail.dialogues.length - 1
      ) {
        const userDialogue = topicDetail.dialogues[i + 1]

        if (
          userDialogue &&
          userDialogue.speaker === 'user' &&
          i + 1 <= visibleIndex
        ) {
          // 渲染AI + User对话对
          renderedPairs.push(
            <View
              key={`dialogue-pair-${dialogue.id}`}
              className="dialogue-pair"
            >
              {renderAIDialogue(dialogue as AIDialogue)}
              {renderUserDialogue(userDialogue as UserDialogue)}
            </View>
          )
          i++ // 跳过已处理的用户对话
          continue
        }
      }

      // 单独渲染（这种情况应该很少见）
      renderedPairs.push(
        <View key={`single-dialogue-${dialogue.id}`}>
          {renderDialogue(dialogue)}
        </View>
      )
    }

    return renderedPairs
  }

  // 检查是否完成当前对话
  const isCurrentDialogueCompleted = () => {
    if (!params?.topicId || !topicDetail) return false

    const currentDialogue =
      topicDetail.dialogues[topicDetail.currentDialogueIndex]
    if (!currentDialogue) return false

    // AI对话默认为完成
    if (currentDialogue.speaker === 'ai') return true

    // 用户对话检查本地状态
    return isDialogueCompleted(params.topicId, currentDialogue.id)
  }

  // 检查是否全部完成
  const isAllCompleted = () => {
    return (
      topicDetail &&
      topicDetail.currentDialogueIndex >= topicDetail.totalDialogues - 1 &&
      isCurrentDialogueCompleted()
    )
  }

  // 计算整体语音评分
  const getOverallScore = () => {
    if (!topicDetail) return null

    const userDialogues = topicDetail.dialogues
      .filter(
        (d): d is UserDialogue =>
          d.speaker === 'user' && !!(d as UserDialogue).userRecording
      )
      .map(d => d as UserDialogue)
      .filter(d => d.userRecording)

    if (userDialogues.length === 0) return null

    const totalScore = userDialogues.reduce(
      (sum, d) => sum + d.userRecording!.score.overallScore,
      0
    )
    const pronunciation = userDialogues.reduce(
      (sum, d) => sum + d.userRecording!.score.pronunciation,
      0
    )
    const fluency = userDialogues.reduce(
      (sum, d) => sum + d.userRecording!.score.fluency,
      0
    )
    const naturalness = userDialogues.reduce(
      (sum, d) => sum + d.userRecording!.score.naturalness,
      0
    )

    const avgScore = Math.round(totalScore / userDialogues.length)
    const avgPronunciation = Math.round(pronunciation / userDialogues.length)
    const avgFluency = Math.round(fluency / userDialogues.length)
    const avgNaturalness = Math.round(naturalness / userDialogues.length)
    const stars = Math.max(1, Math.min(5, Math.floor(avgScore / 20) + 1))

    return {
      overallScore: avgScore,
      pronunciation: avgPronunciation,
      fluency: avgFluency,
      naturalness: avgNaturalness,
      stars,
    }
  }

  if (!params?.topicId) {
    return (
      <View className="topic-chat-page">
        <View className="error">参数错误，请重新进入</View>
      </View>
    )
  }

  if (isLoading) {
    return (
      <View className="topic-chat-page">
        <View className="loading">加载中...</View>
      </View>
    )
  }

  if (error || !topicDetail) {
    return (
      <View className="topic-chat-page">
        <View className="error">
          加载失败，请重试
          <View className="action-btn secondary" onClick={() => refetch()}>
            重新加载
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className="topic-chat-page">
      {/* 头部进度 */}
      <View className="header">
        <View className="progress-info">
          <Text className="progress-text">
            {topicDetail.subtitle} · {topicDetail.progress}%
          </Text>
          <View
            className={`favorite-btn ${topicDetail.isFavorited ? 'active' : ''}`}
            onClick={handleToggleFavorite}
          >
            <AtIcon
              value={topicDetail.isFavorited ? 'heart-2' : 'heart'}
              size="16"
            />
          </View>
        </View>
        <View className="progress-bar">
          <View
            className="progress-fill"
            style={{ width: `${topicDetail.progress}%` }}
          />
        </View>
      </View>

      {/* 场景信息 */}
      <View className="scene-info">
        <View className="location">
          <Text className="location-icon">📍</Text>
          <Text className="location-text">{topicDetail.scene.location}</Text>
        </View>
        <Text className="description">{topicDetail.scene.description}</Text>
      </View>

      {/* 对话内容 */}
      <View className="dialogue-container">
        {params?.topicId && renderDialoguePairs()}
      </View>

      {/* 整体语音评分 */}
      {getOverallScore() && (
        <View className="overall-score-section">
          <View className="score-header">
            <Text className="score-icon">📊</Text>
            <Text className="score-title">语音评分</Text>
          </View>

          <View className="overall-score">
            <View className="score-stars">
              {renderStars(getOverallScore()!.stars)}
            </View>
            <Text className="score-text">
              {getOverallScore()!.overallScore}分
            </Text>
            <Text className="score-label">总体评分</Text>
          </View>

          <View className="score-breakdown">
            <View className="score-item">
              <Text className="label">发音准确度</Text>
              <View className="progress-container">
                <View
                  className="progress-bar pronunciation"
                  style={{ width: `${getOverallScore()!.pronunciation}%` }}
                />
              </View>
              <Text className="value">{getOverallScore()!.pronunciation}%</Text>
            </View>

            <View className="score-item">
              <Text className="label">语音流畅度</Text>
              <View className="progress-container">
                <View
                  className="progress-bar fluency"
                  style={{ width: `${getOverallScore()!.fluency}%` }}
                />
              </View>
              <Text className="value">{getOverallScore()!.fluency}%</Text>
            </View>

            <View className="score-item">
              <Text className="label">语调自然度</Text>
              <View className="progress-container">
                <View
                  className="progress-bar naturalness"
                  style={{ width: `${getOverallScore()!.naturalness}%` }}
                />
              </View>
              <Text className="value">{getOverallScore()!.naturalness}%</Text>
            </View>
          </View>
        </View>
      )}

      {/* 完成卡片 */}
      {isAllCompleted() && (
        <View className="completion-card">
          <Text className="completion-emoji">🎉</Text>
          <Text className="completion-title">太棒了！</Text>
          <Text className="completion-desc">
            你已经完成了这轮对话，表现很不错！
          </Text>
          <View className="next-topic-btn" onClick={handleNextDialogue}>
            <AtIcon value="arrow-right" size="14" />
            <Text>继续下一个对话</Text>
          </View>
        </View>
      )}

      {/* 底部操作栏 */}
      <View className="footer-actions">
        <View className="action-btn secondary" onClick={handleResetPractice}>
          <AtIcon value="reload" size="14" />
          <Text>重新练习</Text>
        </View>

        {!isAllCompleted() && isCurrentDialogueCompleted() && (
          <View className="action-btn primary" onClick={handleNextDialogue}>
            <Text>下一个对话</Text>
            <AtIcon value="chevron-right" size="14" />
          </View>
        )}
      </View>
    </View>
  )
}

export default TopicChatPage

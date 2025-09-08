import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TopicDialogueDetail, UserRecording } from '@/types'

// 话题对话状态接口
interface TopicChatState {
  // 当前话题ID
  currentTopicId: string | null

  // 用户完成的对话记录（按话题ID分组）
  completedDialogues: Record<string, Record<string, boolean>>

  // 用户录音记录（按话题ID分组）
  userRecordings: Record<string, Record<string, UserRecording | null>>

  // 参考答案显示状态（按话题ID分组）
  referenceAnswerStates: Record<string, Record<string, boolean>>

  // 当前显示的对话索引（按话题ID分组）
  visibleDialogueIndices: Record<string, number>

  // Actions
  setCurrentTopicId: (topicId: string | null) => void

  // 初始化话题对话状态
  initializeTopicChat: (
    topicId: string,
    topicDetail: TopicDialogueDetail
  ) => void

  // 标记对话完成
  markDialogueCompleted: (topicId: string, dialogueId: string) => void

  // 清除对话完成状态
  clearDialogueCompleted: (topicId: string, dialogueId: string) => void

  // 设置用户录音
  setUserRecording: (
    topicId: string,
    dialogueId: string,
    recording: UserRecording | null
  ) => void

  // 切换参考答案显示状态
  toggleReferenceAnswer: (topicId: string, dialogueId: string) => void

  // 设置可见对话索引
  setVisibleDialogueIndex: (topicId: string, index: number) => void

  // 进入下一个对话（系统和用户成对）
  goToNextDialoguePair: (
    topicId: string,
    topicDetail: TopicDialogueDetail
  ) => void

  // 重置话题练习
  resetTopicPractice: (topicId: string) => void

  // 检查对话是否完成
  isDialogueCompleted: (topicId: string, dialogueId: string) => boolean

  // 检查是否应该显示对话
  shouldShowDialogue: (topicId: string, dialogueIndex: number) => boolean

  // 获取参考答案显示状态
  getReferenceAnswerState: (topicId: string, dialogueId: string) => boolean

  // 获取用户录音
  getUserRecording: (
    topicId: string,
    dialogueId: string
  ) => UserRecording | null

  // 获取当前对话对的信息
  getCurrentDialoguePair: (
    topicId: string,
    topicDetail: TopicDialogueDetail
  ) => {
    aiDialogue: import('@/types').AIDialogue | null
    userDialogue: import('@/types').UserDialogue
    pairIndex: number
  } | null

  // 清除当前轮次对话（包括用户对话和相关系统回答）
  clearCurrentDialogueTurn: (
    topicId: string,
    dialogueId: string,
    topicDetail: TopicDialogueDetail
  ) => void
}

// 话题对话状态管理
export const useTopicChatStore = create<TopicChatState>()(
  persist(
    (set, get) => ({
      currentTopicId: null,
      completedDialogues: {},
      userRecordings: {},
      referenceAnswerStates: {},
      visibleDialogueIndices: {},

      setCurrentTopicId: (topicId: string | null) => {
        set({ currentTopicId: topicId })
      },

      initializeTopicChat: (
        topicId: string,
        topicDetail: TopicDialogueDetail
      ) => {
        const state = get()

        // 如果话题已经初始化过，不重新初始化
        if (state.visibleDialogueIndices[topicId] !== undefined) {
          return
        }

        // 找到第一个用户对话的索引，确保显示第一对对话（AI + User）
        const firstUserDialogueIndex = topicDetail.dialogues.findIndex(
          dialogue => dialogue.speaker === 'user'
        )

        // 确保显示第一个用户对话，这样系统对话和用户对话模块成对出现
        const initialVisibleIndex =
          firstUserDialogueIndex >= 0 ? firstUserDialogueIndex : 0

        set(state => ({
          visibleDialogueIndices: {
            ...state.visibleDialogueIndices,
            [topicId]: initialVisibleIndex,
          },
          completedDialogues: {
            ...state.completedDialogues,
            [topicId]: {},
          },
          userRecordings: {
            ...state.userRecordings,
            [topicId]: {},
          },
          referenceAnswerStates: {
            ...state.referenceAnswerStates,
            [topicId]: {},
          },
        }))
      },

      markDialogueCompleted: (topicId: string, dialogueId: string) => {
        set(state => ({
          completedDialogues: {
            ...state.completedDialogues,
            [topicId]: {
              ...state.completedDialogues[topicId],
              [dialogueId]: true,
            },
          },
        }))
      },

      clearDialogueCompleted: (topicId: string, dialogueId: string) => {
        set(state => ({
          completedDialogues: {
            ...state.completedDialogues,
            [topicId]: {
              ...state.completedDialogues[topicId],
              [dialogueId]: false,
            },
          },
        }))
      },

      setUserRecording: (
        topicId: string,
        dialogueId: string,
        recording: UserRecording | null
      ) => {
        set(state => {
          const updatedState = {
            ...state,
            userRecordings: {
              ...state.userRecordings,
              [topicId]: {
                ...state.userRecordings[topicId],
                [dialogueId]: recording,
              },
            },
          }

          // 自动标记为完成
          if (recording) {
            updatedState.completedDialogues = {
              ...state.completedDialogues,
              [topicId]: {
                ...state.completedDialogues[topicId],
                [dialogueId]: true,
              },
            }
          }

          return updatedState
        })
      },

      toggleReferenceAnswer: (topicId: string, dialogueId: string) => {
        set(state => ({
          referenceAnswerStates: {
            ...state.referenceAnswerStates,
            [topicId]: {
              ...state.referenceAnswerStates[topicId],
              [dialogueId]: !state.referenceAnswerStates[topicId]?.[dialogueId],
            },
          },
        }))
      },

      setVisibleDialogueIndex: (topicId: string, index: number) => {
        set(state => ({
          visibleDialogueIndices: {
            ...state.visibleDialogueIndices,
            [topicId]: index,
          },
        }))
      },

      goToNextDialoguePair: (
        topicId: string,
        topicDetail: TopicDialogueDetail
      ) => {
        const state = get()
        const currentIndex = state.visibleDialogueIndices[topicId] || 0

        // 找到下一个用户对话，确保AI+User成对显示
        const nextUserDialogueIndex = topicDetail.dialogues.findIndex(
          (dialogue, index) =>
            index > currentIndex && dialogue.speaker === 'user'
        )

        if (nextUserDialogueIndex > -1) {
          set(state => ({
            visibleDialogueIndices: {
              ...state.visibleDialogueIndices,
              [topicId]: nextUserDialogueIndex,
            },
          }))
        }
      },

      resetTopicPractice: (topicId: string) => {
        // 重置时需要重新计算初始显示索引，但这里没有topicDetail参数
        // 所以暂时使用一个简单的方式：清空索引，让下次initializeTopicChat重新设置
        set(state => {
          const newState = { ...state }
          delete newState.visibleDialogueIndices[topicId]

          return {
            ...newState,
            completedDialogues: {
              ...state.completedDialogues,
              [topicId]: {},
            },
            userRecordings: {
              ...state.userRecordings,
              [topicId]: {},
            },
            referenceAnswerStates: {
              ...state.referenceAnswerStates,
              [topicId]: {},
            },
          }
        })
      },

      isDialogueCompleted: (topicId: string, dialogueId: string) => {
        const state = get()
        return state.completedDialogues[topicId]?.[dialogueId] || false
      },

      shouldShowDialogue: (topicId: string, dialogueIndex: number) => {
        const state = get()
        const maxVisibleIndex = state.visibleDialogueIndices[topicId] || 0
        return dialogueIndex <= maxVisibleIndex
      },

      getReferenceAnswerState: (topicId: string, dialogueId: string) => {
        const state = get()
        return state.referenceAnswerStates[topicId]?.[dialogueId] || false
      },

      getUserRecording: (topicId: string, dialogueId: string) => {
        const state = get()
        return state.userRecordings[topicId]?.[dialogueId] || null
      },

      getCurrentDialoguePair: (
        topicId: string,
        topicDetail: TopicDialogueDetail
      ) => {
        const state = get()
        const visibleIndex = state.visibleDialogueIndices[topicId] || 0

        const userDialogue = topicDetail.dialogues[visibleIndex]
        if (!userDialogue || userDialogue.speaker !== 'user') {
          return null
        }

        // 找到对应的AI对话（通常在用户对话之前）
        const aiDialogue = topicDetail.dialogues[visibleIndex - 1]

        // 计算对话对的索引（以用户对话为准）
        const userDialogues = topicDetail.dialogues.filter(
          d => d.speaker === 'user'
        )
        const pairIndex = userDialogues.findIndex(d => d.id === userDialogue.id)

        return {
          aiDialogue: aiDialogue?.speaker === 'ai' ? aiDialogue : null,
          userDialogue,
          pairIndex,
        }
      },

      clearCurrentDialogueTurn: (
        topicId: string,
        dialogueId: string,
        topicDetail: TopicDialogueDetail
      ) => {
        const currentState = get()

        // 找到要清除的用户对话在整体对话中的索引
        const dialogueIndex = topicDetail.dialogues.findIndex(
          dialogue => dialogue.id === dialogueId
        )

        if (dialogueIndex === -1) return

        // 找到对应的AI对话索引（通常在用户对话之前）
        const aiDialogueIndex = dialogueIndex - 1

        set(state => {
          const newState = { ...state }

          // 1. 清除用户对话的录音和完成状态
          if (newState.userRecordings[topicId]) {
            newState.userRecordings[topicId] = {
              ...newState.userRecordings[topicId],
              [dialogueId]: null,
            }
          }

          if (newState.completedDialogues[topicId]) {
            newState.completedDialogues[topicId] = {
              ...newState.completedDialogues[topicId],
              [dialogueId]: false,
            }
          }

          // 2. 如果存在对应的AI对话，也清除其完成状态（允许重新生成系统回答）
          if (aiDialogueIndex >= 0) {
            const aiDialogue = topicDetail.dialogues[aiDialogueIndex]
            if (
              aiDialogue &&
              aiDialogue.speaker === 'ai' &&
              newState.completedDialogues[topicId]
            ) {
              newState.completedDialogues[topicId] = {
                ...newState.completedDialogues[topicId],
                [aiDialogue.id]: false,
              }
            }
          }

          // 3. 回退对话显示索引到当前用户对话，确保不显示后续对话
          const currentVisibleIndex =
            currentState.visibleDialogueIndices[topicId] || 0
          if (dialogueIndex <= currentVisibleIndex) {
            newState.visibleDialogueIndices = {
              ...newState.visibleDialogueIndices,
              [topicId]: dialogueIndex,
            }
          }

          return newState
        })
      },
    }),
    {
      name: 'topic-chat-storage',
      partialize: state => ({
        completedDialogues: state.completedDialogues,
        userRecordings: state.userRecordings,
        referenceAnswerStates: state.referenceAnswerStates,
        visibleDialogueIndices: state.visibleDialogueIndices,
      }),
    }
  )
)

// 导出类型
export type { TopicChatState }

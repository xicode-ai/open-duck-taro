import { create } from 'zustand'
import type { ChatMessage } from '@/types'

// 聊天状态接口
interface ChatState {
  currentChatId: string | null
  messages: ChatMessage[]
  isRecording: boolean
  isPlaying: boolean
  isTyping: boolean

  // 消息操作
  addMessage: (message: ChatMessage) => void
  clearMessages: () => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  deleteMessage: (id: string) => void

  // 状态操作
  setRecording: (recording: boolean) => void
  setPlaying: (playing: boolean) => void
  setTyping: (typing: boolean) => void
  setCurrentChatId: (chatId: string | null) => void

  // 录音操作
  startRecording: () => void
  stopRecording: () => void

  // 批量操作
  addMessages: (messages: ChatMessage[]) => void
  getMessagesByType: (type: ChatMessage['type']) => ChatMessage[]
}

// 聊天状态管理
export const useChatStore = create<ChatState>((set, get) => ({
  currentChatId: null,
  messages: [],
  isRecording: false,
  isPlaying: false,
  isTyping: false,

  addMessage: (message: ChatMessage) =>
    set(state => ({
      messages: [...state.messages, message],
    })),

  clearMessages: () => set({ messages: [] }),

  updateMessage: (id: string, updates: Partial<ChatMessage>) =>
    set(state => ({
      messages: state.messages.map(msg =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    })),

  deleteMessage: (id: string) =>
    set(state => ({
      messages: state.messages.filter(msg => msg.id !== id),
    })),

  setRecording: (recording: boolean) => set({ isRecording: recording }),

  setPlaying: (playing: boolean) => set({ isPlaying: playing }),

  setTyping: (typing: boolean) => set({ isTyping: typing }),

  setCurrentChatId: (chatId: string | null) => set({ currentChatId: chatId }),

  startRecording: () => set({ isRecording: true }),

  stopRecording: () => set({ isRecording: false }),

  addMessages: (messages: ChatMessage[]) =>
    set(state => ({
      messages: [...state.messages, ...messages],
    })),

  getMessagesByType: (type: ChatMessage['type']) => {
    const { messages } = get()
    return messages.filter(msg => msg.type === type)
  },
}))

// 导出类型
export type { ChatState }

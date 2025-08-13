import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, ChatMessage, Topic, Vocabulary } from '@/types'

// 用户状态管理
interface UserState {
  user: User | null
  isLoggedIn: boolean
  setUser: (user: User) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    set => ({
      user: null,
      isLoggedIn: false,
      setUser: user => set({ user, isLoggedIn: true }),
      logout: () => set({ user: null, isLoggedIn: false }),
    }),
    {
      name: 'user-storage',
    }
  )
)

// 聊天状态管理
interface ChatState {
  currentChatId: string | null
  messages: ChatMessage[]
  isRecording: boolean
  isPlaying: boolean
  addMessage: (message: ChatMessage) => void
  clearMessages: () => void
  setRecording: (recording: boolean) => void
  setPlaying: (playing: boolean) => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
}

export const useChatStore = create<ChatState>(set => ({
  currentChatId: null,
  messages: [],
  isRecording: false,
  isPlaying: false,
  addMessage: message =>
    set(state => ({
      messages: [...state.messages, message],
    })),
  clearMessages: () => set({ messages: [] }),
  setRecording: recording => set({ isRecording: recording }),
  setPlaying: playing => set({ isPlaying: playing }),
  updateMessage: (id, updates) =>
    set(state => ({
      messages: state.messages.map(msg => (msg.id === id ? { ...msg, ...updates } : msg)),
    })),
}))

// 话题状态管理
interface TopicState {
  topics: Topic[]
  currentTopic: Topic | null
  favoriteTopics: string[]
  setTopics: (topics: Topic[]) => void
  setCurrentTopic: (topic: Topic | null) => void
  addToFavorites: (topicId: string) => void
  removeFromFavorites: (topicId: string) => void
}

export const useTopicStore = create<TopicState>()(
  persist(
    set => ({
      topics: [],
      currentTopic: null,
      favoriteTopics: [],
      setTopics: topics => set({ topics }),
      setCurrentTopic: topic => set({ currentTopic: topic }),
      addToFavorites: topicId =>
        set(state => ({
          favoriteTopics: [...state.favoriteTopics, topicId],
        })),
      removeFromFavorites: topicId =>
        set(state => ({
          favoriteTopics: state.favoriteTopics.filter(id => id !== topicId),
        })),
    }),
    {
      name: 'topic-storage',
    }
  )
)

// 单词状态管理
interface VocabularyState {
  vocabularies: Vocabulary[]
  studiedWords: string[]
  favoriteWords: string[]
  currentLevel: string
  setVocabularies: (vocabularies: Vocabulary[]) => void
  addStudiedWord: (wordId: string) => void
  addToFavorites: (wordId: string) => void
  removeFromFavorites: (wordId: string) => void
  setCurrentLevel: (level: string) => void
}

export const useVocabularyStore = create<VocabularyState>()(
  persist(
    set => ({
      vocabularies: [],
      studiedWords: [],
      favoriteWords: [],
      currentLevel: 'elementary',
      setVocabularies: vocabularies => set({ vocabularies }),
      addStudiedWord: wordId =>
        set(state => ({
          studiedWords: [...state.studiedWords, wordId],
        })),
      addToFavorites: wordId =>
        set(state => ({
          favoriteWords: [...state.favoriteWords, wordId],
        })),
      removeFromFavorites: wordId =>
        set(state => ({
          favoriteWords: state.favoriteWords.filter(id => id !== wordId),
        })),
      setCurrentLevel: level => set({ currentLevel: level }),
    }),
    {
      name: 'vocabulary-storage',
    }
  )
)

// 应用设置状态管理
interface SettingsState {
  language: 'zh' | 'en'
  autoPlay: boolean
  voiceSpeed: number
  notifications: boolean
  setLanguage: (language: 'zh' | 'en') => void
  setAutoPlay: (autoPlay: boolean) => void
  setVoiceSpeed: (speed: number) => void
  setNotifications: (notifications: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      language: 'zh',
      autoPlay: true,
      voiceSpeed: 1.0,
      notifications: true,
      setLanguage: language => set({ language }),
      setAutoPlay: autoPlay => set({ autoPlay }),
      setVoiceSpeed: speed => set({ voiceSpeed: speed }),
      setNotifications: notifications => set({ notifications }),
    }),
    {
      name: 'settings-storage',
    }
  )
)

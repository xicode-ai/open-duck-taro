import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { queryClient } from '@/providers/QueryProvider'
import { QUERY_KEYS } from '@/hooks/useApiQueries'
import type { Topic } from '@/types'

// 话题状态接口
interface TopicState {
  topics: Topic[]
  currentTopic: Topic | null
  favoriteTopics: string[]
  selectedCategory: string | null
  selectedLevel: string | null

  // 话题操作
  setTopics: (topics: Topic[]) => void
  setCurrentTopic: (topic: Topic | null) => void
  addTopic: (topic: Topic) => void
  updateTopic: (id: string, updates: Partial<Topic>) => void

  // 收藏操作
  addToFavorites: (topicId: string) => void
  removeFromFavorites: (topicId: string) => void
  isFavorite: (topicId: string) => boolean

  // 筛选操作
  setSelectedCategory: (category: string | null) => void
  setSelectedLevel: (level: string | null) => void

  // 查询操作
  getTopicsByCategory: (category: string) => Topic[]
  getTopicsByLevel: (level: string) => Topic[]
  getFavoriteTopics: () => Topic[]
  getFilteredTopics: () => Topic[]
}

// 话题状态管理
export const useTopicStore = create<TopicState>()(
  persist(
    (set, get) => ({
      topics: [],
      currentTopic: null,
      favoriteTopics: [],
      selectedCategory: null,
      selectedLevel: null,

      setTopics: (topics: Topic[]) => {
        set({ topics })
        // 同步更新 React Query 缓存
        queryClient.setQueryData(QUERY_KEYS.TOPICS, topics)
      },

      setCurrentTopic: (topic: Topic | null) => {
        set({ currentTopic: topic })
        // 如果设置了当前话题，预取话题详情和对话内容
        if (topic) {
          queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.TOPIC_DETAIL(topic.id),
            queryFn: () => Promise.resolve(topic),
          })
        }
      },

      addTopic: (topic: Topic) => {
        set(state => ({
          topics: [...state.topics, topic],
        }))
        // 使话题列表查询失效
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TOPICS })
      },

      updateTopic: (id: string, updates: Partial<Topic>) => {
        set(state => ({
          topics: state.topics.map(topic =>
            topic.id === id ? { ...topic, ...updates } : topic
          ),
        }))
        // 更新相关缓存
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TOPICS })
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TOPIC_DETAIL(id) })
      },

      addToFavorites: (topicId: string) =>
        set(state => ({
          favoriteTopics: state.favoriteTopics.includes(topicId)
            ? state.favoriteTopics
            : [...state.favoriteTopics, topicId],
        })),

      removeFromFavorites: (topicId: string) =>
        set(state => ({
          favoriteTopics: state.favoriteTopics.filter(id => id !== topicId),
        })),

      isFavorite: (topicId: string) => {
        const { favoriteTopics } = get()
        return favoriteTopics.includes(topicId)
      },

      setSelectedCategory: (category: string | null) =>
        set({ selectedCategory: category }),

      setSelectedLevel: (level: string | null) => set({ selectedLevel: level }),

      getTopicsByCategory: (category: string) => {
        const { topics } = get()
        return topics.filter(topic => topic.category === category)
      },

      getTopicsByLevel: (level: string) => {
        const { topics } = get()
        return topics.filter(topic => topic.level === level)
      },

      getFavoriteTopics: () => {
        const { topics, favoriteTopics } = get()
        return topics.filter(topic => favoriteTopics.includes(topic.id))
      },

      getFilteredTopics: () => {
        const { topics, selectedCategory, selectedLevel } = get()
        return topics.filter(topic => {
          const categoryMatch =
            !selectedCategory || topic.category === selectedCategory
          const levelMatch = !selectedLevel || topic.level === selectedLevel
          return categoryMatch && levelMatch
        })
      },
    }),
    {
      name: 'topic-storage',
      partialize: state => ({
        favoriteTopics: state.favoriteTopics,
        selectedCategory: state.selectedCategory,
        selectedLevel: state.selectedLevel,
      }),
    }
  )
)

// 导出类型
export type { TopicState }

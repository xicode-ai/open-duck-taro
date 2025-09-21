import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { queryClient } from '@/providers/QueryProvider'
import { QUERY_KEYS } from '@/hooks/useApiQueries'
import type { Vocabulary } from '@/types'

// 单词状态接口
interface VocabularyState {
  vocabularies: Vocabulary[]
  studiedWords: string[]
  favoriteWords: string[]
  currentLevel: string
  studyProgress: Record<string, number> // wordId -> progress percentage

  // 单词操作
  setVocabularies: (vocabularies: Vocabulary[]) => void
  addVocabulary: (vocabulary: Vocabulary) => void
  updateVocabulary: (id: string, updates: Partial<Vocabulary>) => void

  // 学习进度操作
  addStudiedWord: (wordId: string) => void
  removeStudiedWord: (wordId: string) => void
  updateStudyProgress: (wordId: string, progress: number) => void
  isWordStudied: (wordId: string) => boolean
  getStudyProgress: (wordId: string) => number

  // 收藏操作
  addToFavorites: (wordId: string) => void
  removeFromFavorites: (wordId: string) => void
  isFavorite: (wordId: string) => boolean

  // 级别操作
  setCurrentLevel: (level: string) => void

  // 查询操作
  getVocabulariesByLevel: (level: string) => Vocabulary[]
  getFavoriteVocabularies: () => Vocabulary[]
  getStudiedVocabularies: () => Vocabulary[]
  getUnstudiedVocabularies: () => Vocabulary[]
  getStudyStats: () => {
    total: number
    studied: number
    favorite: number
    progress: number
  }
}

// 单词状态管理
export const useVocabularyStore = create<VocabularyState>()(
  persist(
    (set, get) => ({
      vocabularies: [],
      studiedWords: [],
      favoriteWords: [],
      currentLevel: 'elementary',
      studyProgress: {},

      setVocabularies: (vocabularies: Vocabulary[]) => {
        set({ vocabularies })
        // 同步更新 React Query 缓存
        queryClient.setQueryData(QUERY_KEYS.VOCABULARIES, vocabularies)
      },

      addVocabulary: (vocabulary: Vocabulary) => {
        set(state => ({
          vocabularies: [...state.vocabularies, vocabulary],
        }))
        // 使相关查询失效
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VOCABULARIES })
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.VOCABULARY_BY_LEVEL(vocabulary.level),
        })
      },

      updateVocabulary: (id: string, updates: Partial<Vocabulary>) => {
        set(state => ({
          vocabularies: state.vocabularies.map(vocab =>
            vocab.id === id ? { ...vocab, ...updates } : vocab
          ),
        }))
        // 使相关查询失效
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VOCABULARIES })
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.VOCABULARY_STUDY_WORD_DETAIL(id),
        })
      },

      addStudiedWord: (wordId: string) => {
        set(state => ({
          studiedWords: state.studiedWords.includes(wordId)
            ? state.studiedWords
            : [...state.studiedWords, wordId],
        }))
        // 使学习相关缓存失效
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.VOCABULARY_STUDY_HISTORY,
        })
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.VOCABULARY_DAILY_PROGRESS(),
        })
      },

      removeStudiedWord: (wordId: string) => {
        set(state => ({
          studiedWords: state.studiedWords.filter(id => id !== wordId),
        }))
        // 使学习相关缓存失效
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.VOCABULARY_STUDY_HISTORY,
        })
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.VOCABULARY_DAILY_PROGRESS(),
        })
      },

      updateStudyProgress: (wordId: string, progress: number) => {
        set(state => ({
          studyProgress: {
            ...state.studyProgress,
            [wordId]: Math.max(0, Math.min(100, progress)),
          },
        }))
        // 使学习进度相关缓存失效
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.VOCABULARY_DAILY_PROGRESS(),
        })
      },

      isWordStudied: (wordId: string) => {
        const { studiedWords } = get()
        return studiedWords.includes(wordId)
      },

      getStudyProgress: (wordId: string) => {
        const { studyProgress } = get()
        return studyProgress[wordId] || 0
      },

      addToFavorites: (wordId: string) => {
        set(state => ({
          favoriteWords: state.favoriteWords.includes(wordId)
            ? state.favoriteWords
            : [...state.favoriteWords, wordId],
        }))
        // 使收藏相关缓存失效
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.VOCABULARY_FAVORITES,
        })
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.VOCABULARY_STUDY_HISTORY,
        })
      },

      removeFromFavorites: (wordId: string) => {
        set(state => ({
          favoriteWords: state.favoriteWords.filter(id => id !== wordId),
        }))
        // 使收藏相关缓存失效
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.VOCABULARY_FAVORITES,
        })
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.VOCABULARY_STUDY_HISTORY,
        })
      },

      isFavorite: (wordId: string) => {
        const { favoriteWords } = get()
        return favoriteWords.includes(wordId)
      },

      setCurrentLevel: (level: string) => set({ currentLevel: level }),

      getVocabulariesByLevel: (level: string) => {
        const { vocabularies } = get()
        return vocabularies.filter(vocab => vocab.level === level)
      },

      getFavoriteVocabularies: () => {
        const { vocabularies, favoriteWords } = get()
        return vocabularies.filter(vocab => favoriteWords.includes(vocab.id))
      },

      getStudiedVocabularies: () => {
        const { vocabularies, studiedWords } = get()
        return vocabularies.filter(vocab => studiedWords.includes(vocab.id))
      },

      getUnstudiedVocabularies: () => {
        const { vocabularies, studiedWords } = get()
        return vocabularies.filter(vocab => !studiedWords.includes(vocab.id))
      },

      getStudyStats: () => {
        const { vocabularies, studiedWords, favoriteWords, studyProgress } =
          get()
        const total = vocabularies.length
        const studied = studiedWords.length
        const favorite = favoriteWords.length
        const totalProgress = Object.values(studyProgress).reduce(
          (sum, p) => sum + p,
          0
        )
        const progress = total > 0 ? totalProgress / total : 0

        return { total, studied, favorite, progress }
      },
    }),
    {
      name: 'vocabulary-storage',
      partialize: state => ({
        studiedWords: state.studiedWords,
        favoriteWords: state.favoriteWords,
        currentLevel: state.currentLevel,
        studyProgress: state.studyProgress,
      }),
    }
  )
)

// 导出类型
export type { VocabularyState }

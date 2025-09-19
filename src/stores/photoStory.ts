import { create } from 'zustand'
import type { PhotoStory, PhotoStoryScore, StoryPractice } from '../types'

interface PhotoStoryState {
  // 状态
  currentImage: string | null
  currentStory: PhotoStory | null
  isGenerating: boolean
  isRecording: boolean
  currentPracticeIndex: number
  practiceScores: Record<string, PhotoStoryScore>
  selectedStoryType: 'standard' | 'native'

  // Actions
  setCurrentImage: (image: string | null) => void
  setCurrentStory: (story: PhotoStory | null) => void
  setGenerating: (status: boolean) => void
  setRecording: (status: boolean) => void
  setSelectedStoryType: (type: 'standard' | 'native') => void
  updatePracticeScore: (sentenceId: string, score: PhotoStoryScore) => void
  updateStoryScore: (score: PhotoStoryScore) => void
  updateStoryScoreByType: (
    score: PhotoStoryScore,
    type: 'standard' | 'native'
  ) => void
  toggleFavorite: () => void
  nextPractice: () => void
  previousPractice: () => void
  resetPractice: () => void
  clearAll: () => void

  // Getters
  getCurrentPracticeSentence: () => StoryPractice | null
  getOverallScore: () => PhotoStoryScore | null
  isPracticeCompleted: () => boolean
}

export const usePhotoStoryStore = create<PhotoStoryState>((set, get) => ({
  // 初始状态
  currentImage: null,
  currentStory: null,
  isGenerating: false,
  isRecording: false,
  currentPracticeIndex: 0,
  practiceScores: {},
  selectedStoryType: 'standard',

  // Actions
  setCurrentImage: image => {
    set({ currentImage: image })
  },

  setCurrentStory: story => {
    set({
      currentStory: story,
      currentPracticeIndex: 0,
      practiceScores: {},
    })
  },

  setGenerating: status => {
    set({ isGenerating: status })
  },

  setRecording: status => {
    set({ isRecording: status })
  },

  setSelectedStoryType: type => {
    set({ selectedStoryType: type })
  },

  updatePracticeScore: (sentenceId, score) => {
    set(state => {
      const newScores = { ...state.practiceScores, [sentenceId]: score }

      // 更新句子的练习状态
      if (state.currentStory) {
        const updatedSentences = state.currentStory.sentences.map(s =>
          s.id === sentenceId
            ? { ...s, practiced: true, score: score.overall }
            : s
        )

        return {
          practiceScores: newScores,
          currentStory: {
            ...state.currentStory,
            sentences: updatedSentences,
          },
        }
      }

      return { practiceScores: newScores }
    })
  },

  updateStoryScore: score => {
    set(state => {
      if (state.currentStory) {
        return {
          currentStory: {
            ...state.currentStory,
            standardScore: score,
            status: 'completed' as const,
          },
        }
      }
      return state
    })
  },

  updateStoryScoreByType: (
    score: PhotoStoryScore,
    type: 'standard' | 'native'
  ) => {
    set(state => {
      if (state.currentStory) {
        const updates =
          type === 'standard'
            ? { standardScore: score }
            : { nativeScore: score }

        return {
          currentStory: {
            ...state.currentStory,
            ...updates,
            status: 'completed' as const,
          },
        }
      }
      return state
    })
  },

  toggleFavorite: () => {
    set(state => {
      if (state.currentStory) {
        return {
          currentStory: {
            ...state.currentStory,
            isFavorite: !state.currentStory.isFavorite,
            favoritedAt: !state.currentStory.isFavorite
              ? new Date().toISOString()
              : undefined,
          },
        }
      }
      return state
    })
  },

  nextPractice: () => {
    const { currentStory, currentPracticeIndex } = get()
    if (
      currentStory &&
      currentPracticeIndex < currentStory.sentences.length - 1
    ) {
      set({ currentPracticeIndex: currentPracticeIndex + 1 })
    }
  },

  previousPractice: () => {
    const { currentPracticeIndex } = get()
    if (currentPracticeIndex > 0) {
      set({ currentPracticeIndex: currentPracticeIndex - 1 })
    }
  },

  resetPractice: () => {
    set({
      currentPracticeIndex: 0,
      practiceScores: {},
    })

    // 重置所有句子的练习状态
    const { currentStory } = get()
    if (currentStory) {
      const resetSentences = currentStory.sentences.map(s => ({
        ...s,
        practiced: false,
        score: undefined,
      }))

      set({
        currentStory: {
          ...currentStory,
          sentences: resetSentences,
          standardScore: undefined,
          nativeScore: undefined,
          status: 'generated' as const,
        },
      })
    }
  },

  clearAll: () => {
    set({
      currentImage: null,
      currentStory: null,
      isGenerating: false,
      isRecording: false,
      currentPracticeIndex: 0,
      practiceScores: {},
      selectedStoryType: 'standard',
    })
  },

  // Getters
  getCurrentPracticeSentence: () => {
    const { currentStory, currentPracticeIndex } = get()
    if (!currentStory || !currentStory.sentences.length) return null
    return currentStory.sentences[currentPracticeIndex] || null
  },

  getOverallScore: () => {
    const { practiceScores, currentStory } = get()
    if (!currentStory || Object.keys(practiceScores).length === 0) return null

    const scores = Object.values(practiceScores)
    const avgScore =
      scores.reduce((sum, s) => sum + s.overall, 0) / scores.length
    const avgAccuracy =
      scores.reduce((sum, s) => sum + s.accuracy, 0) / scores.length
    const avgFluency =
      scores.reduce((sum, s) => sum + s.fluency, 0) / scores.length
    const avgSpeed = scores.reduce((sum, s) => sum + s.speed, 0) / scores.length
    const avgCompleteness =
      scores.reduce((sum, s) => sum + s.completeness, 0) / scores.length

    // 计算等级
    let grade = 'C'
    if (avgScore >= 95) grade = 'A+'
    else if (avgScore >= 90) grade = 'A'
    else if (avgScore >= 85) grade = 'B+'
    else if (avgScore >= 80) grade = 'B'
    else if (avgScore >= 75) grade = 'C+'

    // 生成反馈
    let feedback = ''
    if (avgScore >= 90) {
      feedback = '发音非常棒！继续保持！'
    } else if (avgScore >= 80) {
      feedback = '发音不错，继续加油！'
    } else if (avgScore >= 70) {
      feedback = '还需要多练习，注意发音准确度。'
    } else {
      feedback = '建议多听多练，提升发音水平。'
    }

    return {
      overall: Math.round(avgScore),
      grade,
      accuracy: Math.round(avgAccuracy),
      fluency: Math.round(avgFluency),
      speed: Math.round(avgSpeed),
      completeness: Math.round(avgCompleteness),
      feedback,
    }
  },

  isPracticeCompleted: () => {
    const { currentStory } = get()
    if (!currentStory) return false
    return currentStory.sentences.every(s => s.practiced)
  },
}))

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TranslateHistoryState {
  // 临时状态
  currentFilter: 'all' | 'favorite'
  isRefreshing: boolean

  // Actions
  setCurrentFilter: (filter: 'all' | 'favorite') => void
  setIsRefreshing: (refreshing: boolean) => void

  // 添加历史记录到服务端后的回调
  onHistoryAdded: () => void
}

export const useTranslateHistoryStore = create<TranslateHistoryState>()(
  persist(
    set => ({
      // 初始状态
      currentFilter: 'all',
      isRefreshing: false,

      // Actions
      setCurrentFilter: filter => set({ currentFilter: filter }),
      setIsRefreshing: refreshing => set({ isRefreshing: refreshing }),

      // 添加历史记录后的处理
      onHistoryAdded: () => {
        // 这里可以触发一些UI反馈或其他操作
        console.log('Translation added to history')
      },
    }),
    {
      name: 'translate-history-storage',
      // 只持久化必要的字段
      partialize: state => ({
        currentFilter: state.currentFilter,
      }),
    }
  )
)

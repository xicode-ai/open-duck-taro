import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

// 用户状态接口
interface UserState {
  user: User | null
  isLoggedIn: boolean
  setUser: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

// 用户状态管理
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,

      setUser: (user: User) => set({ user, isLoggedIn: true }),

      logout: () => set({ user: null, isLoggedIn: false }),

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } })
        }
      },
    }),
    {
      name: 'user-storage',
      // 只持久化必要的字段
      partialize: state => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
)

// 导出类型
export type { UserState }

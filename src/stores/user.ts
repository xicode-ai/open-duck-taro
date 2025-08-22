import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

// 用户相关类型
export interface UserProfile {
  id: string
  nickname: string
  avatar?: string
  level: number
  studyDays: number
  totalWords: number
  totalMinutes: number
}

export interface Membership {
  isPremium: boolean
  expiredAt?: number
  type?: 'monthly' | 'yearly' | 'lifetime'
}

export interface DailyUsage {
  [key: string]: number
}

// 用户状态接口
interface UserState {
  user: User | null
  profile: UserProfile
  membership: Membership
  dailyUsage: DailyUsage
  isLoggedIn: boolean

  setUser: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  updateDailyUsage: (feature: string) => void
  upgradeMembership: (membership: Membership) => Promise<void>
  checkUsage: (feature: string) => {
    used: number
    remaining: string
    canUse: boolean
  }
}

// 用户状态管理
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: {
        id: '1',
        nickname: 'Duck User',
        level: 5,
        studyDays: 15,
        totalWords: 120,
        totalMinutes: 180,
      },
      membership: {
        isPremium: false,
      },
      dailyUsage: {
        help: 0,
        translate: 0,
        photo: 0,
      },
      isLoggedIn: false,

      setUser: (user: User) => set({ user, isLoggedIn: true }),

      logout: () => set({ user: null, isLoggedIn: false, dailyUsage: {} }),

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } })
        }
      },

      updateProfile: (updates: Partial<UserProfile>) => {
        const currentProfile = get().profile
        set({ profile: { ...currentProfile, ...updates } })
      },

      updateDailyUsage: (feature: string) => {
        const { dailyUsage } = get()
        set({
          dailyUsage: {
            ...dailyUsage,
            [feature]: (dailyUsage[feature] || 0) + 1,
          },
        })
      },

      upgradeMembership: async (membership: Membership) => {
        set({ membership })
      },

      checkUsage: (feature: string) => {
        const { dailyUsage, membership } = get()
        const used = dailyUsage[feature] || 0
        const limit = membership.isPremium ? Infinity : 3

        return {
          used,
          remaining: membership.isPremium
            ? '∞'
            : Math.max(0, limit - used).toString(),
          canUse: membership.isPremium || used < limit,
        }
      },
    }),
    {
      name: 'user-storage',
      // 只持久化必要的字段
      partialize: state => ({
        user: state.user,
        profile: state.profile,
        membership: state.membership,
        dailyUsage: state.dailyUsage,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
)

// 导出类型
export type { UserState }

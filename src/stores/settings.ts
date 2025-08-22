import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 语言类型
type Language = 'zh' | 'en'

// 主题类型
type Theme = 'light' | 'dark' | 'auto'

// 设置状态接口
interface SettingsState {
  // 基础设置
  language: Language
  theme: Theme
  autoPlay: boolean
  voiceSpeed: number
  notifications: boolean

  // 学习设置
  dailyGoal: number
  studyReminder: boolean
  reminderTime: string
  difficultyLevel: string

  // 音频设置
  voiceGender: 'male' | 'female'
  voiceAccent: 'us' | 'uk'
  backgroundMusic: boolean
  soundEffects: boolean

  // 隐私设置
  dataCollection: boolean
  errorReporting: boolean
  analyticsEnabled: boolean

  // 设置操作
  setLanguage: (language: Language) => void
  setTheme: (theme: Theme) => void
  setAutoPlay: (autoPlay: boolean) => void
  setVoiceSpeed: (speed: number) => void
  setNotifications: (notifications: boolean) => void

  // 学习设置操作
  setDailyGoal: (goal: number) => void
  setStudyReminder: (enabled: boolean) => void
  setReminderTime: (time: string) => void
  setDifficultyLevel: (level: string) => void

  // 音频设置操作
  setVoiceGender: (gender: 'male' | 'female') => void
  setVoiceAccent: (accent: 'us' | 'uk') => void
  setBackgroundMusic: (enabled: boolean) => void
  setSoundEffects: (enabled: boolean) => void

  // 隐私设置操作
  setDataCollection: (enabled: boolean) => void
  setErrorReporting: (enabled: boolean) => void
  setAnalyticsEnabled: (enabled: boolean) => void

  // 批量操作
  resetToDefaults: () => void
  updateSettings: (updates: Partial<SettingsState>) => void
}

// 默认设置
const defaultSettings = {
  language: 'zh' as Language,
  theme: 'auto' as Theme,
  autoPlay: true,
  voiceSpeed: 1.0,
  notifications: true,
  dailyGoal: 20,
  studyReminder: false,
  reminderTime: '19:00',
  difficultyLevel: 'elementary',
  voiceGender: 'female' as const,
  voiceAccent: 'us' as const,
  backgroundMusic: false,
  soundEffects: true,
  dataCollection: true,
  errorReporting: true,
  analyticsEnabled: true,
}

// 设置状态管理
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setLanguage: (language: Language) => set({ language }),

      setTheme: (theme: Theme) => set({ theme }),

      setAutoPlay: (autoPlay: boolean) => set({ autoPlay }),

      setVoiceSpeed: (speed: number) => {
        // 限制语速范围在 0.5 - 2.0 之间
        const clampedSpeed = Math.max(0.5, Math.min(2.0, speed))
        set({ voiceSpeed: clampedSpeed })
      },

      setNotifications: (notifications: boolean) => set({ notifications }),

      setDailyGoal: (goal: number) => {
        // 限制每日目标在合理范围内
        const clampedGoal = Math.max(1, Math.min(100, goal))
        set({ dailyGoal: clampedGoal })
      },

      setStudyReminder: (studyReminder: boolean) => set({ studyReminder }),

      setReminderTime: (reminderTime: string) => set({ reminderTime }),

      setDifficultyLevel: (difficultyLevel: string) => set({ difficultyLevel }),

      setVoiceGender: (voiceGender: 'male' | 'female') => set({ voiceGender }),

      setVoiceAccent: (voiceAccent: 'us' | 'uk') => set({ voiceAccent }),

      setBackgroundMusic: (backgroundMusic: boolean) =>
        set({ backgroundMusic }),

      setSoundEffects: (soundEffects: boolean) => set({ soundEffects }),

      setDataCollection: (dataCollection: boolean) => set({ dataCollection }),

      setErrorReporting: (errorReporting: boolean) => set({ errorReporting }),

      setAnalyticsEnabled: (analyticsEnabled: boolean) =>
        set({ analyticsEnabled }),

      resetToDefaults: () => set(defaultSettings),

      updateSettings: (updates: Partial<SettingsState>) => {
        const currentState = get()
        set({ ...currentState, ...updates })
      },
    }),
    {
      name: 'settings-storage',
      // 持久化所有设置
      partialize: state => {
        // 排除函数，只持久化数据
        const {
          setLanguage: _setLanguage,
          setTheme: _setTheme,
          setAutoPlay: _setAutoPlay,
          setVoiceSpeed: _setVoiceSpeed,
          setNotifications: _setNotifications,
          setDailyGoal: _setDailyGoal,
          setStudyReminder: _setStudyReminder,
          setReminderTime: _setReminderTime,
          setDifficultyLevel: _setDifficultyLevel,
          setVoiceGender: _setVoiceGender,
          setVoiceAccent: _setVoiceAccent,
          setBackgroundMusic: _setBackgroundMusic,
          setSoundEffects: _setSoundEffects,
          setDataCollection: _setDataCollection,
          setErrorReporting: _setErrorReporting,
          setAnalyticsEnabled: _setAnalyticsEnabled,
          resetToDefaults: _resetToDefaults,
          updateSettings: _updateSettings,
          ...persistedState
        } = state
        return persistedState
      },
    }
  )
)

// 导出类型
export type { SettingsState, Language, Theme }

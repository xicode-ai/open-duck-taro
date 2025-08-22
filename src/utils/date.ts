/**
 * 时间相关工具函数
 */

/**
 * 格式化时间戳为相对时间
 */
export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else if (diff < 2592000000) {
    // 30天
    return `${Math.floor(diff / 86400000)}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

/**
 * 格式化音频时长
 */
export const formatDuration = (seconds: number): string => {
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

/**
 * 格式化日期为指定格式
 */
export const formatDate = (
  date: Date | number,
  format = 'YYYY-MM-DD'
): string => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const hour = d.getHours().toString().padStart(2, '0')
  const minute = d.getMinutes().toString().padStart(2, '0')
  const second = d.getSeconds().toString().padStart(2, '0')

  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 获取相对时间描述
 */
export const getRelativeTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < month) {
    return `${Math.floor(diff / week)}周前`
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`
  } else {
    return `${Math.floor(diff / year)}年前`
  }
}

/**
 * 判断是否为今天
 */
export const isToday = (timestamp: number): boolean => {
  const date = new Date(timestamp)
  const today = new Date()

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

/**
 * 判断是否为本周
 */
export const isThisWeek = (timestamp: number): boolean => {
  const date = new Date(timestamp)
  const today = new Date()

  // 获取本周一的日期
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + 1)
  monday.setHours(0, 0, 0, 0)

  // 获取下周一的日期
  const nextMonday = new Date(monday)
  nextMonday.setDate(monday.getDate() + 7)

  return date >= monday && date < nextMonday
}

/**
 * 判断是否为有效日期
 */
export const isValidDate = (date: unknown): date is Date => {
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * 获取时间段描述
 */
export const getTimeOfDay = (hour?: number): string => {
  const h = hour ?? new Date().getHours()

  if (h >= 5 && h < 12) {
    return '上午'
  } else if (h >= 12 && h < 18) {
    return '下午'
  } else if (h >= 18 && h < 22) {
    return '晚上'
  } else {
    return '深夜'
  }
}

/**
 * 计算学习连续天数
 */
export const calculateStreak = (studyDates: number[]): number => {
  if (studyDates.length === 0) return 0

  // 按日期排序
  const sortedDates = studyDates
    .map(timestamp => {
      const date = new Date(timestamp)
      date.setHours(0, 0, 0, 0)
      return date.getTime()
    })
    .sort((a, b) => b - a) // 降序排列

  let streak = 1
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTime = today.getTime()

  // 如果最新的学习日期不是今天或昨天，连续天数为0
  const latestDate = sortedDates[0]
  const daysDiff = (todayTime - latestDate) / (24 * 60 * 60 * 1000)

  if (daysDiff > 1) return 0
  if (daysDiff === 1) streak = 1 // 昨天学习了
  if (daysDiff === 0) streak = 1 // 今天学习了

  // 计算连续天数
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = sortedDates[i - 1]
    const currentDate = sortedDates[i]
    const diff = (prevDate - currentDate) / (24 * 60 * 60 * 1000)

    if (diff === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

// 导出时间工具对象
export const dateUtils = {
  formatTime,
  formatDuration,
  formatDate,
  getRelativeTime,
  isToday,
  isThisWeek,
  isValidDate,
  getTimeOfDay,
  calculateStreak,
}

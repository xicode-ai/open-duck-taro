/**
 * 格式化相关工具函数
 */

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`
}

/**
 * 格式化数字（千分位分隔符）
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化百分比
 */
export const formatPercentage = (
  value: number,
  total: number,
  decimals = 1
): string => {
  if (total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${percentage.toFixed(decimals)}%`
}

/**
 * 格式化分数
 */
export const formatScore = (score: number, maxScore = 100): string => {
  return `${score}/${maxScore}`
}

/**
 * 格式化货币
 */
export const formatCurrency = (amount: number, currency = '¥'): string => {
  return `${currency}${formatNumber(amount)}`
}

/**
 * 格式化手机号（脱敏）
 */
export const formatPhone = (phone: string): string => {
  if (!phone || phone.length !== 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 格式化身份证号（脱敏）
 */
export const formatIdCard = (idCard: string): string => {
  if (!idCard || idCard.length < 8) return idCard
  return idCard.replace(/(\d{4})\d*(\d{4})/, '$1****$2')
}

/**
 * 格式化邮箱（脱敏）
 */
export const formatEmail = (email: string): string => {
  if (!email || !email.includes('@')) return email
  const [username, domain] = email.split('@')
  if (username.length <= 2) return email

  const maskedUsername =
    username.charAt(0) +
    '*'.repeat(username.length - 2) +
    username.charAt(username.length - 1)
  return `${maskedUsername}@${domain}`
}

/**
 * 格式化用户名（保留首尾字符）
 */
export const formatUsername = (name: string): string => {
  if (!name || name.length <= 2) return name
  return (
    name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1)
  )
}

/**
 * 格式化字符串长度（截断并添加省略号）
 */
export const truncateString = (
  str: string,
  maxLength: number,
  suffix = '...'
): string => {
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength - suffix.length) + suffix
}

/**
 * 格式化首字母大写
 */
export const capitalizeFirst = (str: string): string => {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * 格式化驼峰命名
 */
export const toCamelCase = (str: string): string => {
  return str.replace(/[-_\s]+(.)?/g, (_, char) =>
    char ? char.toUpperCase() : ''
  )
}

/**
 * 格式化短横线命名
 */
export const toKebabCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

/**
 * 格式化下划线命名
 */
export const toSnakeCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
}

/**
 * 移除HTML标签
 */
export const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '')
}

/**
 * 格式化URL
 */
export const formatUrl = (url: string): string => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `https://${url}`
}

/**
 * 格式化高亮文本
 */
export const highlightText = (text: string, keyword: string): string => {
  if (!keyword) return text
  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

/**
 * 格式化学习级别显示名称
 */
export const formatLevelName = (level: string): string => {
  const levelMap: Record<string, string> = {
    preschool: '萌芽期',
    elementary: '基础期',
    middle: '发展期',
    high: '加速期',
    university: '精通期',
    master: '大师期',
  }
  return levelMap[level] || level
}

/**
 * 格式化学习进度描述
 */
export const formatProgress = (current: number, total: number): string => {
  if (total === 0) return '暂无数据'
  const percentage = Math.round((current / total) * 100)
  return `${current}/${total} (${percentage}%)`
}

/**
 * 格式化学习时长
 */
export const formatStudyTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分钟`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}小时`
  }

  return `${hours}小时${remainingMinutes}分钟`
}

/**
 * 格式化数组为字符串
 */
export const formatArray = (
  arr: string[],
  separator = '、',
  lastSeparator = '和'
): string => {
  if (arr.length === 0) return ''
  if (arr.length === 1) return arr[0]
  if (arr.length === 2) return arr.join(lastSeparator)

  const lastItem = arr[arr.length - 1]
  const otherItems = arr.slice(0, -1)
  return otherItems.join(separator) + lastSeparator + lastItem
}

/**
 * 格式化相对时间（用于聊天消息）
 */
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = Math.floor((now - timestamp) / 1000) // 转换为秒

  if (diff < 60) {
    return '刚刚'
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60)
    return `${minutes}分钟前`
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600)
    return `${hours}小时前`
  } else if (diff < 604800) {
    const days = Math.floor(diff / 86400)
    return `${days}天前`
  } else {
    const date = new Date(timestamp)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}

// 导出格式化工具对象
export const formatUtils = {
  formatFileSize,
  formatNumber,
  formatPercentage,
  formatScore,
  formatCurrency,
  formatPhone,
  formatIdCard,
  formatEmail,
  formatUsername,
  truncateString,
  capitalizeFirst,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  stripHtml,
  formatUrl,
  highlightText,
  formatLevelName,
  formatProgress,
  formatStudyTime,
  formatArray,
  formatRelativeTime,
}

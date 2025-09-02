/**
 * 环境检测工具
 */

/**
 * 安全获取环境变量
 */
const getEnv = (key: string): string | undefined => {
  try {
    return typeof process !== 'undefined' && process.env
      ? process.env[key]
      : undefined
  } catch {
    return undefined
  }
}

/**
 * 检测是否为开发环境
 */
export const isDevelopment = (): boolean => {
  // 检查 NODE_ENV
  const nodeEnv = getEnv('NODE_ENV')
  if (nodeEnv === 'development') {
    return true
  }

  // 检查 TARO_ENV 和构建模式
  const taroEnv = getEnv('TARO_ENV')
  if (taroEnv === 'h5') {
    return true // H5环境总是被视为开发环境，需要使用Mock
  }

  // 检查是否在本地开发服务器
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.includes('192.168.')
    ) {
      return true
    }
  }

  return false
}

/**
 * 检测是否为生产环境
 */
export const isProduction = (): boolean => {
  return !isDevelopment()
}

/**
 * 检测是否为测试环境
 */
export const isTest = (): boolean => {
  return getEnv('NODE_ENV') === 'test'
}

/**
 * 获取当前环境名称
 */
export const getEnvironment = (): string => {
  if (isTest()) return 'test'
  if (isDevelopment()) return 'development'
  return 'production'
}

/**
 * 环境相关的配置
 */
export const environmentConfig = {
  isDev: isDevelopment(),
  isProd: isProduction(),
  isTest: isTest(),
  env: getEnvironment(),
}

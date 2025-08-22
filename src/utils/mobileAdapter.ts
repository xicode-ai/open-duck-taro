/* eslint-env browser */
/* global navigator, getComputedStyle, Navigator */
/**
 * H5 端手机适配工具
 * 提供各种手机端适配的实用函数
 */

// 设备信息接口
interface DeviceInfo {
  isMobile: boolean
  isIOS: boolean
  isAndroid: boolean
  isWechat: boolean
  isQQ: boolean
  isAlipay: boolean
  screenWidth: number
  screenHeight: number
  pixelRatio: number
  orientation: 'portrait' | 'landscape'
}

// 网络连接接口
interface NetworkConnection {
  effectiveType: string
  downlink: number
  rtt: number
  saveData: boolean
}

// 扩展 Navigator 接口
interface ExtendedNavigator extends Navigator {
  connection?: NetworkConnection
}

// 获取设备信息
export const getDeviceInfo = (): DeviceInfo => {
  const ua = navigator.userAgent.toLowerCase()
  const screen = window.screen

  return {
    isMobile: /mobile|android|iphone|ipad|phone/i.test(ua),
    isIOS: /iphone|ipad|ipod/i.test(ua),
    isAndroid: /android/i.test(ua),
    isWechat: /micromessenger/i.test(ua),
    isQQ: /qq/i.test(ua),
    isAlipay: /alipay/i.test(ua),
    screenWidth: screen.width,
    screenHeight: screen.height,
    pixelRatio: window.devicePixelRatio || 1,
    orientation: screen.width > screen.height ? 'landscape' : 'portrait',
  }
}

// 获取视口尺寸
export const getViewportSize = () => {
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  }
}

// 获取安全区域信息
export const getSafeAreaInfo = () => {
  const style = getComputedStyle(document.documentElement)

  return {
    top: parseInt(style.getPropertyValue('--sat') || '0'),
    bottom: parseInt(style.getPropertyValue('--sab') || '0'),
    left: parseInt(style.getPropertyValue('--sal') || '0'),
    right: parseInt(style.getPropertyValue('--sar') || '0'),
  }
}

// 设置根元素字体大小（用于 rem 适配）
export const setRootFontSize = () => {
  const docEl = document.documentElement
  const resizeEvt =
    'orientationchange' in window ? 'orientationchange' : 'resize'

  const recalc = () => {
    const clientWidth = docEl.clientWidth
    if (!clientWidth) return

    // 基于 375px 设计稿的 rem 计算
    const fontSize = (clientWidth / 375) * 16
    docEl.style.fontSize = `${fontSize}px`
  }

  if (document.addEventListener) {
    window.addEventListener(resizeEvt, recalc, false)
    document.addEventListener('DOMContentLoaded', recalc, false)
  }

  recalc()
}

// 检测触摸事件支持
export const isTouchSupported = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// 获取触摸目标的最小尺寸
export const getMinTouchTargetSize = () => {
  const deviceInfo = getDeviceInfo()

  // iOS 推荐 44px，Android 推荐 48px
  if (deviceInfo.isIOS) {
    return 44
  } else if (deviceInfo.isAndroid) {
    return 48
  }

  return 44 // 默认值
}

// 设置触摸优化
export const setupTouchOptimization = () => {
  if (!isTouchSupported()) return

  // 禁用双击缩放
  let lastTouchEnd = 0
  document.addEventListener(
    'touchend',
    event => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    },
    false
  )

  // 禁用长按菜单
  document.addEventListener(
    'contextmenu',
    event => {
      event.preventDefault()
    },
    false
  )
}

// 设置视口 meta 标签
export const setupViewport = () => {
  let viewport = document.querySelector('meta[name="viewport"]')

  if (!viewport) {
    viewport = document.createElement('meta')
    viewport.setAttribute('name', 'viewport')
    document.head.appendChild(viewport)
  }

  const deviceInfo = getDeviceInfo()
  let content =
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'

  // 针对不同设备优化
  if (deviceInfo.isIOS) {
    content += ', viewport-fit=cover'
  }

  viewport.setAttribute('content', content)
}

// 设置状态栏样式
export const setupStatusBar = () => {
  const deviceInfo = getDeviceInfo()

  if (deviceInfo.isIOS) {
    // iOS 状态栏适配
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'apple-mobile-web-app-status-bar-style')
    meta.setAttribute('content', 'black-translucent')
    document.head.appendChild(meta)
  }
}

// 设置主题色
export const setupThemeColor = (color: string = '#4A90E2') => {
  const meta = document.createElement('meta')
  meta.setAttribute('name', 'theme-color')
  meta.setAttribute('content', color)
  document.head.appendChild(meta)

  // iOS 状态栏颜色
  const appleMeta = document.createElement('meta')
  appleMeta.setAttribute('name', 'apple-mobile-web-app-status-bar-style')
  appleMeta.setAttribute('content', 'black-translucent')
  document.head.appendChild(appleMeta)
}

// 检测网络状态
export const getNetworkInfo = () => {
  if ('connection' in navigator) {
    const connection = (navigator as ExtendedNavigator).connection
    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      }
    }
  }

  return null
}

// 设置网络状态监听
export const setupNetworkListener = (callback: (isOnline: boolean) => void) => {
  window.addEventListener('online', () => callback(true))
  window.addEventListener('offline', () => callback(false))
}

// 获取设备方向变化
export const setupOrientationListener = (
  callback: (orientation: 'portrait' | 'landscape') => void
) => {
  const handleOrientationChange = () => {
    const orientation =
      window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    callback(orientation)
  }

  window.addEventListener('resize', handleOrientationChange)
  window.addEventListener('orientationchange', handleOrientationChange)

  // 初始化
  handleOrientationChange()
}

// 设置页面可见性监听
export const setupVisibilityListener = (
  callback: (isVisible: boolean) => void
) => {
  const handleVisibilityChange = () => {
    const isVisible = !document.hidden
    callback(isVisible)
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)

  // 初始化
  handleVisibilityChange()
}

// 初始化所有适配功能
export const initMobileAdapter = () => {
  setupViewport()
  setupStatusBar()
  setupThemeColor()
  setupTouchOptimization()
  setRootFontSize()

  // 设置 CSS 变量
  const root = document.documentElement
  const deviceInfo = getDeviceInfo()
  const viewport = getViewportSize()

  root.style.setProperty('--device-width', `${viewport.width}px`)
  root.style.setProperty('--device-height', `${viewport.height}px`)
  root.style.setProperty('--pixel-ratio', deviceInfo.pixelRatio.toString())
  root.style.setProperty('--is-ios', deviceInfo.isIOS ? '1' : '0')
  root.style.setProperty('--is-android', deviceInfo.isAndroid ? '1' : '0')

  console.log('Mobile adapter initialized:', deviceInfo)
}

// 导出设备信息
export const deviceInfo = getDeviceInfo()

// 导出视口信息
export const viewportInfo = getViewportSize()

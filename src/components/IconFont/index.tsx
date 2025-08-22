import React from 'react'
import { View } from '@tarojs/components'
import './index.scss'

export interface IconFontProps {
  name: string
  size?: number
  color?: string
  style?: React.CSSProperties
  className?: string
  onClick?: () => void
}

// 自定义图标映射 - 使用emoji或Unicode字符
const iconMap: Record<string, string> = {
  'icon-help': '❓',
  'icon-message': '💬',
  'icon-chat': '💬',
  'icon-translate': '🔤',
  'icon-camera': '📷',
  'icon-book': '📚',
  'icon-topic': '📝',
  'icon-list': '📋',
  'icon-analytics': '📊',
  'icon-bookmark': '🔖',
  'icon-star': '⭐',
  'icon-crown': '👑',
  'icon-duck': '🦆',
  'icon-home': '🏠',
  'icon-user': '👤',
  'icon-progress': '📈',
  'icon-vocabulary': '📖',
  'icon-settings': '⚙️',
  'icon-arrow-right': '›',
  'icon-arrow-left': '‹',
  'icon-arrow-up': '↑',
  'icon-arrow-down': '↓',
  'icon-check': '✓',
  'icon-close': '✕',
  'icon-plus': '+',
  'icon-minus': '-',
  'icon-search': '🔍',
  'icon-mic': '🎤',
  'icon-play': '▶️',
  'icon-pause': '⏸️',
  'icon-stop': '⏹️',
  'icon-fire': '🔥',
  'icon-trophy': '🏆',
  'icon-medal': '🥇',
  'icon-gift': '🎁',
  'icon-bell': '🔔',
  'icon-lock': '🔒',
  'icon-unlock': '🔓',
  'icon-eye': '👁️',
  'icon-heart': '❤️',
  'icon-share': '📤',
  'icon-download': '⬇️',
  'icon-upload': '⬆️',
  'icon-refresh': '🔄',
  'icon-edit': '✏️',
  'icon-delete': '🗑️',
  'icon-warning': '⚠️',
  'icon-info': 'ℹ️',
  'icon-success': '✅',
  'icon-error': '❌',
  // 简化的键名（不带前缀）
  help: '❓',
  message: '💬',
  chat: '💬',
  translate: '🔤',
  camera: '📷',
  book: '📚',
  topic: '📝',
  list: '📋',
  analytics: '📊',
  bookmark: '🔖',
  star: '⭐',
  crown: '👑',
  duck: '🦆',
  home: '🏠',
  user: '👤',
  progress: '📈',
  vocabulary: '📖',
  settings: '⚙️',
}

const IconFont: React.FC<IconFontProps> = ({
  name,
  size = 20,
  color = '#000000',
  style = {},
  className = '',
  onClick,
}) => {
  const icon = iconMap[name] || iconMap[`icon-${name}`] || '❓'

  const iconStyle: React.CSSProperties = {
    fontSize: `${size}px`,
    color,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    ...style,
  }

  return (
    <View
      className={`icon-font ${className}`}
      style={iconStyle}
      onClick={onClick}
    >
      {icon}
    </View>
  )
}

export default IconFont

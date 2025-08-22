import React from 'react'
import { View, Text } from '@tarojs/components'
import { AtActivityIndicator } from 'taro-ui'
import './index.scss'

// 加载类型
export type LoadingType = 'spinner' | 'dots' | 'pulse'

// 加载尺寸
export type LoadingSize = 'small' | 'normal' | 'large'

// 加载属性
export interface LoadingProps {
  type?: LoadingType
  size?: LoadingSize
  color?: string
  text?: string
  vertical?: boolean
  overlay?: boolean
  className?: string
}

const Loading: React.FC<LoadingProps> = ({
  type = 'spinner',
  size = 'normal',
  color = '#4A90E2',
  text,
  vertical = false,
  overlay = false,
  className = '',
}) => {
  const loadingClass = [
    'common-loading',
    `common-loading--${type}`,
    `common-loading--${size}`,
    vertical && 'common-loading--vertical',
    overlay && 'common-loading--overlay',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const renderSpinner = () => (
    <AtActivityIndicator
      mode="center"
      content={text}
      isOpened={true}
      color={color}
      size={size === 'small' ? 20 : size === 'large' ? 40 : 30}
    />
  )

  const renderDots = () => (
    <View className="loading-dots">
      <View className="dot" style={{ backgroundColor: color }}></View>
      <View className="dot" style={{ backgroundColor: color }}></View>
      <View className="dot" style={{ backgroundColor: color }}></View>
    </View>
  )

  const renderPulse = () => (
    <View className="loading-pulse">
      <View className="pulse-circle" style={{ borderColor: color }}></View>
    </View>
  )

  const renderLoading = () => {
    switch (type) {
      case 'dots':
        return renderDots()
      case 'pulse':
        return renderPulse()
      case 'spinner':
      default:
        return renderSpinner()
    }
  }

  return (
    <View className={loadingClass}>
      {overlay && <View className="loading-backdrop"></View>}
      <View className="loading-content">
        {renderLoading()}
        {text && type !== 'spinner' && (
          <Text className="loading-text">{text}</Text>
        )}
      </View>
    </View>
  )
}

export default Loading

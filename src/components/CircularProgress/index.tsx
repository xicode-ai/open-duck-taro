import React from 'react'
import { View, Text } from '@tarojs/components'
import './index.scss'

interface CircularProgressProps {
  /** 进度值，0-100 */
  progress: number
  /** 显示的数值 */
  value: string | number
  /** 标题 */
  title: string
  /** 增长值，可选 */
  growth?: {
    value: string | number
    trend: 'up' | 'down'
  }
  /** 进度条颜色 */
  color?: string
  /** 尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 是否显示动画 */
  animated?: boolean
  /** 自定义样式类名 */
  className?: string
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  value,
  title,
  growth,
  color = '#4CAF50',
  size = 'medium',
  animated = true,
  className = '',
}) => {
  // 根据尺寸设定圆环参数
  const sizeMap = {
    small: { radius: 30, strokeWidth: 4, fontSize: '14px' },
    medium: { radius: 40, strokeWidth: 6, fontSize: '16px' },
    large: { radius: 50, strokeWidth: 8, fontSize: '20px' },
  }

  const { radius, strokeWidth, fontSize } = sizeMap[size]
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI

  // 计算进度条长度
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (progress / 100) * circumference

  // 渐变ID
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`

  return (
    <View
      className={`circular-progress circular-progress--${size} ${className}`}
    >
      {/* SVG圆环 */}
      <View className="circular-progress__chart">
        <svg
          height={radius * 2}
          width={radius * 2}
          className={`circular-progress__svg ${animated ? 'animated' : ''}`}
        >
          {/* 定义渐变 */}
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* 背景圆环 */}
          <circle
            stroke="#E8E8E8"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="circular-progress__bg"
          />

          {/* 进度圆环 */}
          <circle
            stroke={`url(#${gradientId})`}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="circular-progress__progress"
            transform={`rotate(-90 ${radius} ${radius})`}
          />
        </svg>

        {/* 中心内容 */}
        <View className="circular-progress__content">
          <Text className="circular-progress__value" style={{ fontSize }}>
            {value}
          </Text>
          {typeof value === 'number' && progress < 100 && (
            <Text className="circular-progress__percent">%</Text>
          )}
        </View>
      </View>

      {/* 标题和增长信息 */}
      <View className="circular-progress__info">
        <Text className="circular-progress__title">{title}</Text>
        {growth && (
          <View
            className={`circular-progress__growth circular-progress__growth--${growth.trend}`}
          >
            <Text className="circular-progress__growth-icon">
              {growth.trend === 'up' ? '↗' : '↘'}
            </Text>
            <Text className="circular-progress__growth-value">
              {growth.trend === 'up' ? '+' : '-'}
              {growth.value}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default CircularProgress

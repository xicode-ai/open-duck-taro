import React from 'react'
import { View, Text } from '@tarojs/components'

interface ProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  showText?: boolean
  className?: string
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 60,
  strokeWidth = 6,
  color = '#6366f1',
  showText = true,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <View
      className={`progress-ring ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size}>
        <circle
          className="ring-background"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {showText && <Text className="ring-text">{percentage}%</Text>}
    </View>
  )
}

export default ProgressRing

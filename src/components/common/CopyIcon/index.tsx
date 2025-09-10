import React from 'react'
import { View } from '@tarojs/components'
import './index.scss'

interface CopyIconProps {
  size?: number
  color?: string
  className?: string
  onClick?: () => void
}

const CopyIcon: React.FC<CopyIconProps> = ({
  size = 16,
  color = '#666',
  className = '',
  onClick,
}) => {
  return (
    <View className={`copy-icon ${className}`} onClick={onClick}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 后面的文档 */}
        <rect
          x="8"
          y="8"
          width="12"
          height="14"
          rx="2"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
        />

        {/* 前面的文档（部分可见） */}
        <path
          d="M16 8V6C16 4.89543 15.1046 4 14 4H6C4.89543 4 4 4.89543 4 6V16C4 17.1046 4.89543 18 6 18H8"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </View>
  )
}

export default CopyIcon

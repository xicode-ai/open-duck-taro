import React from 'react'
import { View, Text } from '@tarojs/components'

interface StatCardProps {
  number: string | number
  label: string
  color?: string
  icon?: string
  className?: string
}

const StatCard: React.FC<StatCardProps> = ({
  number,
  label,
  color,
  icon,
  className = '',
}) => {
  return (
    <View className={`stat-card ${className}`}>
      {icon && (
        <Text
          className="stat-icon"
          style={{ fontSize: '20px', marginBottom: '4px' }}
        >
          {icon}
        </Text>
      )}
      <Text className="stat-number" style={color ? { color } : {}}>
        {number}
      </Text>
      <Text className="stat-label">{label}</Text>
    </View>
  )
}

export default StatCard

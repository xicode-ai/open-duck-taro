import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'

interface FunctionItem {
  icon: string
  title: string
  subtitle: string
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red'
  path: string
}

interface FunctionGridProps {
  items: FunctionItem[]
  className?: string
}

const FunctionGrid: React.FC<FunctionGridProps> = ({
  items,
  className = '',
}) => {
  const handleNavigate = (path: string) => {
    Taro.navigateTo({ url: path })
  }

  return (
    <View className={`function-grid ${className}`}>
      {items.map((item, index) => (
        <View
          key={index}
          className="function-item"
          onClick={() => handleNavigate(item.path)}
        >
          <View className={`function-icon ${item.color}`}>
            <Text style={{ fontSize: '24px' }}>{item.icon}</Text>
          </View>
          <Text className="function-title">{item.title}</Text>
          <Text className="function-subtitle">{item.subtitle}</Text>
        </View>
      ))}
    </View>
  )
}

export default FunctionGrid

import React from 'react'
import { View, Text } from '@tarojs/components'
import type { ReactNode } from 'react'

interface GradientCardProps {
  title?: string
  subtitle?: string
  children?: ReactNode
  className?: string
  gradient?: 'primary' | 'secondary' | 'orange' | 'green' | 'purple'
}

const GradientCard: React.FC<GradientCardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  gradient = 'primary',
}) => {
  const gradientClass = `gradient-${gradient}`

  return (
    <View className={`gradient-card ${gradientClass} ${className}`}>
      {title && (
        <View className="gradient-card-header">
          <Text className="gradient-card-title">{title}</Text>
          {subtitle && (
            <Text className="gradient-card-subtitle">{subtitle}</Text>
          )}
        </View>
      )}
      {children}
    </View>
  )
}

export default GradientCard

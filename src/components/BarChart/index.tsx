import React from 'react'
import { View, Text } from '@tarojs/components'
import CustomIcon from '@/components/CustomIcon'
import './index.scss'

// 与 CustomIcon 组件中的颜色保持完全一致
const ICON_COLORS = {
  chat: '#3B82F6', // 蓝色
  list: '#10B981', // 绿色
  translate: '#8B5CF6', // 紫色
  'photo-story': '#F59E0B', // 橙色
  vocabulary: '#EF4444', // 红色
} as const

interface StatisticsData {
  icon: string
  label: string
  count: number
  color: string
  progress: number
}

interface BarChartProps {
  /**
   * 统计数据
   */
  data: StatisticsData[]
  /**
   * 自定义样式类名
   */
  className?: string
}

const BarChart: React.FC<BarChartProps> = ({ data, className = '' }) => {
  return (
    <View className={`bar-chart-container ${className}`}>
      <View className="statistics-list">
        {data.map((item, index) => (
          <View key={index} className="statistics-item">
            <View className="item-header">
              <View className="item-icon">
                <CustomIcon name={item.icon} size={32} />
              </View>
              <Text className="item-label">{item.label}</Text>
              <Text className="item-count">{item.count}次</Text>
            </View>
            <View className="progress-bar">
              <View
                className="progress-fill"
                style={{
                  backgroundColor:
                    ICON_COLORS[item.icon as keyof typeof ICON_COLORS] ||
                    item.color,
                  width: `${item.progress}%`,
                }}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default BarChart

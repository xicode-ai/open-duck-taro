import React from 'react'
import { View, Text } from '@tarojs/components'
import ReactECharts from 'echarts-for-react'
import './index.scss'

interface CircleChartProps {
  /**
   * 进度值 (0-100)
   */
  value: number
  /**
   * 显示的文本
   */
  displayText: string
  /**
   * 标题
   */
  title: string
  /**
   * 增长信息
   */
  growth?: {
    value: string
    trend: 'up' | 'down'
  }
  /**
   * 主色调
   */
  color: string
  /**
   * 尺寸
   */
  size?: 'small' | 'medium' | 'large'
  /**
   * 自定义样式类名
   */
  className?: string
}

const CircleChart: React.FC<CircleChartProps> = ({
  value,
  displayText,
  title,
  growth,
  color,
  size = 'medium',
  className = '',
}) => {
  const getChartOption = () => {
    const percentage = Math.max(0, Math.min(100, value))

    return {
      series: [
        {
          type: 'pie',
          radius: ['70%', '90%'],
          center: ['50%', '50%'],
          startAngle: 90,
          data: [
            {
              value: percentage,
              itemStyle: {
                color: color,
              },
            },
            {
              value: 100 - percentage,
              itemStyle: {
                color: '#e9ecef',
              },
              label: {
                show: false,
              },
            },
          ],
          label: {
            show: false,
          },
          emphasis: {
            disabled: true,
          },
          animation: true,
          animationType: 'scale',
          animationDuration: 1000,
        },
      ],
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: 'center',
          style: {
            text: displayText,
            fontSize: size === 'small' ? 14 : size === 'medium' ? 16 : 18,
            fontWeight: 'bold',
            fill: '#333',
          },
        },
      ],
    }
  }

  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 60, height: 60 }
      case 'medium':
        return { width: 80, height: 80 }
      case 'large':
        return { width: 100, height: 100 }
      default:
        return { width: 80, height: 80 }
    }
  }

  const chartSize = getSize()

  return (
    <View
      className={`circle-chart-container ${className} circle-chart-container--${size}`}
    >
      <View className="circle-chart-wrapper">
        <ReactECharts
          option={getChartOption()}
          style={{
            width: `${chartSize.width}px`,
            height: `${chartSize.height}px`,
          }}
          opts={{
            renderer: 'svg',
            width: chartSize.width,
            height: chartSize.height,
          }}
        />
      </View>

      <Text className="circle-chart-title">{title}</Text>

      {growth && (
        <View className="circle-chart-growth">
          <Text className={`growth-text growth-text--${growth.trend}`}>
            {growth.trend === 'up' ? '↗' : '↘'} {growth.value}
          </Text>
        </View>
      )}
    </View>
  )
}

export default CircleChart

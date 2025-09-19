import React from 'react'
import { Text } from '@tarojs/components'
import { useCountAnimation, easingFunctions } from '@/hooks/useCountAnimation'
import './index.scss'

export interface AnimatedNumberProps {
  /**
   * 目标数值
   */
  value: number
  /**
   * 动画持续时间（毫秒）
   */
  duration?: number
  /**
   * 动画缓动函数类型
   */
  easing?: keyof typeof easingFunctions
  /**
   * 是否启用动画
   */
  animated?: boolean
  /**
   * 额外的样式类名
   */
  className?: string
  /**
   * 内联样式
   */
  style?: React.CSSProperties
  /**
   * 数字格式化函数
   */
  formatter?: (value: number) => string
  /**
   * 前缀
   */
  prefix?: string
  /**
   * 后缀
   */
  suffix?: string
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 800,
  easing = 'easeOutQuad',
  animated = true,
  className = '',
  style = {},
  formatter = (num: number) => num.toString(),
  prefix = '',
  suffix = '',
}) => {
  const animatedValue = useCountAnimation(value, {
    duration,
    easing: easingFunctions[easing],
    enabled: animated,
  })

  const displayValue = formatter(animatedValue)

  return (
    <Text className={`animated-number ${className}`} style={style}>
      {prefix}
      {displayValue}
      {suffix}
    </Text>
  )
}

export default AnimatedNumber

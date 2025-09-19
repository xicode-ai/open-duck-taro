/* eslint-disable no-undef */
import { useState, useEffect, useRef } from 'react'

interface UseCountAnimationOptions {
  /**
   * 动画持续时间（毫秒）
   */
  duration?: number
  /**
   * 动画缓动函数
   */
  easing?: (t: number) => number
  /**
   * 是否启用动画
   */
  enabled?: boolean
}

/**
 * 数字计数动画 Hook
 * @param target 目标数值
 * @param options 动画配置选项
 * @returns 当前动画显示的数值
 */
export const useCountAnimation = (
  target: number,
  options: UseCountAnimationOptions = {}
) => {
  const {
    duration = 800,
    easing = (t: number) => t * (2 - t), // easeOutQuad
    enabled = true,
  } = options

  const [current, setCurrent] = useState(target)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const startValueRef = useRef(target)
  const targetRef = useRef(target)

  useEffect(() => {
    // 如果动画被禁用，直接设置目标值
    if (!enabled) {
      setCurrent(target)
      return
    }

    // 如果目标值没有改变，不执行动画
    if (target === targetRef.current) {
      return
    }

    // 清除之前的动画
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // 更新起始值和目标值
    startValueRef.current = current
    targetRef.current = target
    startTimeRef.current = null

    // 定义动画函数
    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime
      }

      const elapsed = currentTime - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // 应用缓动函数
      const easedProgress = easing(progress)

      // 计算当前值
      const currentValue =
        startValueRef.current +
        (targetRef.current - startValueRef.current) * easedProgress

      setCurrent(Math.round(currentValue))

      // 如果动画未完成，继续下一帧
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        animationRef.current = null
      }
    }

    // 开始动画
    animationRef.current = requestAnimationFrame(animate)

    // 清理函数
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [target, duration, easing, enabled, current])

  // 组件卸载时清理动画
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return current
}

// 预设的缓动函数
export const easingFunctions = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeOutBounce: (t: number) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
    }
  },
}

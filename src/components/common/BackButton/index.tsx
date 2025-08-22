import React from 'react'
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import SvgIcon from '../../SvgIcon'
import './index.scss'

interface BackButtonProps {
  /** 自定义返回逻辑 */
  onBack?: () => void
  /** 按钮颜色 */
  color?: string
  /** 按钮大小 */
  size?: number
  /** 是否显示文字 */
  showText?: boolean
  /** 自定义文字 */
  text?: string
  /** 是否为绝对定位 */
  absolute?: boolean
  /** 是否显示背景 */
  hasBackground?: boolean
}

const BackButton: React.FC<BackButtonProps> = ({
  onBack,
  color = '#ffffff',
  size = 26,
  showText = false,
  text = '返回',
  absolute = false,
  hasBackground = true,
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      // 检查是否可以返回
      const pages = Taro.getCurrentPages()
      if (pages.length > 1) {
        Taro.navigateBack()
      } else {
        // 如果是第一个页面，跳转到首页
        Taro.switchTab({
          url: '/pages/index/index',
        })
      }
    }
  }

  return (
    <View
      className={`back-button ${absolute ? 'back-button--absolute' : ''} ${!hasBackground ? 'back-button--no-bg' : ''}`}
      onClick={handleBack}
    >
      <View className="back-button__icon">
        <SvgIcon name="arrow-left" size={size} color={color} />
      </View>
      {showText && (
        <View className="back-button__text" style={{ color }}>
          {text}
        </View>
      )}
    </View>
  )
}

export default BackButton

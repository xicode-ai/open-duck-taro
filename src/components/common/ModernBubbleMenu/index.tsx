import React from 'react'
import { View, Text } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import './index.scss'

export interface ModernBubbleMenuProps {
  visible: boolean
  position?: {
    x: number
    y: number
  }
  onClose: () => void
  onTranslate: () => void
  onCopy: () => void
}

const ModernBubbleMenu: React.FC<ModernBubbleMenuProps> = ({
  visible,
  position,
  onClose,
  onTranslate,
  onCopy,
}) => {
  if (!visible) return null

  return (
    <>
      {/* 遮罩层 */}
      <View className="bubble-menu-overlay" onClick={onClose} />

      {/* 现代化气泡菜单 */}
      <View
        className={`modern-bubble-menu ${position ? 'positioned' : 'centered'}`}
        style={
          position
            ? {
                left: `${position.x}px`,
                top: `${position.y - 80}px`, // 显示在点击位置上方80px
                transform: 'translateX(-50%)',
              }
            : {}
        }
      >
        {/* 菜单容器 */}
        <View className="bubble-menu-container">
          {/* 翻译按钮 */}
          <View className="bubble-menu-item" onClick={onTranslate}>
            <View className="bubble-menu-icon">
              <AtIcon value="message" size="22" color="#ffffff" />
            </View>
            <Text className="bubble-menu-text">翻译</Text>
          </View>

          {/* 复制按钮 */}
          <View className="bubble-menu-item" onClick={onCopy}>
            <View className="bubble-menu-icon">
              <AtIcon value="file-generic" size="22" color="#ffffff" />
            </View>
            <Text className="bubble-menu-text">复制</Text>
          </View>
        </View>

        {/* 向下的箭头 */}
        <View className="bubble-menu-arrow" />
      </View>
    </>
  )
}

export default ModernBubbleMenu

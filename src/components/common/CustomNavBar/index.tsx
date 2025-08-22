import React, { ReactNode } from 'react'
import { View, Text } from '@tarojs/components'
import BackButton from '../BackButton' // Corrected: Use default import
import './index.scss'

export interface CustomNavBarProps {
  /**
   * The title to be displayed in the center of the navigation bar.
   */
  title: string
  /**
   * A custom React node to be rendered on the right side of the navigation bar.
   * Can be an icon, a button, or any other component.
   */
  renderRight?: ReactNode
  /**
   * Optional custom handler for the back button press.
   * If not provided, it defaults to `Taro.navigateBack()`.
   */
  onBack?: () => void
  /**
   * Whether to show the back button. Defaults to `true`.
   */
  showBackButton?: boolean
  /**
   * Custom background color for the navigation bar.
   * Defaults to the theme color if not provided.
   */
  backgroundColor?: string
}

const CustomNavBar: React.FC<CustomNavBarProps> = ({
  title,
  renderRight,
  onBack,
  showBackButton = true,
  backgroundColor,
}) => {
  const navBarStyle = backgroundColor ? { backgroundColor } : {}

  return (
    <View className="custom-nav-bar" style={navBarStyle}>
      <View className="nav-bar-left-group">
        {showBackButton && (
          <BackButton color="white" hasBackground={false} onBack={onBack} />
        )}
        <Text className="nav-bar-title">{title}</Text>
      </View>
      <View className="nav-bar-right-group">
        {renderRight || <View className="placeholder" />}
      </View>
    </View>
  )
}

export default CustomNavBar

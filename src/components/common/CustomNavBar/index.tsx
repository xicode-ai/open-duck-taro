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
  /**
   * Text color for title and buttons. Defaults to white.
   */
  textColor?: string
  /**
   * Subtitle displayed below the main title
   */
  subtitle?: string
  /**
   * Custom className for additional styling
   */
  className?: string
  /**
   * Whether this navbar is for the home page (changes layout)
   */
  isHomePage?: boolean
}

const CustomNavBar: React.FC<CustomNavBarProps> = ({
  title,
  renderRight,
  onBack,
  showBackButton = true,
  backgroundColor,
  textColor = 'white',
  subtitle,
  className = '',
  isHomePage = false,
}) => {
  const navBarStyle = {
    ...(backgroundColor ? { backgroundColor } : {}),
    color: textColor,
  }

  const titleStyle = {
    color: textColor,
  }

  return (
    <View
      className={`custom-nav-bar ${className} ${isHomePage ? 'home-page' : ''}`}
      style={navBarStyle}
    >
      <View className="nav-bar-left-group">
        {showBackButton && (
          <BackButton color={textColor} hasBackground={false} onBack={onBack} />
        )}
        <View className="title-container">
          <Text className="nav-bar-title" style={titleStyle}>
            {title}
          </Text>
          {subtitle && (
            <Text className="nav-bar-subtitle" style={{ color: textColor }}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View className="nav-bar-right-group">
        {renderRight || <View className="placeholder" />}
      </View>
    </View>
  )
}

export default CustomNavBar

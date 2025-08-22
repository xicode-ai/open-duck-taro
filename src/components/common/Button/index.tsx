import React from 'react'
import { AtButton } from 'taro-ui'
import './index.scss'

// 按钮类型
export type ButtonType =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'text'

// 按钮尺寸
export type ButtonSize = 'small' | 'normal' | 'large'

// 按钮属性
export interface ButtonProps {
  type?: ButtonType
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  block?: boolean
  round?: boolean
  plain?: boolean
  icon?: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
  onLongPress?: () => void
}

const Button: React.FC<ButtonProps> = ({
  type = 'primary',
  size = 'normal',
  disabled = false,
  loading = false,
  block = false,
  round = false,
  plain = false,
  icon,
  children,
  className = '',
  onClick,
  onLongPress: _onLongPress,
}) => {
  const buttonClass = [
    'common-button',
    `common-button--${type}`,
    `common-button--${size}`,
    disabled && 'common-button--disabled',
    loading && 'common-button--loading',
    block && 'common-button--block',
    round && 'common-button--round',
    plain && 'common-button--plain',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // 映射按钮类型到 Taro UI 支持的类型
  const getAtButtonType = () => {
    if (type === 'text') return undefined
    if (type === 'primary' || type === 'secondary') return type
    return 'primary' // 其他类型默认使用 primary
  }

  // 映射尺寸到 Taro UI 支持的尺寸
  const getAtButtonSize = () => {
    if (size === 'small' || size === 'normal') return size
    return 'normal' // large 默认使用 normal
  }

  return (
    <AtButton
      type={getAtButtonType()}
      size={getAtButtonSize()}
      disabled={disabled || loading}
      loading={loading}
      full={block}
      circle={round}
      className={buttonClass}
      onClick={onClick}
    >
      {icon && <view className={`at-icon at-icon-${icon}`}></view>}
      {children}
    </AtButton>
  )
}

export default Button

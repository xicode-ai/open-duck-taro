import React from 'react'
import { View, Text } from '@tarojs/components'
import { AtModal, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui'
import Button from '../Button'
import './index.scss'

// 模态框属性
export interface ModalProps {
  isOpened: boolean
  title?: string
  content?: React.ReactNode
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  showConfirm?: boolean
  confirmType?: 'primary' | 'danger'
  closeOnClickOverlay?: boolean
  onConfirm?: () => void
  onCancel?: () => void
  onClose?: () => void
  className?: string
  children?: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({
  isOpened,
  title,
  content,
  confirmText = '确定',
  cancelText = '取消',
  showCancel = true,
  showConfirm = true,
  confirmType = 'primary',
  closeOnClickOverlay = true,
  onConfirm,
  onCancel,
  onClose,
  className = '',
  children,
}) => {
  const handleConfirm = () => {
    onConfirm?.()
    onClose?.()
  }

  const handleCancel = () => {
    onCancel?.()
    onClose?.()
  }

  const handleClose = () => {
    if (closeOnClickOverlay) {
      onClose?.()
    }
  }

  return (
    <AtModal
      isOpened={isOpened}
      onClose={handleClose}
      className={`common-modal ${className}`}
    >
      {title && (
        <AtModalHeader>
          <Text className="modal-title">{title}</Text>
        </AtModalHeader>
      )}

      <AtModalContent>
        <View className="modal-content">
          {content && <Text className="modal-text">{content}</Text>}
          {children}
        </View>
      </AtModalContent>

      {(showCancel || showConfirm) && (
        <AtModalAction>
          <View className="modal-actions">
            {showCancel && (
              <Button
                type="text"
                size="normal"
                onClick={handleCancel}
                className="modal-button modal-cancel"
              >
                {cancelText}
              </Button>
            )}
            {showConfirm && (
              <Button
                type={confirmType}
                size="normal"
                onClick={handleConfirm}
                className="modal-button modal-confirm"
              >
                {confirmText}
              </Button>
            )}
          </View>
        </AtModalAction>
      )}
    </AtModal>
  )
}

// 便捷方法
export const showModal = (options: Omit<ModalProps, 'isOpened'>) => {
  return new Promise<boolean>(resolve => {
    const modalProps: ModalProps = {
      ...options,
      isOpened: true,
      onConfirm: () => {
        options.onConfirm?.()
        resolve(true)
      },
      onCancel: () => {
        options.onCancel?.()
        resolve(false)
      },
      onClose: () => {
        options.onClose?.()
        resolve(false)
      },
    }

    // 这里需要在实际使用时通过状态管理或其他方式显示模态框
    // 由于这是一个通用组件，具体实现需要在使用时处理
    console.log('Modal options:', modalProps)
  })
}

export default Modal

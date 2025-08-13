import React, { Component, ErrorInfo, ReactNode } from 'react'
import { View, Text } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import './index.scss'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // 调用自定义错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // 可以在这里记录错误日志
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleGoBack = () => {
    // 返回上一页
    if (typeof window !== 'undefined' && window.history) {
      window.history.back()
    }
  }

  render() {
    if (this.state.hasError) {
      // 自定义错误界面
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认错误界面
      return (
        <View className="error-boundary">
          <View className="error-content">
            <View className="error-icon">⚠️</View>
            <Text className="error-title">页面出错了</Text>
            <Text className="error-message">
              {this.state.error?.message || '发生了一些意外情况'}
            </Text>

            <View className="error-actions">
              <AtButton
                type="primary"
                size="small"
                onClick={this.handleRetry}
                className="retry-btn"
              >
                重试
              </AtButton>
              <AtButton size="small" onClick={this.handleGoBack} className="back-btn">
                返回
              </AtButton>
            </View>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <View className="error-details">
                <Text className="details-title">错误详情 (开发环境)</Text>
                <Text className="error-stack">{this.state.error?.stack}</Text>
                <Text className="component-stack">{this.state.errorInfo.componentStack}</Text>
              </View>
            )}
          </View>
        </View>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

export type { Props as ErrorBoundaryProps }

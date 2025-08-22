import React, { Component, ErrorInfo, ReactNode } from 'react'
import { View, Text } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import { showToast } from '@/utils'
import './index.scss'

// 错误类型
export type ErrorType = 'network' | 'runtime' | 'chunk' | 'unknown'

// 错误报告接口
export interface ErrorReport {
  error: Error
  errorInfo: ErrorInfo
  timestamp: number
  userAgent: string
  url: string
  userId?: string
  errorType: ErrorType
}

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  enableErrorReporting?: boolean
  maxRetries?: number
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
  errorType: ErrorType
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorType: 'unknown',
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorType: ErrorBoundary.getErrorType(error),
    }
  }

  // 判断错误类型
  static getErrorType(error: Error): ErrorType {
    if (
      error.message.includes('Loading chunk') ||
      error.message.includes('ChunkLoadError')
    ) {
      return 'chunk'
    }
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return 'network'
    }
    return 'runtime'
  }

  // 错误上报
  private async reportError(error: Error, errorInfo: ErrorInfo) {
    if (!this.props.enableErrorReporting) return

    try {
      const report: ErrorReport = {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack || '',
        } as Error,
        errorInfo,
        timestamp: Date.now(),
        userAgent: window.navigator?.userAgent || '',
        url: window.location?.href || '',
        errorType: this.state.errorType,
      }

      // 这里可以发送到错误监控服务
      console.log('Error Report:', report)

      // 示例：发送到API
      // await fetch('/api/error-report', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report)
      // })
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
      errorType: ErrorBoundary.getErrorType(error),
    })

    // 调用自定义错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // 错误上报
    this.reportError(error, errorInfo)

    // 记录错误日志
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    const { maxRetries = 3 } = this.props
    const { retryCount } = this.state

    if (retryCount >= maxRetries) {
      showToast('重试次数过多，请刷新页面')
      return
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: retryCount + 1,
    })

    // 对于代码块加载错误，尝试刷新页面
    if (this.state.errorType === 'chunk') {
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }
  }

  handleGoBack = () => {
    // 返回上一页
    if (typeof window !== 'undefined' && window.history) {
      window.history.back()
    }
  }

  handleRefresh = () => {
    window.location.reload()
  }

  // 获取错误描述
  getErrorDescription = () => {
    const { errorType } = this.state

    switch (errorType) {
      case 'network':
        return '网络连接异常，请检查网络设置'
      case 'chunk':
        return '资源加载失败，请刷新页面重试'
      case 'runtime':
        return '程序运行异常，请尝试重新操作'
      default:
        return '发生了一些意外情况'
    }
  }

  // 获取建议操作
  getSuggestedActions = () => {
    const { errorType } = this.state
    const { maxRetries = 3 } = this.props
    const { retryCount } = this.state

    const actions = []

    if (retryCount < maxRetries) {
      actions.push({
        text: '重试',
        type: 'primary' as const,
        onClick: this.handleRetry,
      })
    }

    if (errorType === 'chunk' || retryCount >= maxRetries) {
      actions.push({
        text: '刷新页面',
        type: 'primary' as const,
        onClick: this.handleRefresh,
      })
    }

    actions.push({
      text: '返回',
      type: 'secondary' as const,
      onClick: this.handleGoBack,
    })

    return actions
  }

  render() {
    if (this.state.hasError) {
      // 自定义错误界面
      if (this.props.fallback) {
        return this.props.fallback
      }

      const actions = this.getSuggestedActions()
      const errorDescription = this.getErrorDescription()

      // 默认错误界面
      return (
        <View className="error-boundary">
          <View className="error-content">
            <View className="error-icon">
              {this.state.errorType === 'network'
                ? '🌐'
                : this.state.errorType === 'chunk'
                  ? '📦'
                  : '⚠️'}
            </View>
            <Text className="error-title">页面出错了</Text>
            <Text className="error-message">{errorDescription}</Text>

            {this.state.retryCount > 0 && (
              <Text className="retry-count">
                已重试 {this.state.retryCount} 次
              </Text>
            )}

            <View className="error-actions">
              {actions.map((action, index) => (
                <AtButton
                  key={index}
                  type={action.type === 'primary' ? 'primary' : undefined}
                  size="small"
                  onClick={action.onClick}
                  className={`action-btn ${action.type}`}
                >
                  {action.text}
                </AtButton>
              ))}
            </View>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <View className="error-details">
                <Text className="details-title">错误详情 (开发环境)</Text>
                <Text className="error-type">
                  错误类型: {this.state.errorType}
                </Text>
                <Text className="error-stack">{this.state.error?.stack}</Text>
                <Text className="component-stack">
                  {this.state.errorInfo.componentStack}
                </Text>
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
export { withPageErrorBoundary } from './PageErrorBoundary'

export type { Props as ErrorBoundaryProps }

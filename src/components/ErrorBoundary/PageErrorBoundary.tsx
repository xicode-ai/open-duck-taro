import React, { Component, ComponentType, ErrorInfo } from 'react'
import { View, Text } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import Taro from '@tarojs/taro'
import { ErrorType, ErrorReport } from './index'
import './PageErrorBoundary.scss'

// 页面错误边界的 Props
interface PageErrorBoundaryProps {
  children: React.ReactNode
  fallback?: ComponentType<{ error: Error; retry: () => void }>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  enableErrorReporting?: boolean
  showRetry?: boolean
  pageName?: string
}

interface PageErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorType: ErrorType
  retryCount: number
}

class PageErrorBoundary extends Component<
  PageErrorBoundaryProps,
  PageErrorBoundaryState
> {
  constructor(props: PageErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown',
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<PageErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorType: PageErrorBoundary.getErrorType(error),
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
  private async reportPageError(error: Error, errorInfo: ErrorInfo) {
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
        userId: undefined, // 可以从用户状态获取
      }

      // 发送错误报告到服务器
      console.error('Page Error Report:', {
        ...report,
        pageName: this.props.pageName,
        retryCount: this.state.retryCount,
      })

      // 这里可以调用实际的错误上报 API
      // await errorReportingService.reportError(report)
    } catch (reportError) {
      console.error('Failed to report page error:', reportError)
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
      errorType: PageErrorBoundary.getErrorType(error),
    })

    // 调用自定义错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // 错误上报
    this.reportPageError(error, errorInfo)

    // 记录错误日志
    console.error(
      `Page Error in ${this.props.pageName || 'Unknown Page'}:`,
      error,
      errorInfo
    )
  }

  // 重试处理
  handleRetry = () => {
    if (this.state.retryCount >= 2) {
      Taro.showToast({
        title: '多次重试失败，请重启应用',
        icon: 'error',
      })
      return
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }))

    // 对于代码块加载错误，重新加载页面
    if (this.state.errorType === 'chunk') {
      setTimeout(() => {
        Taro.reLaunch({ url: '/pages/index/index' })
      }, 100)
    }
  }

  // 返回首页
  handleGoHome = () => {
    Taro.reLaunch({ url: '/pages/index/index' })
  }

  // 获取错误描述
  getErrorDescription = () => {
    const { errorType } = this.state

    switch (errorType) {
      case 'network':
        return '网络连接失败，请检查网络后重试'
      case 'chunk':
        return '页面资源加载失败，请重新进入'
      case 'runtime':
        return '页面运行出错，请稍后重试'
      default:
        return '页面出现异常，请重试'
    }
  }

  render() {
    if (this.state.hasError) {
      const { fallback: CustomFallback, showRetry = true } = this.props

      // 如果提供了自定义错误组件
      if (CustomFallback) {
        return (
          <CustomFallback error={this.state.error!} retry={this.handleRetry} />
        )
      }

      // 默认错误界面
      return (
        <View className="page-error-boundary">
          <View className="error-content">
            <View className="error-icon">
              {this.state.errorType === 'network'
                ? '🌐'
                : this.state.errorType === 'chunk'
                  ? '📦'
                  : '⚠️'}
            </View>

            <Text className="error-title">页面出错了</Text>
            <Text className="error-message">{this.getErrorDescription()}</Text>

            {this.state.retryCount > 0 && (
              <Text className="retry-count">
                已重试 {this.state.retryCount} 次
              </Text>
            )}

            <View className="error-actions">
              {showRetry && this.state.retryCount < 2 && (
                <AtButton
                  type="primary"
                  size="small"
                  onClick={this.handleRetry}
                  className="retry-btn"
                >
                  重试
                </AtButton>
              )}

              <AtButton
                size="small"
                onClick={this.handleGoHome}
                className="home-btn"
              >
                返回首页
              </AtButton>
            </View>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <View className="error-details">
                <Text className="details-title">错误详情 (开发环境)</Text>
                <Text className="error-type">页面: {this.props.pageName}</Text>
                <Text className="error-type">
                  错误类型: {this.state.errorType}
                </Text>
                <Text className="error-stack">{this.state.error?.stack}</Text>
              </View>
            )}
          </View>
        </View>
      )
    }

    return <>{this.props.children}</>
  }
}

// 页面错误边界的 HOC
export function withPageErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: {
    pageName?: string
    enableErrorReporting?: boolean
    showRetry?: boolean
    fallback?: ComponentType<{ error: Error; retry: () => void }>
    onError?: (error: Error, errorInfo: ErrorInfo) => void
  } = {}
) {
  const WithPageErrorBoundaryComponent: React.FC<P> = props => {
    return (
      <PageErrorBoundary
        pageName={options.pageName}
        enableErrorReporting={options.enableErrorReporting ?? true}
        showRetry={options.showRetry ?? true}
        fallback={options.fallback}
        onError={options.onError}
      >
        <WrappedComponent {...props} />
      </PageErrorBoundary>
    )
  }

  WithPageErrorBoundaryComponent.displayName = `withPageErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`

  return WithPageErrorBoundaryComponent
}

export default PageErrorBoundary

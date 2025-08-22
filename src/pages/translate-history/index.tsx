import { View, Text } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import { withPageErrorBoundary } from '@/components/ErrorBoundary/PageErrorBoundary'
import './index.scss'

const TranslateHistory = () => {
  return (
    <View className="translate-history-page">
      <View className="empty-state">
        <AtIcon value="clock" size="64" color="#cccccc" />
        <Text className="empty-text">翻译历史记录</Text>
        <Text className="empty-description">您的翻译记录将在这里显示</Text>
      </View>
    </View>
  )
}

export default withPageErrorBoundary(TranslateHistory, {
  pageName: '翻译历史',
  enableErrorReporting: true,
  showRetry: true,
})

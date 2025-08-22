import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import { safeEventHandler } from '@/utils'
import { withPageErrorBoundary } from '@/components/ErrorBoundary/PageErrorBoundary'
import CustomNavBar from '@/components/common/CustomNavBar'
import './index.scss'

const VocabularyPage = () => {
  // Learning stages data (as per the new UI)
  const learningStages = [
    {
      key: 'sprout',
      name: '萌芽期',
      age: '3-6岁',
      icon: '🌱',
      isPremium: false,
    },
    {
      key: 'basic',
      name: '基础期',
      age: '6-12岁',
      icon: '📖',
      isPremium: false,
    },
    {
      key: 'development',
      name: '发展期',
      age: '12-15岁',
      icon: '🚀',
      isPremium: true,
    },
    {
      key: 'acceleration',
      name: '加速期',
      age: '15-18岁',
      icon: '⚡️',
      isPremium: true,
    },
    {
      key: 'mastery',
      name: '精通期',
      age: '18-30岁',
      icon: '🏆',
      isPremium: true,
    },
    {
      key: 'grandmaster',
      name: '大师期',
      age: '30岁+',
      icon: '👑',
      isPremium: true,
    },
  ]

  const instructions = [
    {
      key: 'free',
      icon: 'check',
      iconColor: '#10b981',
      text: '萌芽期和基础期免费开放，适合初学者',
    },
    {
      key: 'premium',
      icon: 'crown',
      iconColor: '#f97316',
      text: '其他阶段需要开通会员，解锁更多高级功能',
    },
    {
      key: 'content',
      icon: 'book',
      iconColor: '#6366f1',
      text: '每个阶段都有针对性的词汇和例句',
    },
  ]

  const [_selectedStage, _setSelectedStage] = useState('basic')

  const handleStageSelect = safeEventHandler((stageKey: string) => {
    Taro.navigateTo({
      url: `/pages/vocabulary-study/index?stage=${stageKey}`,
    })
  }, 'stage-select')

  const handleHistoryClick = () => {
    Taro.navigateTo({
      url: '/pages/translate-history/index',
    })
  }

  return (
    <View className="vocabulary-level-page">
      <CustomNavBar
        title="背单词"
        backgroundColor="#d9534f"
        renderRight={
          <View className="nav-right-btn" onClick={handleHistoryClick}>
            <AtIcon value="clock" size="22" color="white" />
          </View>
        }
      />
      <ScrollView className="content-area" scrollY>
        <View className="page-intro">
          <Text className="main-title">选择你的学习阶段</Text>
          <Text className="subtitle">
            语境学习法，大脑善于记忆有联系、有故事的信息
          </Text>
        </View>

        <View className="stages-grid">
          {learningStages.map(stage => (
            <View
              key={stage.key}
              className="stage-card"
              onClick={() => handleStageSelect(stage.key)}
            >
              {stage.isPremium && (
                <View className="premium-badge">
                  <Text className="premium-icon">👑</Text>
                </View>
              )}
              <View className="stage-icon-wrapper">
                <Text className="stage-icon">{stage.icon}</Text>
              </View>
              <Text className="stage-name">{stage.name}</Text>
              <Text className="stage-age">{stage.age}</Text>
            </View>
          ))}
        </View>

        <View className="instructions-section">
          <Text className="instructions-title">学习说明</Text>
          <View className="instructions-list">
            {instructions.map(item => (
              <View key={item.key} className="instruction-item">
                <View
                  className="instruction-icon-wrapper"
                  style={{ backgroundColor: `${item.iconColor}1A` }}
                >
                  <AtIcon value={item.icon} size="16" color={item.iconColor} />
                </View>
                <Text className="instruction-text">{item.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default withPageErrorBoundary(VocabularyPage, {
  pageName: '背单词阶段选择',
  enableErrorReporting: true,
})

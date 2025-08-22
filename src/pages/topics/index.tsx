import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import { useTopicStore } from '@/stores'
import { safeEventHandler } from '@/utils'
import { withPageErrorBoundary } from '@/components/ErrorBoundary/PageErrorBoundary'
import { CustomNavBar } from '@/components/common'
import type { Topic } from '@/types'
import './index.scss'

const Topics = () => {
  const {
    topics: _topics,
    favoriteTopics: _favoriteTopics,
    setTopics,
    addToFavorites: _addToFavorites,
    removeFromFavorites: _removeFromFavorites,
  } = useTopicStore()

  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([])

  useEffect(() => {
    // 话题数据（基于截图中显示的话题）
    const topicData: Topic[] = [
      {
        id: '1',
        title: '咖啡',
        description: '点咖啡、描述口味偏好',
        category: 'daily',
        level: 'elementary',
        icon: '☕',
        color: '#fbbf24',
        dialogCount: 8,
        dialogues: [
          {
            id: '1-1',
            speaker: 'A',
            english: 'Good morning! What can I get you today?',
            chinese: '早上好！您今天想要点什么？',
          },
          {
            id: '1-2',
            speaker: 'B',
            english: "I'd like a large cappuccino, please.",
            chinese: '我想要一杯大杯卡布奇诺，谢谢。',
          },
          {
            id: '1-3',
            speaker: 'A',
            english: 'Would you like any sugar or cream with that?',
            chinese: '您需要加糖或奶油吗？',
          },
          {
            id: '1-4',
            speaker: 'B',
            english: 'Just a little sugar, please.',
            chinese: '请加一点糖就行。',
          },
          {
            id: '1-5',
            speaker: 'A',
            english: 'That will be $4.50. For here or to go?',
            chinese: '总共4.50美元。堂食还是外带？',
          },
          {
            id: '1-6',
            speaker: 'B',
            english: 'For here, thank you.',
            chinese: '堂食，谢谢。',
          },
          {
            id: '1-7',
            speaker: 'A',
            english: 'Perfect! Your cappuccino will be ready in just a moment.',
            chinese: '好的！您的卡布奇诺马上就好。',
          },
          {
            id: '1-8',
            speaker: 'B',
            english: 'Thank you so much!',
            chinese: '非常感谢！',
          },
        ],
      },
      {
        id: '2',
        title: '旅游',
        description: '机场、酒店、问路',
        category: 'travel',
        level: 'middle',
        icon: '✈️',
        color: '#60a5fa',
        dialogCount: 6,
        dialogues: [
          {
            id: '2-1',
            speaker: 'A',
            english: 'Excuse me, where is the departure gate for flight AA123?',
            chinese: '不好意思，请问AA123航班的登机口在哪里？',
          },
          {
            id: '2-2',
            speaker: 'B',
            english: 'Gate A12. You need to go upstairs and turn left.',
            chinese: 'A12登机口。您需要上楼然后左转。',
          },
          {
            id: '2-3',
            speaker: 'A',
            english: 'How long does it take to walk there?',
            chinese: '走过去需要多长时间？',
          },
          {
            id: '2-4',
            speaker: 'B',
            english: 'About 10 minutes. Boarding starts in 30 minutes.',
            chinese: '大约10分钟。30分钟后开始登机。',
          },
          {
            id: '2-5',
            speaker: 'A',
            english: 'Great, thank you for your help!',
            chinese: '太好了，谢谢您的帮助！',
          },
          {
            id: '2-6',
            speaker: 'B',
            english: 'You are welcome. Have a safe flight!',
            chinese: '不客气。祝您旅途愉快！',
          },
        ],
      },
      {
        id: '3',
        title: '健身',
        description: '健身房、运动计划',
        category: 'health',
        level: 'elementary',
        icon: '💪',
        color: '#34d399',
        dialogCount: 6,
        dialogues: [
          {
            id: '3-1',
            speaker: 'A',
            english:
              'Hi, I would like to join the gym. Do you have any membership plans?',
            chinese: '你好，我想加入健身房。你们有什么会员计划吗？',
          },
          {
            id: '3-2',
            speaker: 'B',
            english:
              'Yes, we have monthly and yearly plans. The monthly plan is $50.',
            chinese: '有的，我们有月卡和年卡。月卡是50美元。',
          },
          {
            id: '3-3',
            speaker: 'A',
            english: 'What about the yearly plan?',
            chinese: '年卡呢？',
          },
          {
            id: '3-4',
            speaker: 'B',
            english: 'The yearly plan is $500, which saves you $100.',
            chinese: '年卡是500美元，可以为您节省100美元。',
          },
          {
            id: '3-5',
            speaker: 'A',
            english: "That sounds good. I'll take the yearly plan.",
            chinese: '听起来不错。我要年卡。',
          },
          {
            id: '3-6',
            speaker: 'B',
            english: 'Excellent choice! Let me get the paperwork for you.',
            chinese: '很好的选择！让我为您拿手续文件。',
          },
        ],
      },
      {
        id: '4',
        title: '餐厅',
        description: '点餐、服务、买单',
        category: 'food',
        level: 'elementary',
        icon: '🍽️',
        color: '#f87171',
        dialogCount: 8,
        dialogues: [
          {
            id: '4-1',
            speaker: 'A',
            english: 'Good evening! Welcome to our restaurant. Table for two?',
            chinese: '晚上好！欢迎来到我们的餐厅。两位用餐吗？',
          },
          {
            id: '4-2',
            speaker: 'B',
            english: 'Yes, table for two, please.',
            chinese: '是的，两个人的桌子，谢谢。',
          },
          {
            id: '4-3',
            speaker: 'A',
            english: 'Right this way. Here are your menus.',
            chinese: '请这边走。这是您的菜单。',
          },
          {
            id: '4-4',
            speaker: 'B',
            english: 'Thank you. Could we get some water first?',
            chinese: '谢谢。我们可以先来些水吗？',
          },
          {
            id: '4-5',
            speaker: 'A',
            english: 'Of course! I will bring it right away.',
            chinese: '当然！我马上就拿来。',
          },
          {
            id: '4-6',
            speaker: 'B',
            english: 'We are ready to order now.',
            chinese: '我们现在准备点餐了。',
          },
          {
            id: '4-7',
            speaker: 'A',
            english: 'Great! What would you like to have tonight?',
            chinese: '好的！您今晚想要什么？',
          },
          {
            id: '4-8',
            speaker: 'B',
            english: 'I will have the grilled salmon, please.',
            chinese: '我要烤三文鱼，谢谢。',
          },
        ],
      },
    ]

    setTopics(topicData)
    setFilteredTopics(topicData)
  }, [setTopics])

  const handleTopicClick = safeEventHandler((topic: Topic) => {
    Taro.navigateTo({
      url: `/pages/topic-chat/index?topicId=${topic.id}&title=${encodeURIComponent(topic.title)}`,
    })
  }, 'topic-click')

  const handleAddTopic = safeEventHandler(() => {
    Taro.showToast({ title: '创建话题功能开发中', icon: 'none' })
  }, 'add-topic')

  return (
    <View className="topics-page">
      <CustomNavBar
        title="话题模式"
        backgroundColor="#34C759"
        renderRight={
          <View className="nav-right-btn" onClick={handleAddTopic}>
            <AtIcon value="add" size="22" color="white" />
          </View>
        }
      />
      <ScrollView className="content-area" scrollY>
        {/* 页面说明 */}
        <View className="page-description">
          <Text className="description-title">选择一个话题开始练习</Text>
          <Text className="description-subtitle">
            每个话题都包含相关的日常对话场景
          </Text>
        </View>

        {/* 话题网格 */}
        <View className="topics-grid">
          {filteredTopics.map(topic => (
            <View
              key={topic.id}
              className="topic-card"
              onClick={() => handleTopicClick(topic)}
            >
              <View
                className="topic-icon-container"
                style={{ backgroundColor: topic.color }}
              >
                <Text className="topic-icon">{topic.icon}</Text>
              </View>

              <View className="topic-content">
                <Text className="topic-title">{topic.title}</Text>
                <Text className="topic-description">{topic.description}</Text>

                <View className="topic-stats">
                  <Text className="dialog-count" style={{ color: topic.color }}>
                    {topic.dialogCount}个对话
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default withPageErrorBoundary(Topics, {
  pageName: '话题学习',
  enableErrorReporting: true,
  showRetry: true,
  onError: (error, errorInfo) => {
    console.log('话题学习页面发生错误:', error, errorInfo)
  },
})

import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { AtSearchBar, AtTabs, AtTabsPane, AtIcon } from 'taro-ui'
import { useTopicStore } from '@/stores'
import type { Topic } from '@/types'
import './index.scss'

const Topics = () => {
  const { topics, favoriteTopics, setTopics, addToFavorites, removeFromFavorites } = useTopicStore()
  // 当前等级暂时不需要

  const [searchValue, setSearchValue] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([])

  const categories = [
    { title: '全部', value: 'all' },
    { title: '日常生活', value: 'daily' },
    { title: '工作商务', value: 'business' },
    { title: '旅游出行', value: 'travel' },
    { title: '健康运动', value: 'health' },
    { title: '美食烹饪', value: 'food' },
    { title: '学习教育', value: 'education' },
  ]

  // 模拟话题数据
  const mockTopics: Topic[] = [
    {
      id: '1',
      title: '咖啡店点餐',
      description: '学习在咖啡店如何点餐和与店员交流',
      category: 'daily',
      level: 'elementary',
      icon: '☕',
      dialogues: [
        {
          id: '1-1',
          speaker: 'A',
          english: 'Good morning! What can I get for you today?',
          chinese: '早上好！今天我能为您做些什么？',
        },
        {
          id: '1-2',
          speaker: 'B',
          english: "I'd like a large cappuccino, please.",
          chinese: '我要一杯大杯的卡布奇诺，谢谢。',
        },
      ],
    },
    {
      id: '2',
      title: '机场登机',
      description: '学习在机场办理登机手续的英语对话',
      category: 'travel',
      level: 'middle',
      icon: '✈️',
      dialogues: [
        {
          id: '2-1',
          speaker: 'A',
          english: 'May I see your passport and boarding pass?',
          chinese: '请出示您的护照和登机牌。',
        },
        {
          id: '2-2',
          speaker: 'B',
          english: 'Here you are.',
          chinese: '给您。',
        },
      ],
    },
    {
      id: '3',
      title: '健身房对话',
      description: '在健身房与教练和其他会员的交流',
      category: 'health',
      level: 'elementary',
      icon: '💪',
      dialogues: [
        {
          id: '3-1',
          speaker: 'A',
          english: 'Is this your first time at the gym?',
          chinese: '这是您第一次来健身房吗？',
        },
        {
          id: '3-2',
          speaker: 'B',
          english: 'Yes, could you show me how to use this machine?',
          chinese: '是的，您能教我如何使用这台机器吗？',
        },
      ],
    },
    {
      id: '4',
      title: '商务会议',
      description: '参加商务会议时的常用表达',
      category: 'business',
      level: 'high',
      icon: '💼',
      dialogues: [
        {
          id: '4-1',
          speaker: 'A',
          english: "Let's start with the quarterly report.",
          chinese: '我们先从季度报告开始。',
        },
        {
          id: '4-2',
          speaker: 'B',
          english: 'The sales figures have increased by 15%.',
          chinese: '销售数据增长了15%。',
        },
      ],
    },
    {
      id: '5',
      title: '餐厅用餐',
      description: '在餐厅点餐和用餐的英语对话',
      category: 'food',
      level: 'elementary',
      icon: '🍽️',
      dialogues: [
        {
          id: '5-1',
          speaker: 'A',
          english: 'Are you ready to order?',
          chinese: '您准备好点餐了吗？',
        },
        {
          id: '5-2',
          speaker: 'B',
          english: "I'll have the grilled salmon, please.",
          chinese: '我要烤三文鱼，谢谢。',
        },
      ],
    },
    {
      id: '6',
      title: '学校报名',
      description: '在学校或培训机构报名时的对话',
      category: 'education',
      level: 'middle',
      icon: '🎓',
      dialogues: [
        {
          id: '6-1',
          speaker: 'A',
          english: 'What courses are you interested in?',
          chinese: '您对哪些课程感兴趣？',
        },
        {
          id: '6-2',
          speaker: 'B',
          english: "I'd like to enroll in the English speaking course.",
          chinese: '我想报名英语口语课程。',
        },
      ],
    },
  ]

  useEffect(() => {
    setTopics(mockTopics)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterTopics()
  }, [topics, searchValue, activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  const filterTopics = () => {
    let filtered = topics

    // 按分类筛选
    if (activeTab > 0) {
      const category = categories[activeTab].value
      filtered = filtered.filter(topic => topic.category === category)
    }

    // 按搜索关键词筛选
    if (searchValue) {
      filtered = filtered.filter(
        topic =>
          topic.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          topic.description.toLowerCase().includes(searchValue.toLowerCase())
      )
    }

    setFilteredTopics(filtered)
  }

  const handleTopicClick = (topic: Topic) => {
    Taro.navigateTo({
      url: `/pages/topic-chat/index?topicId=${topic.id}&title=${encodeURIComponent(topic.title)}`,
    })
  }

  const handleFavoriteToggle = (e: { stopPropagation: () => void }, topicId: string) => {
    e.stopPropagation()

    if (favoriteTopics.includes(topicId)) {
      removeFromFavorites(topicId)
      Taro.showToast({ title: '已取消收藏', icon: 'none' })
    } else {
      addToFavorites(topicId)
      Taro.showToast({ title: '已添加收藏', icon: 'none' })
    }
  }

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      preschool: '#FF9500',
      elementary: '#50C878',
      middle: '#4A90E2',
      high: '#9B59B6',
      university: '#E74C3C',
      master: '#F39C12',
    }
    return colors[level] || '#999999'
  }

  const getLevelName = (level: string) => {
    const names: Record<string, string> = {
      preschool: '萌芽',
      elementary: '基础',
      middle: '发展',
      high: '加速',
      university: '精通',
      master: '大师',
    }
    return names[level] || '未知'
  }

  const renderTopicCard = (topic: Topic) => {
    const isFavorite = favoriteTopics.includes(topic.id)

    return (
      <View key={topic.id} className="topic-card" onClick={() => handleTopicClick(topic)}>
        <View className="card-header">
          <View className="topic-icon">
            <Text className="icon-text">{topic.icon}</Text>
          </View>
          <View className="favorite-btn" onClick={e => handleFavoriteToggle(e, topic.id)}>
            <AtIcon
              value={isFavorite ? 'heart-2' : 'heart'}
              size="20"
              color={isFavorite ? '#ff4444' : '#cccccc'}
            />
          </View>
        </View>

        <View className="card-content">
          <Text className="topic-title">{topic.title}</Text>
          <Text className="topic-description">{topic.description}</Text>

          <View className="card-footer">
            <View className="level-badge" style={{ backgroundColor: getLevelColor(topic.level) }}>
              <Text className="level-text">{getLevelName(topic.level)}</Text>
            </View>
            <Text className="dialogue-count">{topic.dialogues.length} 组对话</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className="topics-page">
      {/* 搜索栏 */}
      <View className="search-section">
        <AtSearchBar
          value={searchValue}
          onChange={setSearchValue}
          placeholder="搜索话题"
          showActionButton={false}
          className="search-bar"
        />
      </View>

      {/* 分类标签 */}
      <View className="tabs-section">
        <AtTabs
          current={activeTab}
          tabList={categories}
          onClick={setActiveTab}
          className="category-tabs"
        >
          <AtTabsPane current={activeTab} index={0}>
            <ScrollView className="topics-grid" scrollY enableBackToTop>
              {filteredTopics.map(renderTopicCard)}

              {filteredTopics.length === 0 && (
                <View className="empty-state">
                  <Image
                    className="empty-image"
                    src="https://img.icons8.com/color/96/000000/search.png"
                  />
                  <Text className="empty-text">
                    {searchValue ? '没有找到相关话题' : '暂无话题'}
                  </Text>
                </View>
              )}
            </ScrollView>
          </AtTabsPane>
        </AtTabs>
      </View>
    </View>
  )
}

export default Topics

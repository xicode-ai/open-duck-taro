import { useState, useEffect, useCallback, useMemo } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import CustomIcon from '../../components/CustomIcon'
import CustomNavBar from '../../components/common/CustomNavBar'
// import { useTopicsStore } from '../../stores/topics' // 暂时注释
import { useUserStore } from '../../stores/user'
import './index.scss'

interface Topic {
  id: string
  title: string
  description: string
  icon: string
  iconClass: string
  background: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  conversations: number
  isNew?: boolean
  isPopular?: boolean
}

const TopicsPage = () => {
  // const { } = useTopicsStore() // 暂时不使用
  const { membership } = useUserStore()

  // 状态管理
  const [searchText, setSearchText] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([])

  // 模拟话题数据
  const mockTopics: Topic[] = useMemo(
    () => [
      {
        id: '1',
        title: '日常生活',
        description: '学习日常生活中的常用对话',
        icon: '🏠',
        iconClass: 'daily',
        background: '🏠',
        category: 'daily',
        difficulty: 'easy',
        conversations: 25,
        isPopular: true,
      },
      {
        id: '2',
        title: '旅行出游',
        description: '机场、酒店、景点相关表达',
        icon: '✈️',
        iconClass: 'travel',
        background: '✈️',
        category: 'travel',
        difficulty: 'medium',
        conversations: 18,
      },
      {
        id: '3',
        title: '美食餐厅',
        description: '点餐、菜单、口味表达',
        icon: '🍽️',
        iconClass: 'food',
        background: '🍽️',
        category: 'food',
        difficulty: 'easy',
        conversations: 22,
        isNew: true,
      },
      {
        id: '4',
        title: '职场工作',
        description: '商务会议、邮件沟通技巧',
        icon: '💼',
        iconClass: 'work',
        background: '💼',
        category: 'work',
        difficulty: 'hard',
        conversations: 15,
      },
      {
        id: '5',
        title: '兴趣爱好',
        description: '音乐、电影、运动话题',
        icon: '🎨',
        iconClass: 'hobby',
        background: '🎨',
        category: 'hobby',
        difficulty: 'medium',
        conversations: 20,
      },
      {
        id: '6',
        title: '购物消费',
        description: '商场、网购、讨价还价',
        icon: '🛒',
        iconClass: 'shopping',
        background: '🛒',
        category: 'shopping',
        difficulty: 'easy',
        conversations: 16,
      },
      {
        id: '7',
        title: '健康医疗',
        description: '看医生、描述症状用语',
        icon: '🏥',
        iconClass: 'health',
        background: '🏥',
        category: 'health',
        difficulty: 'hard',
        conversations: 12,
      },
      {
        id: '8',
        title: '教育学习',
        description: '学校、课程、考试话题',
        icon: '📚',
        iconClass: 'education',
        background: '📚',
        category: 'education',
        difficulty: 'medium',
        conversations: 19,
      },
      {
        id: '9',
        title: '天气气候',
        description: '天气描述、季节变化',
        icon: '🌤️',
        iconClass: 'weather',
        background: '🌤️',
        category: 'weather',
        difficulty: 'easy',
        conversations: 14,
        isNew: true,
      },
      {
        id: '10',
        title: '家庭亲情',
        description: '家人介绍、家庭聚会',
        icon: '👨‍👩‍👧‍👦',
        iconClass: 'family',
        background: '👨‍👩‍👧‍👦',
        category: 'family',
        difficulty: 'easy',
        conversations: 21,
      },
      {
        id: '11',
        title: '运动健身',
        description: '体育运动、健身话题',
        icon: '⚽',
        iconClass: 'sports',
        background: '⚽',
        category: 'sports',
        difficulty: 'medium',
        conversations: 17,
      },
      {
        id: '12',
        title: '娱乐休闲',
        description: '电影、音乐、游戏话题',
        icon: '🎬',
        iconClass: 'entertainment',
        background: '🎬',
        category: 'entertainment',
        difficulty: 'medium',
        conversations: 23,
        isPopular: true,
      },
    ],
    []
  )

  // 分类数据
  const mockCategories = [
    { id: 'all', name: '全部', count: mockTopics.length },
    {
      id: 'daily',
      name: '日常',
      count: mockTopics.filter(t => t.category === 'daily').length,
    },
    {
      id: 'work',
      name: '工作',
      count: mockTopics.filter(t => t.category === 'work').length,
    },
    {
      id: 'travel',
      name: '旅行',
      count: mockTopics.filter(t => t.category === 'travel').length,
    },
    {
      id: 'food',
      name: '美食',
      count: mockTopics.filter(t => t.category === 'food').length,
    },
    {
      id: 'hobby',
      name: '兴趣',
      count: mockTopics.filter(t => t.category === 'hobby').length,
    },
  ]

  // 筛选话题
  const filterTopics = useCallback(() => {
    let filtered = mockTopics

    // 按分类筛选
    if (activeCategory !== 'all') {
      filtered = filtered.filter(topic => topic.category === activeCategory)
    }

    // 按搜索文本筛选
    if (searchText) {
      filtered = filtered.filter(
        topic =>
          topic.title.includes(searchText) ||
          topic.description.includes(searchText)
      )
    }

    setFilteredTopics(filtered)
  }, [activeCategory, searchText, mockTopics])

  // 加载数据
  const loadData = useCallback(async () => {
    setIsLoading(true)

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsLoading(false)
    filterTopics()
  }, [filterTopics])

  // 页面初始化
  useEffect(() => {
    loadData()
  }, [loadData])

  // 筛选话题
  useEffect(() => {
    filterTopics()
  }, [filterTopics])

  // 清空搜索
  const clearSearch = () => {
    setSearchText('')
  }

  // 进入话题对话
  const enterTopicChat = (topic: Topic) => {
    if (topic.difficulty === 'hard' && !membership.isPremium) {
      Taro.showModal({
        title: '需要会员权限',
        content: '高难度话题需要会员权限才能使用',
        confirmText: '开通会员',
        cancelText: '取消',
        success: res => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/membership/index' })
          }
        },
      })
      return
    }

    Taro.navigateTo({
      url: `/pages/topic-chat/index?topicId=${topic.id}&topicTitle=${encodeURIComponent(topic.title)}`,
    })
  }

  // 创建自定义话题
  const createCustomTopic = () => {
    if (!membership.isPremium) {
      Taro.showModal({
        title: '需要会员权限',
        content: '创建自定义话题需要会员权限',
        confirmText: '开通会员',
        cancelText: '取消',
        success: res => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/membership/index' })
          }
        },
      })
      return
    }

    Taro.showToast({
      title: '功能开发中',
      icon: 'none',
    })
  }

  // 下拉刷新
  // const onPullDownRefresh = () => {
  //   loadData()
  //   setTimeout(() => {
  //     Taro.stopPullDownRefresh()
  //   }, 1000)
  // }

  // 获取难度显示文本
  const getDifficultyText = (difficulty: string) => {
    const map: { [key: string]: string } = {
      easy: '简单',
      medium: '中等',
      hard: '困难',
    }
    return map[difficulty] || difficulty
  }

  return (
    <View className="topics-page">
      {/* 导航栏 */}
      <CustomNavBar
        title="话题练习"
        backgroundColor="#9C27B0"
        renderRight={
          <View className="nav-right-btn" onClick={createCustomTopic}>
            <AtIcon value="add" size="20" />
          </View>
        }
      />

      {/* 搜索栏 */}
      <View className="search-section">
        <View className="search-bar">
          <CustomIcon name="search" size={16} />
          <Input
            className="search-input"
            value={searchText}
            onInput={e => setSearchText(e.detail.value)}
            placeholder="搜索话题..."
            placeholderClass="placeholder"
          />
          {searchText && (
            <AtIcon
              value="close-circle"
              className="clear-btn"
              onClick={clearSearch}
            />
          )}
        </View>
      </View>

      {/* 分类筛选 */}
      <View className="filter-section">
        <View className="filter-tabs">
          {mockCategories.map(category => (
            <View
              key={category.id}
              className={`filter-tab ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name} ({category.count})
            </View>
          ))}
        </View>
      </View>

      {/* 话题网格 */}
      {isLoading ? (
        <View className="topics-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index} className="topic-card-skeleton">
              <View className="skeleton-icon"></View>
              <View className="skeleton-title"></View>
              <View className="skeleton-desc"></View>
              <View className="skeleton-stats"></View>
            </View>
          ))}
        </View>
      ) : (
        <View className="topics-grid">
          {filteredTopics.map(topic => (
            <View
              key={topic.id}
              className="topic-card"
              onClick={() => enterTopicChat(topic)}
            >
              {topic.isNew && <View className="new-badge">NEW</View>}
              {topic.isPopular && <View className="popular-badge">热门</View>}

              <View className={`topic-bg`}>{topic.background}</View>

              <View className={`topic-icon ${topic.iconClass}`}>
                <Text>{topic.icon}</Text>
              </View>

              <View className="topic-info">
                <Text className="topic-title">{topic.title}</Text>
                <Text className="topic-desc">{topic.description}</Text>

                <View className="topic-stats">
                  <View className="stat-item">
                    <AtIcon value="message" className="stat-icon" />
                    <Text>{topic.conversations}个对话</Text>
                  </View>

                  <View className={`difficulty ${topic.difficulty}`}>
                    {getDifficultyText(topic.difficulty)}
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 自定义话题 */}
      <View className="custom-topic">
        <View className="custom-header">
          <Text className="custom-title">
            <Text className="title-icon">✨</Text>
            自定义话题
          </Text>
          {!membership.isPremium && (
            <View className="premium-badge">会员专享</View>
          )}
        </View>

        <Text className="custom-desc">
          根据你的需求创建专属话题，让AI外教陪你练习任何你想聊的内容
        </Text>

        <View
          className={`custom-btn ${!membership.isPremium ? 'disabled' : ''}`}
          onClick={createCustomTopic}
        >
          <AtIcon value="add" />
          <Text>创建话题</Text>
        </View>
      </View>

      {/* 学习统计 */}
      <View className="stats-section">
        <Text className="stats-title">
          <Text className="title-icon">📊</Text>
          学习统计
        </Text>

        <View className="stats-grid">
          <View className="stat-item">
            <Text className="stat-number">12</Text>
            <Text className="stat-label">已练习</Text>
          </View>
          <View className="stat-item">
            <Text className="stat-number">8</Text>
            <Text className="stat-label">收藏</Text>
          </View>
          <View className="stat-item">
            <Text className="stat-number">156</Text>
            <Text className="stat-label">对话数</Text>
          </View>
        </View>
      </View>

      {/* 悬浮添加按钮 */}
      <View className="floating-add-btn" onClick={createCustomTopic}>
        <AtIcon value="add" />
      </View>
    </View>
  )
}

export default TopicsPage

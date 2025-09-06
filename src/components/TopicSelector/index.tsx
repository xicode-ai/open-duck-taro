import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import Taro from '@tarojs/taro'
import CustomIcon from '../CustomIcon'
import { chatApi } from '../../services/api'
import './index.scss'

interface TopicCategory {
  id: string
  name: string
  color: string
  topics: string[]
}

interface TopicSelectorProps {
  visible: boolean
  onClose: () => void
  onSelectTopic: (topic: string, category: string) => void
}

const TopicSelector: React.FC<TopicSelectorProps> = ({
  visible,
  onClose,
  onSelectTopic,
}) => {
  const [categories, setCategories] = useState<TopicCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [categoryLoading, setCategoryLoading] = useState(false)

  // 加载话题分类数据
  const loadTopicCategories = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔧 开始请求话题分类数据')
      console.log('🔧 API调用URL: /chat/topic-categories')
      console.log('🔧 当前window.location:', window.location.href)

      const response = await chatApi.getTopicCategories()
      console.log('🔧 话题分类响应:', response)
      console.log('🔧 响应类型:', typeof response)
      console.log('🔧 响应数据结构:', Object.keys(response || {}))
      if (response.code === 200) {
        const data = response.data as TopicCategory[]
        setCategories(data)
        if (data.length > 0 && !selectedCategory) {
          setSelectedCategory(data[0].id)
        }
      }
    } catch (error) {
      console.error('加载话题分类失败:', error)
      Taro.showToast({
        title: '加载失败，请重试',
        icon: 'error',
      })
    } finally {
      setLoading(false)
    }
  }, [selectedCategory])

  // 刷新话题
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // 获取当前分类的随机话题
      const currentCategory = categories.find(
        cat => cat.id === selectedCategory
      )
      if (currentCategory) {
        console.log('🔧 刷新话题，当前分类:', currentCategory.name)
        const response = await chatApi.getRandomTopic(currentCategory.id)
        if (response.code === 200) {
          const data = response.data as { topic: string; category: string }
          const randomTopic = data.topic
          console.log('🔧 获取到随机话题:', randomTopic)

          // 更新当前分类的话题列表，将随机话题添加到开头
          setCategories(prevCategories =>
            prevCategories.map(cat =>
              cat.id === selectedCategory
                ? {
                    ...cat,
                    topics: [
                      randomTopic,
                      ...cat.topics.filter(t => t !== randomTopic),
                    ],
                  }
                : cat
            )
          )

          Taro.showToast({
            title: '已刷新话题',
            icon: 'success',
            duration: 1000,
          })
        }
      } else {
        // 如果没有选中分类，重新加载所有分类
        await loadTopicCategories()
        Taro.showToast({
          title: '已刷新',
          icon: 'success',
          duration: 1000,
        })
      }
    } catch (error) {
      console.error('刷新话题失败:', error)
      Taro.showToast({
        title: '刷新失败',
        icon: 'error',
        duration: 1000,
      })
    } finally {
      setRefreshing(false)
    }
  }

  // 选择话题
  const handleSelectTopic = async (topic: string) => {
    const category = categories.find(cat => cat.id === selectedCategory)
    if (category) {
      try {
        // 先调用选择话题API
        console.log('🔧 选择话题:', topic, '分类:', category.name)
        await chatApi.selectTopic(topic, category.name)
        onSelectTopic(topic, category.name)
        onClose()
      } catch (error) {
        console.error('选择话题失败:', error)
        Taro.showToast({
          title: '选择失败，请重试',
          icon: 'error',
        })
      }
    }
  }

  // 选择分类
  const handleSelectCategory = async (categoryId: string) => {
    if (selectedCategory === categoryId) return // 如果点击的是当前分类，不重复加载

    setSelectedCategory(categoryId)
    setCategoryLoading(true)

    try {
      console.log('🔧 切换到分类:', categoryId)
      console.log('🔧 API调用URL: /chat/topics/' + categoryId)

      // 调用API获取该分类下的话题
      const response = await chatApi.getTopicsByCategory(categoryId)
      console.log('🔧 获取分类话题响应:', response)
      console.log('🔧 响应类型:', typeof response)
      console.log('🔧 响应数据结构:', Object.keys(response || {}))

      if (response.code === 200) {
        const data = response.data as {
          categoryId: string
          topics: string[]
          total: number
        }

        // 更新当前分类的话题列表
        setCategories(prevCategories =>
          prevCategories.map(cat =>
            cat.id === categoryId ? { ...cat, topics: data.topics } : cat
          )
        )

        console.log('🔧 分类话题更新完成:', data.topics.length, '个话题')
      }
    } catch (error) {
      console.error('获取分类话题失败:', error)
      Taro.showToast({
        title: '获取话题失败',
        icon: 'error',
      })
    } finally {
      setCategoryLoading(false)
    }
  }

  // 组件挂载时加载数据
  useEffect(() => {
    if (visible && categories.length === 0) {
      loadTopicCategories()
    }
  }, [visible, categories.length, loadTopicCategories])

  if (!visible) {
    return null
  }

  const currentCategory = categories.find(cat => cat.id === selectedCategory)

  return (
    <View className="topic-selector-overlay" onClick={onClose}>
      <View className="topic-selector" onClick={e => e.stopPropagation()}>
        {/* 头部 */}
        <View className="topic-header">
          <View className="header-left">
            <CustomIcon name="hash" size={24} color="#7c3aed" />
            <Text className="header-title">按住说话</Text>
          </View>
          <View className="header-right">
            <View className="refresh-btn" onClick={handleRefresh}>
              <CustomIcon
                name="refresh-cw"
                size={20}
                color="#6b7280"
                className={refreshing ? 'rotating' : ''}
              />
              <Text className="refresh-text">换一换</Text>
            </View>
            <View className="close-btn" onClick={onClose}>
              <AtIcon value="add" size="20" color="#6b7280" />
            </View>
          </View>
        </View>

        {/* 分类标签 */}
        <ScrollView
          className="category-tabs"
          scrollX
          showScrollbar={false}
          enhanced
        >
          {categories.map(category => (
            <View
              key={category.id}
              className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
              style={{
                backgroundColor:
                  selectedCategory === category.id ? category.color : '#f3f4f6',
                borderColor: category.color,
              }}
              onClick={() => handleSelectCategory(category.id)}
            >
              <Text
                className="category-text"
                style={{
                  color:
                    selectedCategory === category.id
                      ? '#ffffff'
                      : category.color,
                }}
              >
                {category.name}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* 话题列表 */}
        <ScrollView
          className="topic-list"
          scrollY
          enhanced
          showScrollbar={false}
        >
          {loading || categoryLoading ? (
            <View className="loading-container">
              <Text className="loading-text">
                {loading ? '加载中...' : '切换分类中...'}
              </Text>
            </View>
          ) : (
            currentCategory?.topics.map((topic, index) => (
              <View
                key={index}
                className="topic-item"
                onClick={() => handleSelectTopic(topic)}
              >
                <Text className="topic-text">{topic}</Text>
                <View className="topic-arrow">
                  <AtIcon value="chevron-right" size="14" color="#9ca3af" />
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  )
}

export default TopicSelector

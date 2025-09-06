import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import Taro from '@tarojs/taro'
import { topicsApi } from '../../services/api'
import './index.scss'

interface TopicProgressItem {
  topicId: string
  title: string
  icon: string
  completedDialogues: number
  totalDialogues: number
  progress: number
}

interface TopicProgressProps {
  visible: boolean
  onClose: () => void
}

const TopicProgress: React.FC<TopicProgressProps> = ({ visible, onClose }) => {
  const [progressData, setProgressData] = useState<TopicProgressItem[]>([])
  const [loading, setLoading] = useState(false)

  // 加载进度数据
  const loadProgress = async () => {
    try {
      setLoading(true)
      const response = await topicsApi.getTopicsProgress()
      if (response.code === 200) {
        setProgressData(response.data)
      }
    } catch (error) {
      console.error('加载学习进度失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible) {
      loadProgress()
    }
  }, [visible])

  if (!visible) {
    return null
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#10b981' // green
    if (progress >= 60) return '#3b82f6' // blue
    if (progress >= 40) return '#f59e0b' // orange
    return '#ef4444' // red
  }

  return (
    <View className="topic-progress-overlay" onClick={onClose}>
      <View className="topic-progress" onClick={e => e.stopPropagation()}>
        {/* 头部 */}
        <View className="progress-header">
          <View className="header-left">
            <AtIcon value="analytics" size="24" color="#10b981" />
            <Text className="header-title">话题学习进度</Text>
          </View>
          <View className="close-btn" onClick={onClose}>
            <AtIcon value="close" size="20" color="#6b7280" />
          </View>
        </View>

        {/* 内容 */}
        <View className="progress-content">
          {loading ? (
            <View className="loading-container">
              <Text className="loading-text">加载中...</Text>
            </View>
          ) : (
            <View className="progress-list">
              {progressData.map(item => (
                <View key={item.topicId} className="progress-item">
                  <View className="item-left">
                    <View
                      className="topic-icon"
                      style={{
                        backgroundColor: getProgressColor(item.progress),
                      }}
                    >
                      <Text className="icon-text">{item.icon}</Text>
                    </View>
                    <View className="topic-info">
                      <Text className="topic-name">{item.title}</Text>
                      <Text className="topic-stats">
                        已完成 {item.completedDialogues}/{item.totalDialogues}{' '}
                        个对话
                      </Text>
                    </View>
                  </View>
                  <View className="item-right">
                    <Text className="progress-percent">{item.progress}%</Text>
                    <View className="progress-bar">
                      <View
                        className="progress-fill"
                        style={{
                          width: `${item.progress}%`,
                          backgroundColor: getProgressColor(item.progress),
                        }}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

export default TopicProgress

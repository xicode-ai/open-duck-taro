import { useState, useEffect } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import {
  AtIcon,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
  AtButton,
} from 'taro-ui'
import { useUserStore } from '../../stores/user'
import './index.scss'

interface TranslateHistoryItem {
  id: string
  original: string
  standard: string
  colloquial: string
  sourceLanguage: 'zh' | 'en'
  timestamp: number
  favorite: boolean
  tags: string[]
}

const TranslateHistoryPage = () => {
  // const { } = useUserStore() // 暂时不使用

  // 状态管理
  const [historyList, setHistoryList] = useState<TranslateHistoryItem[]>([])
  const [filteredList, setFilteredList] = useState<TranslateHistoryItem[]>([])
  const [searchText, setSearchText] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'zh' | 'en'>(
    'all'
  )
  const [selectedTime, setSelectedTime] = useState<
    'all' | 'today' | 'week' | 'month'
  >('all')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showBatchActions, setShowBatchActions] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore] = useState(true)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  // 模拟历史数据
  const mockHistory: TranslateHistoryItem[] = [
    {
      id: '1',
      original: '你好，很高兴认识你',
      standard: 'Hello, nice to meet you',
      colloquial: 'Hi there! Great to meet you!',
      sourceLanguage: 'zh',
      timestamp: Date.now() - 1800000,
      favorite: true,
      tags: ['问候', '社交'],
    },
    {
      id: '2',
      original: '今天天气真不错',
      standard: 'The weather is really nice today',
      colloquial: 'What a beautiful day!',
      sourceLanguage: 'zh',
      timestamp: Date.now() - 3600000,
      favorite: false,
      tags: ['天气', '日常'],
    },
    {
      id: '3',
      original: 'How are you doing?',
      standard: '你好吗？',
      colloquial: '你最近怎么样？',
      sourceLanguage: 'en',
      timestamp: Date.now() - 7200000,
      favorite: true,
      tags: ['问候', '关心'],
    },
    {
      id: '4',
      original: '我想点一杯咖啡',
      standard: 'I would like a cup of coffee',
      colloquial: "I'll have a coffee, please",
      sourceLanguage: 'zh',
      timestamp: Date.now() - 86400000,
      favorite: false,
      tags: ['点餐', '咖啡'],
    },
    {
      id: '5',
      original: '请问洗手间在哪里？',
      standard: 'Excuse me, where is the restroom?',
      colloquial: 'Where can I find the bathroom?',
      sourceLanguage: 'zh',
      timestamp: Date.now() - 172800000,
      favorite: false,
      tags: ['问路', '设施'],
    },
  ]

  // 页面初始化
  useEffect(() => {
    loadHistory()
  }, []) // loadHistory 在组件内定义，忽略依赖警告

  // 筛选数据
  useEffect(() => {
    filterHistory()
  }, [searchText, selectedLanguage, selectedTime, historyList]) // filterHistory 在组件内定义，忽略依赖警告

  // 加载历史数据
  const loadHistory = async () => {
    setIsLoading(true)

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    setHistoryList(mockHistory)
    setIsLoading(false)
  }

  // 筛选历史记录
  const filterHistory = () => {
    let filtered = [...historyList]

    // 按语言筛选
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(
        item => item.sourceLanguage === selectedLanguage
      )
    }

    // 按时间筛选
    const now = Date.now()
    switch (selectedTime) {
      case 'today':
        filtered = filtered.filter(
          item => now - item.timestamp < 24 * 60 * 60 * 1000
        )
        break
      case 'week':
        filtered = filtered.filter(
          item => now - item.timestamp < 7 * 24 * 60 * 60 * 1000
        )
        break
      case 'month':
        filtered = filtered.filter(
          item => now - item.timestamp < 30 * 24 * 60 * 60 * 1000
        )
        break
    }

    // 按搜索文本筛选
    if (searchText) {
      filtered = filtered.filter(
        item =>
          item.original.includes(searchText) ||
          item.standard.includes(searchText) ||
          item.colloquial.includes(searchText)
      )
    }

    setFilteredList(filtered)
  }

  // 播放音频
  const playAudio = (itemId: string, type: 'standard' | 'colloquial') => {
    const audioId = `${itemId}-${type}`

    if (playingAudio === audioId) {
      setPlayingAudio(null)
      Taro.stopBackgroundAudio()
    } else {
      setPlayingAudio(audioId)

      // 模拟音频播放
      setTimeout(() => {
        setPlayingAudio(null)
      }, 3000)

      Taro.showToast({
        title: '播放中',
        icon: 'none',
      })
    }
  }

  // 复制文本
  const copyText = (text: string) => {
    Taro.setClipboardData({
      data: text,
      success: () => {
        Taro.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
        })
      },
    })
  }

  // 收藏/取消收藏
  const toggleFavorite = (itemId: string) => {
    setHistoryList(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, favorite: !item.favorite } : item
      )
    )

    const item = historyList.find(item => item.id === itemId)
    Taro.showToast({
      title: item?.favorite ? '已取消收藏' : '已收藏',
      icon: 'success',
    })
  }

  // 删除记录
  const deleteItem = (itemId: string) => {
    setDeleteTarget(itemId)
    setShowDeleteModal(true)
  }

  // 确认删除
  const confirmDelete = () => {
    if (deleteTarget) {
      setHistoryList(prev => prev.filter(item => item.id !== deleteTarget))

      Taro.showToast({
        title: '删除成功',
        icon: 'success',
      })
    }

    setDeleteTarget(null)
    setShowDeleteModal(false)
  }

  // 重新翻译
  const retranslate = (original: string) => {
    Taro.navigateTo({
      url: `/pages/translate/index?text=${encodeURIComponent(original)}`,
    })
  }

  // 批量选择
  const toggleSelect = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      const newSelected = selectedItems.filter(id => id !== itemId)
      setSelectedItems(newSelected)
      setShowBatchActions(newSelected.length > 0)
    } else {
      const newSelected = [...selectedItems, itemId]
      setSelectedItems(newSelected)
      setShowBatchActions(true)
    }
  }

  // 批量导出
  const batchExport = () => {
    const exportData = historyList
      .filter(item => selectedItems.includes(item.id))
      .map(item => ({
        原文: item.original,
        标准翻译: item.standard,
        口语翻译: item.colloquial,
        时间: new Date(item.timestamp).toLocaleString(),
      }))

    console.log('导出数据:', exportData)

    Taro.showToast({
      title: '导出功能开发中',
      icon: 'none',
    })
  }

  // 批量删除
  const batchDelete = () => {
    Taro.showModal({
      title: '批量删除',
      content: `确定要删除选中的${selectedItems.length}条翻译记录吗？`,
      success: res => {
        if (res.confirm) {
          setHistoryList(prev =>
            prev.filter(item => !selectedItems.includes(item.id))
          )
          setSelectedItems([])
          setShowBatchActions(false)

          Taro.showToast({
            title: '删除成功',
            icon: 'success',
          })
        }
      },
    })
  }

  // 清空选择
  const clearSelection = () => {
    setSelectedItems([])
    setShowBatchActions(false)
  }

  // 下拉刷新
  // const onPullDownRefresh = () => {
  //   loadHistory().then(() => {
  //     Taro.stopPullDownRefresh()
  //   })
  // }

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes}分钟前`
    } else if (hours < 24) {
      return `${hours}小时前`
    } else {
      const days = Math.floor(hours / 24)
      return `${days}天前`
    }
  }

  return (
    <View className="translate-history-page">
      {/* 页面头部 */}
      <View className="history-header">
        <View className="header-content">
          <Text className="header-title">翻译历史</Text>
          <Text className="header-subtitle">
            管理你的翻译记录，随时回顾学习
          </Text>

          <View className="header-stats">
            <View className="stat-item">
              <Text className="stat-number">{historyList.length}</Text>
              <Text className="stat-label">总记录</Text>
            </View>
            <View className="stat-item">
              <Text className="stat-number">
                {historyList.filter(item => item.favorite).length}
              </Text>
              <Text className="stat-label">收藏</Text>
            </View>
            <View className="stat-item">
              <Text className="stat-number">
                {
                  historyList.filter(
                    item => Date.now() - item.timestamp < 24 * 60 * 60 * 1000
                  ).length
                }
              </Text>
              <Text className="stat-label">今日</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="history-content">
        {/* 筛选器 */}
        <View className="filter-section">
          <View className="filter-row">
            <Text className="filter-label">语言:</Text>
            <View className="filter-options">
              {[
                { id: 'all', name: '全部' },
                { id: 'zh', name: '中文' },
                { id: 'en', name: 'English' },
              ].map(option => (
                <View
                  key={option.id}
                  className={`filter-option ${selectedLanguage === option.id ? 'active' : ''}`}
                  onClick={() =>
                    setSelectedLanguage(option.id as 'all' | 'zh' | 'en')
                  }
                >
                  {option.name}
                </View>
              ))}
            </View>
          </View>

          <View className="filter-row">
            <Text className="filter-label">时间:</Text>
            <View className="filter-options">
              {[
                { id: 'all', name: '全部' },
                { id: 'today', name: '今天' },
                { id: 'week', name: '本周' },
                { id: 'month', name: '本月' },
              ].map(option => (
                <View
                  key={option.id}
                  className={`filter-option ${selectedTime === option.id ? 'active' : ''}`}
                  onClick={() =>
                    setSelectedTime(
                      option.id as 'all' | 'today' | 'week' | 'month'
                    )
                  }
                >
                  {option.name}
                </View>
              ))}
            </View>
          </View>

          <View className="filter-row search-row">
            <Text className="filter-label">搜索:</Text>
            <Input
              className="search-input"
              value={searchText}
              onInput={e => setSearchText(e.detail.value)}
              placeholder="搜索翻译内容..."
            />
            {searchText && (
              <View className="search-btn" onClick={() => setSearchText('')}>
                清空
              </View>
            )}
          </View>
        </View>

        {/* 历史记录列表 */}
        {isLoading ? (
          <View className="loading-more">
            <AtIcon value="loading-3" className="loading-icon" />
            <Text className="loading-text">加载中...</Text>
          </View>
        ) : filteredList.length === 0 ? (
          <View className="empty-state">
            <Text className="empty-icon">📝</Text>
            <Text className="empty-title">暂无翻译记录</Text>
            <Text className="empty-desc">
              开始使用翻译功能
              {'\n'}
              积累你的学习历程
            </Text>
            <View
              className="empty-action"
              onClick={() => Taro.navigateTo({ url: '/pages/translate/index' })}
            >
              <AtIcon value="add" />
              <Text>开始翻译</Text>
            </View>
          </View>
        ) : (
          <View className="history-list">
            {filteredList.map(item => (
              <View
                key={item.id}
                className={`history-item swipe-action ${item.favorite ? 'favorite' : ''} ${
                  Date.now() - item.timestamp < 60 * 60 * 1000 ? 'recent' : ''
                } ${selectedItems.includes(item.id) ? 'selected' : ''}`}
                onLongPress={() => toggleSelect(item.id)}
              >
                <View className="swipe-content">
                  <View className="item-header">
                    <View className="language-indicator">
                      <Text className="language-flag">
                        {item.sourceLanguage === 'zh' ? '🇨🇳' : '🇺🇸'}
                      </Text>
                      <AtIcon value="arrow-right" className="language-arrow" />
                      <Text className="language-flag">
                        {item.sourceLanguage === 'zh' ? '🇺🇸' : '🇨🇳'}
                      </Text>
                    </View>

                    <View className="item-actions">
                      <View
                        className={`action-btn play-btn ${playingAudio?.startsWith(item.id) ? 'playing' : ''}`}
                        onClick={() => playAudio(item.id, 'standard')}
                      >
                        <AtIcon
                          value={
                            playingAudio?.startsWith(item.id)
                              ? 'pause'
                              : 'sound'
                          }
                        />
                      </View>

                      <View
                        className="action-btn copy-btn"
                        onClick={() => copyText(item.standard)}
                      >
                        <AtIcon value="copy" />
                      </View>

                      <View
                        className={`action-btn favorite-btn ${item.favorite ? 'active' : ''}`}
                        onClick={() => toggleFavorite(item.id)}
                      >
                        <AtIcon value="heart" />
                      </View>

                      <View
                        className="action-btn delete-btn"
                        onClick={() => deleteItem(item.id)}
                      >
                        <AtIcon value="trash" />
                      </View>
                    </View>

                    <Text className="item-time">
                      {formatTime(item.timestamp)}
                    </Text>
                  </View>

                  <View className="item-content">
                    <Text className="original-text">{item.original}</Text>

                    <View className="translation-results">
                      <View className="translation-item">
                        <Text className="translation-label">
                          <Text className="label-icon standard">📖</Text>
                          标准翻译
                        </Text>
                        <Text className="translation-text standard">
                          {item.standard}
                        </Text>
                      </View>

                      <View className="translation-item">
                        <Text className="translation-label">
                          <Text className="label-icon colloquial">💬</Text>
                          口语表达
                        </Text>
                        <Text className="translation-text colloquial">
                          {item.colloquial}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="item-footer">
                    <View className="footer-info">
                      <View className="info-item">
                        <AtIcon value="tag" className="info-icon" />
                        <Text>{item.tags.join(', ')}</Text>
                      </View>
                    </View>

                    <View className="footer-actions">
                      <View
                        className="footer-btn reuse-btn"
                        onClick={() => retranslate(item.original)}
                      >
                        <AtIcon value="reload" />
                        <Text>重新翻译</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* 滑动删除 */}
                <View className="swipe-actions">
                  <View
                    className="swipe-btn"
                    onClick={() => deleteItem(item.id)}
                  >
                    <AtIcon value="trash" />
                    <Text>删除</Text>
                  </View>
                </View>
              </View>
            ))}

            {/* 加载更多 */}
            {hasMore && (
              <View className="loading-more">
                <AtIcon value="loading-3" className="loading-icon" />
                <Text className="loading-text">加载更多...</Text>
              </View>
            )}
          </View>
        )}

        {/* 批量操作栏 */}
        <View className={`batch-actions ${showBatchActions ? 'show' : ''}`}>
          <Text className="selected-count">
            已选择 {selectedItems.length} 项
          </Text>

          <View className="batch-btn export-btn" onClick={batchExport}>
            <AtIcon value="download" />
            <Text>导出</Text>
          </View>

          <View className="batch-btn delete-btn" onClick={batchDelete}>
            <AtIcon value="trash" />
            <Text>删除</Text>
          </View>

          <View className="batch-btn" onClick={clearSelection}>
            <AtIcon value="close" />
          </View>
        </View>
      </View>

      {/* 删除确认弹窗 */}
      <AtModal isOpened={showDeleteModal}>
        <AtModalHeader>确认删除</AtModalHeader>
        <AtModalContent>
          确定要删除这条翻译记录吗？删除后无法恢复。
        </AtModalContent>
        <AtModalAction>
          <AtButton onClick={() => setShowDeleteModal(false)}>取消</AtButton>
          <AtButton type="primary" onClick={confirmDelete}>
            确认删除
          </AtButton>
        </AtModalAction>
      </AtModal>
    </View>
  )
}

export default TranslateHistoryPage

import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import SvgIcon from './SvgIcon'
import './IconPreview.scss'

const IconPreview: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStyle, setSelectedStyle] = useState<
    'solid' | 'outline' | 'duotone'
  >('solid')

  const iconCategories = {
    基础功能: [
      { name: 'help', label: '帮助', category: '基础功能' },
      { name: 'message', label: '消息', category: '基础功能' },
      { name: 'chat', label: '聊天', category: '基础功能' },
      { name: 'translate', label: '翻译', category: '基础功能' },
      { name: 'camera', label: '相机', category: '基础功能' },
      { name: 'book', label: '书籍', category: '基础功能' },
      { name: 'list', label: '列表', category: '基础功能' },
      { name: 'analytics', label: '分析', category: '基础功能' },
      { name: 'bookmark', label: '书签', category: '基础功能' },
      { name: 'star', label: '星星', category: '基础功能' },
      { name: 'crown', label: '皇冠', category: '基础功能' },
      { name: 'home', label: '首页', category: '基础功能' },
      { name: 'user', label: '用户', category: '基础功能' },
      { name: 'progress', label: '进度', category: '基础功能' },
      { name: 'vocabulary', label: '词汇', category: '基础功能' },
      { name: 'settings', label: '设置', category: '基础功能' },
    ],
    导航操作: [
      { name: 'arrow-right', label: '右箭头', category: '导航操作' },
      { name: 'arrow-left', label: '左箭头', category: '导航操作' },
      { name: 'arrow-up', label: '上箭头', category: '导航操作' },
      { name: 'arrow-down', label: '下箭头', category: '导航操作' },
      { name: 'check', label: '勾选', category: '导航操作' },
      { name: 'close', label: '关闭', category: '导航操作' },
      { name: 'plus', label: '加号', category: '导航操作' },
      { name: 'minus', label: '减号', category: '导航操作' },
      { name: 'search', label: '搜索', category: '导航操作' },
      { name: 'mic', label: '麦克风', category: '导航操作' },
    ],
    新增图标: [
      { name: 'photo-story', label: '照片故事', category: '新增图标' },
      { name: 'topic-chat', label: '话题聊天', category: '新增图标' },
      { name: 'translate-history', label: '翻译历史', category: '新增图标' },
      { name: 'vocabulary-study', label: '词汇学习', category: '新增图标' },
      { name: 'membership', label: '会员', category: '新增图标' },
      { name: 'profile', label: '个人资料', category: '新增图标' },
    ],
    状态反馈: [
      { name: 'check-circle', label: '成功圆圈', category: '状态反馈' },
      { name: 'error-circle', label: '错误圆圈', category: '状态反馈' },
      { name: 'warning-circle', label: '警告圆圈', category: '状态反馈' },
      { name: 'info-circle', label: '信息圆圈', category: '状态反馈' },
    ],
    媒体内容: [
      { name: 'play-circle', label: '播放圆圈', category: '媒体内容' },
      { name: 'pause-circle', label: '暂停圆圈', category: '媒体内容' },
      { name: 'volume-up', label: '音量增大', category: '媒体内容' },
      { name: 'volume-off', label: '音量关闭', category: '媒体内容' },
    ],
    编辑工具: [
      { name: 'edit', label: '编辑', category: '编辑工具' },
      { name: 'delete', label: '删除', category: '编辑工具' },
      { name: 'share', label: '分享', category: '编辑工具' },
      { name: 'download', label: '下载', category: '编辑工具' },
      { name: 'upload', label: '上传', category: '编辑工具' },
    ],
    社交通信: [
      { name: 'phone-call', label: '电话', category: '社交通信' },
      { name: 'video-call', label: '视频通话', category: '社交通信' },
      { name: 'mail', label: '邮件', category: '社交通信' },
      { name: 'notification', label: '通知', category: '社交通信' },
    ],
    学习教育: [
      { name: 'graduation-cap', label: '毕业帽', category: '学习教育' },
      { name: 'lightbulb', label: '灯泡', category: '学习教育' },
      { name: 'brain', label: '大脑', category: '学习教育' },
      { name: 'target', label: '目标', category: '学习教育' },
    ],
  }

  const allIcons = Object.values(iconCategories).flat()
  const filteredIcons =
    selectedCategory === 'all'
      ? allIcons
      : allIcons.filter(icon => icon.category === selectedCategory)

  const categories = ['all', ...Object.keys(iconCategories)]
  const styles: Array<'solid' | 'outline' | 'duotone'> = [
    'solid',
    'outline',
    'duotone',
  ]

  return (
    <View className="icon-preview">
      <View className="preview-header">
        <Text className="preview-title">SVG 图标预览</Text>
        <Text className="preview-subtitle">
          基于 taro-iconfont-cli 优化的图标组件
        </Text>
      </View>

      {/* 筛选器 */}
      <View className="preview-filters">
        <View className="filter-section">
          <Text className="filter-label">分类筛选：</Text>
          <View className="filter-buttons">
            {categories.map(category => (
              <View
                key={category}
                className={`filter-button ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                <Text className="filter-text">
                  {category === 'all' ? '全部' : category}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="filter-section">
          <Text className="filter-label">样式选择：</Text>
          <View className="filter-buttons">
            {styles.map(style => (
              <View
                key={style}
                className={`filter-button ${selectedStyle === style ? 'active' : ''}`}
                onClick={() => setSelectedStyle(style)}
              >
                <Text className="filter-text">
                  {style === 'solid'
                    ? '实心'
                    : style === 'outline'
                      ? '描边'
                      : '双色'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 图标网格 */}
      <View className="icon-grid">
        {filteredIcons.map(icon => (
          <View key={icon.name} className="icon-item">
            <View className="icon-display">
              <SvgIcon
                name={icon.name}
                size={32}
                color="#007AFF"
                fill={selectedStyle}
              />
            </View>
            <Text className="icon-name">{icon.name}</Text>
            <Text className="icon-label">{icon.label}</Text>
          </View>
        ))}
      </View>

      {/* 统计信息 */}
      <View className="preview-stats">
        <Text className="stats-text">
          共 {filteredIcons.length} 个图标，当前显示 {selectedStyle} 样式
        </Text>
      </View>
    </View>
  )
}

export default IconPreview

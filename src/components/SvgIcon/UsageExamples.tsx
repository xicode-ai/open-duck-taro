import React from 'react'
import { View, Text } from '@tarojs/components'
import SvgIcon from './SvgIcon'
import './UsageExamples.scss'

const UsageExamples: React.FC = () => {
  return (
    <View className="usage-examples">
      <View className="examples-header">
        <Text className="examples-title">SVG 图标使用示例</Text>
        <Text className="examples-subtitle">展示不同场景下的图标使用方法</Text>
      </View>

      {/* 基础用法示例 */}
      <View className="example-section">
        <Text className="section-title">基础用法</Text>
        <View className="example-grid">
          <View className="example-item">
            <SvgIcon name="home" size={24} color="#007AFF" />
            <Text className="example-label">默认图标</Text>
          </View>
          <View className="example-item">
            <SvgIcon name="user" size={32} color="#34C759" />
            <Text className="example-label">大尺寸图标</Text>
          </View>
          <View className="example-item">
            <SvgIcon name="star" size={20} color="#FF9500" />
            <Text className="example-label">小尺寸图标</Text>
          </View>
          <View className="example-item">
            <SvgIcon name="settings" size={28} color="#8E8E93" />
            <Text className="example-label">自定义颜色</Text>
          </View>
        </View>
      </View>

      {/* 样式变体示例 */}
      <View className="example-section">
        <Text className="section-title">样式变体</Text>
        <View className="example-grid">
          <View className="example-item">
            <SvgIcon name="heart" size={24} color="#FF3B30" fill="solid" />
            <Text className="example-label">实心样式</Text>
          </View>
          <View className="example-item">
            <SvgIcon name="heart" size={24} color="#FF3B30" fill="outline" />
            <Text className="example-label">描边样式</Text>
          </View>
          <View className="example-item">
            <SvgIcon name="star" size={24} color="#FF9500" fill="duotone" />
            <Text className="example-label">双色样式</Text>
          </View>
        </View>
      </View>

      {/* 描边宽度示例 */}
      <View className="example-section">
        <Text className="section-title">描边宽度控制</Text>
        <View className="example-grid">
          <View className="example-item">
            <SvgIcon
              name="settings"
              size={24}
              color="#8E8E93"
              fill="outline"
              strokeWidth={1}
            />
            <Text className="example-label">细描边</Text>
          </View>
          <View className="example-item">
            <SvgIcon
              name="settings"
              size={24}
              color="#8E8E93"
              fill="outline"
              strokeWidth={2}
            />
            <Text className="example-label">标准描边</Text>
          </View>
          <View className="example-item">
            <SvgIcon
              name="settings"
              size={24}
              color="#8E8E93"
              fill="outline"
              strokeWidth={3}
            />
            <Text className="example-label">粗描边</Text>
          </View>
        </View>
      </View>

      {/* 状态示例 */}
      <View className="example-section">
        <Text className="section-title">状态和交互</Text>
        <View className="example-grid">
          <View className="example-item">
            <SvgIcon
              name="check-circle"
              size={24}
              color="#34C759"
              className="success-icon"
            />
            <Text className="example-label">成功状态</Text>
          </View>
          <View className="example-item">
            <SvgIcon
              name="error-circle"
              size={24}
              color="#FF3B30"
              className="error-icon"
            />
            <Text className="example-label">错误状态</Text>
          </View>
          <View className="example-item">
            <SvgIcon
              name="warning-circle"
              size={24}
              color="#FF9500"
              className="warning-icon"
            />
            <Text className="example-label">警告状态</Text>
          </View>
          <View className="example-item">
            <SvgIcon
              name="info-circle"
              size={24}
              color="#007AFF"
              className="info-icon"
            />
            <Text className="example-label">信息状态</Text>
          </View>
        </View>
      </View>

      {/* 功能图标示例 */}
      <View className="example-section">
        <Text className="section-title">功能图标</Text>
        <View className="example-grid">
          <View className="example-item">
            <SvgIcon name="translate" size={24} color="#AF52DE" />
            <Text className="example-label">翻译功能</Text>
          </View>
          <View className="example-item">
            <SvgIcon name="camera" size={24} color="#007AFF" />
            <Text className="example-label">拍照功能</Text>
          </View>
          <View className="example-item">
            <SvgIcon name="book" size={24} color="#FF3B30" />
            <Text className="example-label">学习功能</Text>
          </View>
          <View className="example-item">
            <SvgIcon name="chat" size={24} color="#34C759" />
            <Text className="example-label">对话功能</Text>
          </View>
        </View>
      </View>

      {/* 导航图标示例 */}
      <View className="example-section">
        <Text className="section-title">导航图标</Text>
        <View className="example-grid">
          <View className="example-item">
            <SvgIcon name="arrow-left" size={24} color="#8E8E93" />
            <Text className="example-label">返回</Text>
          </View>
          <View className="example-item">
            <SvgIcon name="arrow-right" size={24} color="#8E8E93" />
            <Text className="example-label">前进</Text>
          </View>
          <View className="example-item">
            <SvgIcon name="close" size={24} color="#8E8E93" />
            <Text className="example-label">关闭</Text>
          </View>
          <View className="example-item">
            <SvgIcon name="search" size={24} color="#8E8E93" />
            <Text className="example-label">搜索</Text>
          </View>
        </View>
      </View>

      {/* 尺寸对比示例 */}
      <View className="example-section">
        <Text className="section-title">尺寸对比</Text>
        <View className="size-comparison">
          <View className="size-item">
            <SvgIcon name="home" size={16} color="#007AFF" />
            <Text className="size-label">16px</Text>
          </View>
          <View className="size-item">
            <SvgIcon name="home" size={20} color="#007AFF" />
            <Text className="size-label">20px</Text>
          </View>
          <View className="size-item">
            <SvgIcon name="home" size={24} color="#007AFF" />
            <Text className="size-label">24px</Text>
          </View>
          <View className="size-item">
            <SvgIcon name="home" size={32} color="#007AFF" />
            <Text className="size-label">32px</Text>
          </View>
          <View className="size-item">
            <SvgIcon name="home" size={48} color="#007AFF" />
            <Text className="size-label">48px</Text>
          </View>
        </View>
      </View>

      {/* 颜色主题示例 */}
      <View className="example-section">
        <Text className="section-title">颜色主题</Text>
        <View className="color-themes">
          <View className="theme-item">
            <SvgIcon name="star" size={24} color="#FF9500" />
            <Text className="theme-label">橙色主题</Text>
          </View>
          <View className="theme-item">
            <SvgIcon name="star" size={24} color="#34C759" />
            <Text className="theme-label">绿色主题</Text>
          </View>
          <View className="theme-item">
            <SvgIcon name="star" size={24} color="#007AFF" />
            <Text className="theme-label">蓝色主题</Text>
          </View>
          <View className="theme-item">
            <SvgIcon name="star" size={24} color="#AF52DE" />
            <Text className="theme-label">紫色主题</Text>
          </View>
          <View className="theme-item">
            <SvgIcon name="star" size={24} color="#FF3B30" />
            <Text className="theme-label">红色主题</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default UsageExamples

import React from 'react'
import { View, Text } from '@tarojs/components'
import SvgIcon from './SvgIcon'
import './demo.scss'

const SvgIconDemo: React.FC = () => {
  return (
    <View className="svg-icon-demo">
      <View className="demo-header">
        <Text className="demo-title">SVG 图标组件演示</Text>
        <Text className="demo-subtitle">
          基于 taro-iconfont-cli 优化的图标系统
        </Text>
      </View>

      {/* 基础图标展示 */}
      <View className="demo-section">
        <Text className="section-title">基础图标</Text>
        <View className="icon-showcase">
          <View className="icon-item">
            <SvgIcon name="home" size={32} color="#007AFF" />
            <Text className="icon-name">home</Text>
          </View>
          <View className="icon-item">
            <SvgIcon name="user" size={32} color="#34C759" />
            <Text className="icon-name">user</Text>
          </View>
          <View className="icon-item">
            <SvgIcon name="settings" size={32} color="#8E8E93" />
            <Text className="icon-name">settings</Text>
          </View>
          <View className="icon-item">
            <SvgIcon name="star" size={32} color="#FF9500" />
            <Text className="icon-name">star</Text>
          </View>
        </View>
      </View>

      {/* 样式变体展示 */}
      <View className="demo-section">
        <Text className="section-title">样式变体</Text>
        <View className="icon-showcase">
          <View className="icon-item">
            <SvgIcon name="heart" size={32} color="#FF3B30" fill="solid" />
            <Text className="icon-name">实心</Text>
          </View>
          <View className="icon-item">
            <SvgIcon name="heart" size={32} color="#FF3B30" fill="outline" />
            <Text className="icon-name">描边</Text>
          </View>
          <View className="icon-item">
            <SvgIcon name="star" size={32} color="#FF9500" fill="duotone" />
            <Text className="icon-name">双色</Text>
          </View>
        </View>
      </View>

      {/* 尺寸展示 */}
      <View className="demo-section">
        <Text className="section-title">不同尺寸</Text>
        <View className="icon-showcase">
          <View className="icon-item">
            <SvgIcon name="home" size={16} color="#007AFF" />
            <Text className="icon-name">16px</Text>
          </View>
          <View className="icon-item">
            <SvgIcon name="home" size={24} color="#007AFF" />
            <Text className="icon-name">24px</Text>
          </View>
          <View className="icon-item">
            <SvgIcon name="home" size={32} color="#007AFF" />
            <Text className="icon-name">32px</Text>
          </View>
          <View className="icon-item">
            <SvgIcon name="home" size={48} color="#007AFF" />
            <Text className="icon-name">48px</Text>
          </View>
        </View>
      </View>

      {/* 功能图标展示 */}
      <View className="demo-section">
        <Text className="section-title">功能图标</Text>
        <View className="icon-showcase">
          <View className="icon-item">
            <SvgIcon name="translate" size={32} color="#AF52DE" />
            <Text className="icon-name">翻译</Text>
          </View>
          <View className="icon-item">
            <SvgIcon name="camera" size={32} color="#007AFF" />
            <Text className="icon-name">相机</Text>
          </View>
          <View className="icon-item">
            <SvgIcon name="book" size={32} color="#FF3B30" />
            <Text className="icon-name">学习</Text>
          </View>
          <View className="icon-item">
            <SvgIcon name="chat" size={32} color="#34C759" />
            <Text className="icon-name">对话</Text>
          </View>
        </View>
      </View>

      {/* 状态图标展示 */}
      <View className="demo-section">
        <Text className="section-title">状态图标</Text>
        <View className="icon-showcase">
          <View className="icon-item">
            <SvgIcon name="check-circle" size={32} color="#34C759" />
            <Text className="icon-name">成功</Text>
          </View>
          <View className="icon-item">
            <SvgIcon name="error-circle" size={32} color="#FF3B30" />
            <Text className="icon-name">错误</Text>
          </View>
          <View className="icon-item">
            <SvgIcon name="warning-circle" size={32} color="#FF9500" />
            <Text className="icon-name">警告</Text>
          </View>
          <View className="icon-item">
            <SvgIcon name="info-circle" size={32} color="#007AFF" />
            <Text className="icon-name">信息</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default SvgIconDemo

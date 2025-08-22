# SvgIcon 组件

基于 taro-iconfont-cli 优化的 SVG 图标组件，支持多种样式和尺寸。

## 特性

- 🎨 支持实心、描边、双色三种样式
- 📏 自适应不同尺寸的描边宽度
- 🎯 优化的 SVG 路径数据
- 🚀 高性能渲染
- 📱 响应式设计
- 🎭 丰富的动画效果

## 使用方法

### 基础用法

```tsx
import SvgIcon from '@/components/SvgIcon'

// 基础图标
<SvgIcon name="home" size={24} color="#007AFF" />

// 不同尺寸
<SvgIcon name="user" size={32} color="#34C759" />

// 自定义颜色
<SvgIcon name="star" size={20} color="#FF9500" />
```

### 样式变体

```tsx
// 实心图标（默认）
<SvgIcon name="check" size={24} color="#34C759" fill="solid" />

// 描边图标
<SvgIcon name="heart" size={24} color="#FF3B30" fill="outline" />

// 双色图标
<SvgIcon name="star" size={24} color="#FF9500" fill="duotone" />
```

### 描边宽度控制

```tsx
// 自定义描边宽度
<SvgIcon
  name="settings"
  size={24}
  color="#8E8E93"
  fill="outline"
  strokeWidth={1.5}
/>
```

### 状态和交互

```tsx
// 禁用状态
<SvgIcon
  name="download"
  size={24}
  color="#8E8E93"
  className="disabled"
/>

// 加载状态
<SvgIcon
  name="refresh"
  size={24}
  color="#007AFF"
  className="loading"
/>

// 点击事件
<SvgIcon
  name="close"
  size={24}
  color="#FF3B30"
  onClick={() => console.log('关闭')}
/>
```

## 可用图标

### 基础功能图标
- `help` - 帮助
- `message` - 消息
- `chat` - 聊天
- `translate` - 翻译
- `camera` - 相机
- `book` - 书籍
- `list` - 列表
- `analytics` - 分析
- `bookmark` - 书签
- `star` - 星星
- `crown` - 皇冠
- `home` - 首页
- `user` - 用户
- `progress` - 进度
- `vocabulary` - 词汇
- `settings` - 设置

### 导航和操作图标
- `arrow-right` - 右箭头
- `arrow-left` - 左箭头
- `arrow-up` - 上箭头
- `arrow-down` - 下箭头
- `check` - 勾选
- `close` - 关闭
- `plus` - 加号
- `minus` - 减号
- `search` - 搜索
- `mic` - 麦克风

### 新增图标
- `photo-story` - 照片故事
- `topic-chat` - 话题聊天
- `translate-history` - 翻译历史
- `vocabulary-study` - 词汇学习
- `membership` - 会员
- `profile` - 个人资料

### 状态和反馈图标
- `check-circle` - 成功圆圈
- `error-circle` - 错误圆圈
- `warning-circle` - 警告圆圈
- `info-circle` - 信息圆圈

### 媒体和内容图标
- `play-circle` - 播放圆圈
- `pause-circle` - 暂停圆圈
- `volume-up` - 音量增大
- `volume-off` - 音量关闭

### 编辑和工具图标
- `edit` - 编辑
- `delete` - 删除
- `share` - 分享
- `download` - 下载
- `upload` - 上传

### 社交和通信图标
- `phone-call` - 电话
- `video-call` - 视频通话
- `mail` - 邮件
- `notification` - 通知

### 学习和教育图标
- `graduation-cap` - 毕业帽
- `lightbulb` - 灯泡
- `brain` - 大脑
- `target` - 目标

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| name | string | - | 图标名称（必需） |
| size | number | 24 | 图标尺寸（px） |
| color | string | 'currentColor' | 图标颜色 |
| style | React.CSSProperties | {} | 自定义样式 |
| className | string | '' | 自定义类名 |
| onClick | () => void | - | 点击事件 |
| strokeWidth | number | 2 | 描边宽度 |
| fill | 'solid' \| 'outline' \| 'duotone' | 'solid' | 图标样式 |

## 样式类名

- `.svg-icon` - 基础图标样式
- `.svg-icon--solid` - 实心图标
- `.svg-icon--outline` - 描边图标
- `.svg-icon--duotone` - 双色图标
- `.svg-icon.disabled` - 禁用状态
- `.svg-icon.loading` - 加载状态

## 最佳实践

1. **选择合适的样式**：根据设计需求选择实心、描边或双色样式
2. **尺寸一致性**：在同一个界面中保持图标尺寸的一致性
3. **颜色搭配**：使用语义化的颜色，如成功用绿色、警告用橙色等
4. **性能优化**：避免频繁改变图标尺寸和颜色
5. **无障碍性**：为图标添加适当的 aria-label 或 title 属性

## 注意事项

- 图标名称必须与预定义的 `svgPaths` 中的键名完全匹配
- 描边样式仅在 `fill="outline"` 时生效
- 组件会自动根据尺寸调整描边宽度
- 支持响应式设计，在小屏幕上会自动调整描边宽度

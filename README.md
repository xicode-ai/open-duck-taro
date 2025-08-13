# 开口鸭 (OpenDuck)

一款基于 AI 技术的智能英语口语学习应用，支持小程序、H5、iOS 和 Android 多端。

## 功能特色

- 🎯 **AI 对话模式** - 与 AI 进行真实的英语对话练习
- 📚 **话题学习** - 多种生活场景话题，情境化学习
- 🔄 **智能翻译** - 提供标准翻译和口语化表达
- 📸 **拍照短文** - AI 分析图片生成英文短文
- 📖 **背单词** - 语境学习法，分阶段词汇学习
- 🎤 **发音评分** - 专业的语音评分系统
- 📊 **学习进度** - 详细的学习统计和成就系统

## 技术栈

- **框架**: Taro 3.6.23 + React 18 + TypeScript
- **样式**: Sass + TaroUI
- **状态管理**: Zustand
- **数据请求**: React Query
- **包管理**: pnpm
- **代码规范**: ESLint + Prettier
- **测试**: Jest
- **Mock**: MSW

## 项目结构

```
src/
├── app.config.ts          # 应用配置
├── app.scss              # 全局样式
├── app.ts                # 应用入口
├── components/           # 公共组件
├── pages/               # 页面
│   ├── index/           # 首页
│   ├── chat/            # 对话模式
│   ├── topics/          # 话题列表
│   ├── topic-chat/      # 话题对话
│   ├── translate/       # 翻译功能
│   ├── photo-story/     # 拍照短文
│   ├── vocabulary/      # 单词列表
│   ├── vocabulary-study/ # 单词学习
│   ├── profile/         # 个人中心
│   ├── progress/        # 学习进度
│   └── membership/      # 会员中心
├── services/            # API 服务
├── stores/              # 状态管理
├── types/               # 类型定义
└── utils/               # 工具函数
```

## 快速开始

### 环境要求

- Node.js >= 16
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 开发调试

```bash
# H5 开发
pnpm dev:h5

# 微信小程序开发
pnpm dev:weapp

# 支付宝小程序开发
pnpm dev:alipay
```

### 生产构建

```bash
# H5 生产构建
pnpm build:h5

# 微信小程序生产构建
pnpm build:weapp

# 支付宝小程序生产构建
pnpm build:alipay
```

### 代码检查

```bash
# 运行所有检查
pnpm check

# 运行并修复代码格式
pnpm check:fix

# 单独运行 ESLint
pnpm lint

# 单独运行 Prettier
pnpm format

# 运行测试
pnpm test
```

## 开发规范

### 代码风格

- 使用 TypeScript 进行类型约束
- 遵循 ESLint 和 Prettier 配置
- 组件和页面使用函数式组件
- 样式使用 CSS 变量和 BEM 命名规范

### 目录命名

- 页面目录使用 kebab-case (如：`topic-chat`)
- 组件文件使用 PascalCase (如：`ChatMessage.tsx`)
- 工具函数使用 camelCase (如：`formatTime.ts`)

### Git 提交

使用语义化提交信息：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 样式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建或工具相关

## 部署说明

### 微信小程序

1. 使用微信开发者工具打开 `dist` 目录
2. 配置 `project.config.json` 中的 `appid`
3. 上传代码到微信公众平台

### H5 部署

1. 构建生产版本：`pnpm build:h5`
2. 将 `dist` 目录部署到静态服务器
3. 配置 nginx 支持 SPA 路由

## 环境变量

```bash
# 开发环境
NODE_ENV=development
TARO_ENV=h5

# 生产环境
NODE_ENV=production
TARO_ENV=weapp
```

## API 接口

项目中的 API 接口目前使用 Mock 数据，实际开发时需要：

1. 配置后端 API 地址
2. 实现用户认证逻辑
3. 集成真实的 AI 服务
4. 配置语音识别和合成服务

## 贡献指南

1. Fork 项目
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -m 'feat: add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

- 邮箱：support@openduck.com
- 官网：https://openduck.com

---

**开口鸭** - 让英语学习更简单，让口语交流更自然！ 🦆

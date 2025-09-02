# 项目结构详解

## 根目录结构
```
open-duck-taro/
├── config/                 # Taro 配置文件
│   ├── index.ts           # 主配置（Webpack 5）
│   ├── dev.ts             # 开发环境配置
│   ├── prod.ts            # 生产环境配置
│   └── h5.ts              # H5 特定配置
├── src/                   # 源代码目录
├── dist/                  # 构建输出目录
├── public/                # 静态资源
├── docs/                  # 项目文档
├── __tests__/             # 测试文件
└── types/                 # 全局类型定义
```

## src 目录结构
```
src/
├── app.ts                 # 应用入口文件
├── app.config.ts          # 应用配置
├── app.scss               # 全局样式
├── components/            # 公共组件
│   ├── common/           # 通用组件
│   ├── ErrorBoundary/    # 错误边界
│   ├── SvgIcon/          # SVG 图标
│   └── VoiceWaveform/    # 语音波形
├── pages/                 # 页面组件
│   ├── index/            # 首页
│   ├── translate/        # 翻译页面
│   ├── vocabulary/       # 单词学习
│   ├── chat/             # AI 对话
│   ├── topics/           # 话题练习
│   ├── profile/          # 个人中心
│   └── ...               # 其他页面
├── stores/                # 状态管理
│   ├── user.ts           # 用户状态
│   ├── chat.ts           # 聊天状态
│   ├── vocabulary.ts     # 词汇状态
│   └── settings.ts       # 设置状态
├── services/              # API 服务
│   ├── api.ts            # API 接口定义
│   ├── http.ts           # HTTP 客户端
│   ├── mock.ts           # Mock 数据
│   └── mockAudio.ts      # 音频 Mock
├── utils/                 # 工具函数
│   ├── date.ts           # 日期工具
│   ├── format.ts         # 格式化工具
│   ├── storage.ts        # 存储工具
│   ├── validation.ts     # 验证工具
│   └── errorHandler.ts   # 错误处理
├── types/                 # 类型定义
│   └── index.ts          # 主要类型
├── assets/                # 静态资源
│   └── icons/            # 图标文件
├── mocks/                 # MSW Mock 配置
│   ├── browser.ts        # 浏览器 Mock
│   ├── handlers/         # Mock 处理器
│   └── types.ts          # Mock 类型
└── config/                # 应用配置
    └── index.ts          # 配置文件
```

## 关键文件说明

### 配置文件
- `config/index.ts`: Taro 主配置，包含路径别名、插件配置
- `app.config.ts`: 应用页面配置、tabBar 配置
- `tsconfig.json`: TypeScript 配置
- `eslint.config.js`: ESLint 配置
- `postcss.config.js`: PostCSS 配置

### 核心文件
- `src/app.ts`: 应用入口，MSW 初始化
- `src/stores/index.ts`: 状态管理入口
- `src/services/api.ts`: API 接口统一管理
- `src/types/index.ts`: 全局类型定义

## 页面组织规范
每个页面目录包含：
- `index.tsx`: 页面组件
- `index.scss`: 页面样式
- `index.config.ts`: 页面配置

## 组件组织规范
每个组件目录包含：
- `index.tsx`: 组件实现
- `index.scss`: 组件样式
- 可选的子组件文件
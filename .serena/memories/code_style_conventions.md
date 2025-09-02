# 代码风格和规范

## TypeScript 规范
- **严格模式**: 启用 strict 模式
- **目标版本**: ES2020
- **JSX**: 使用 react-jsx 转换
- **路径别名**: 配置 @ 别名指向 src 目录
- **类型定义**: 统一放在 src/types 目录

## 代码风格
- **组件定义**: 使用函数式组件 + React.FC
- **接口命名**: 使用 PascalCase，如 `ButtonProps`
- **类型导出**: 使用 `export type` 和 `export interface`
- **状态管理**: 使用 Zustand 的 create 模式
- **文件命名**: 
  - 组件文件使用 PascalCase
  - 工具文件使用 camelCase
  - 页面文件使用 kebab-case

## ESLint 配置
- **基础配置**: @eslint/js 推荐配置
- **TypeScript**: @typescript-eslint 插件
- **React**: eslint-plugin-react + react-hooks
- **导入检查**: eslint-plugin-import
- **未使用变量**: 警告级别，支持 _ 前缀忽略

## 样式规范
- **预处理器**: SCSS
- **命名规范**: BEM 方法论
- **单位使用**: px（Taro 自动转换）
- **响应式**: 基于 375px 设计稿
- **组件样式**: 每个组件独立 .scss 文件

## 目录结构规范
```
src/
├── components/     # 公共组件
├── pages/         # 页面组件
├── stores/        # 状态管理
├── services/      # API 服务
├── utils/         # 工具函数
├── types/         # 类型定义
├── assets/        # 静态资源
└── mocks/         # Mock 数据
```

## 注释规范
- **组件注释**: 使用 JSDoc 格式
- **复杂逻辑**: 添加行内注释说明
- **接口定义**: 必须添加注释说明
- **TODO**: 使用 TODO: 标记待办事项
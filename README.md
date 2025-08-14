# 开口鸭 - Open Duck

基于 **Taro 4 + React 18 + TypeScript + Webpack 5** 的跨平台应用

## 🚀 技术栈

- **跨平台框架**: Taro 4.1.5
- **UI 框架**: React 18
- **开发语言**: TypeScript 5.1.6
- **构建工具**: Webpack 5
- **样式处理**: SCSS/Sass
- **状态管理**: Zustand
- **HTTP 客户端**: Axios
- **国际化**: i18next
- **代码质量**: ESLint + Stylelint + Prettier

## 📱 支持平台

- H5 (Web)
- 微信小程序
- 支付宝小程序
- 百度小程序
- 字节跳动小程序
- QQ 小程序
- 京东小程序
- 快应用
- React Native

## 🛠️ 开发命令

### 构建命令
```bash
# H5 构建
pnpm build:h5

# 微信小程序构建
pnpm build:weapp

# 其他平台构建
pnpm build:swan      # 百度小程序
pnpm build:alipay    # 支付宝小程序
pnpm build:tt        # 字节跳动小程序
pnpm build:rn        # React Native
pnpm build:qq        # QQ 小程序
pnpm build:jd        # 京东小程序
pnpm build:quickapp  # 快应用
```

### 开发命令
```bash
# H5 开发（热重载）
pnpm dev:h5

# 微信小程序开发
pnpm dev:weapp

# 其他平台开发
pnpm dev:swan      # 百度小程序
pnpm dev:alipay    # 支付宝小程序
pnpm dev:tt        # 字节跳动小程序
pnpm dev:rn        # React Native
pnpm dev:qq        # QQ 小程序
pnpm dev:jd        # 京东小程序
pnpm dev:quickapp  # 快应用
```

### 代码质量检查
```bash
# 运行所有检查
pnpm check

# 代码检查
pnpm run lint

# 样式检查
pnpm run stylelint

# TypeScript 类型检查
pnpm run type

# 代码格式化
pnpm run format

# 自动修复
pnpm check:fix
```

## 🏗️ 项目结构

```
open-duck-taro/
├── config/                 # Taro 配置文件
│   ├── index.ts           # 主配置
│   ├── dev.ts             # 开发环境配置
│   └── prod.ts            # 生产环境配置
├── src/                    # 源代码
│   ├── app.ts             # 应用入口
│   ├── app.scss           # 全局样式
│   ├── components/        # 公共组件
│   ├── pages/             # 页面组件
│   ├── stores/            # 状态管理
│   ├── services/          # API 服务
│   ├── utils/             # 工具函数
│   └── types/             # 类型定义
├── dist/                   # 构建输出目录
├── .eslintrc.js           # ESLint 配置
├── .prettierrc.cjs        # Prettier 配置
├── .stylelintrc.cjs       # Stylelint 配置
├── .lintstagedrc.cjs      # Git hooks 配置
├── babel.config.js        # Babel 配置
└── tsconfig.json          # TypeScript 配置
```

## 🔧 配置说明

### Taro 配置
- 使用 Webpack 5 作为构建器
- 配置了路径别名（@/components, @/pages 等）
- 支持 SCSS 预处理器
- 配置了 PostCSS 插件

### 代码质量工具
- **ESLint**: JavaScript/TypeScript 代码质量检查
- **Stylelint**: CSS/SCSS 样式代码检查（已优化 Taro UI 兼容性）
- **Prettier**: 代码格式化
- **Lint-staged**: Git 提交前自动检查

### 样式配置
- 支持 SCSS 语法
- 配置了 Taro UI 组件的样式规则兼容性
- 支持 CSS Modules（可选）
- 自动添加浏览器前缀

## 🚀 快速开始

1. **安装依赖**
   ```bash
   pnpm install
   ```

2. **启动开发服务器**
   ```bash
   pnpm dev:h5
   ```

3. **构建生产版本**
   ```bash
   pnpm build:h5
   ```

4. **代码质量检查**
   ```bash
   pnpm check
   ```

## 📚 相关文档

- [Taro 官方文档](https://docs.taro.zone/)
- [React 官方文档](https://react.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Webpack 官方文档](https://webpack.js.org/)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## �� 许可证

MIT License

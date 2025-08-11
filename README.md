# Open Duck Taro

基于 Taro 4.1.5 的跨平台应用项目，支持微信小程序、H5、React Native 等多个平台。

## 开发环境

- Node.js >= 16
- pnpm >= 7
- Taro CLI 4.1.5

## 安装依赖

```bash
pnpm install
```

## 开发命令

### 构建命令

```bash
# H5 开发
pnpm dev:h5

# 微信小程序开发
pnpm dev:weapp

# 支付宝小程序开发
pnpm dev:alipay

# React Native 开发
pnpm dev:rn
```

### 代码质量检查

```bash
# 运行所有检查（lint + stylelint + type + test）
pnpm check

# 修复所有可自动修复的问题
pnpm check:fix

# 代码规范检查
pnpm lint

# 自动修复 ESLint 问题
pnpm lint:fix

# 样式规范检查
pnpm stylelint

# 自动修复样式问题
pnpm stylelint:fix

# TypeScript 类型检查
pnpm type

# 代码格式化
pnpm format

# 检查代码格式
pnpm format:check
```

### 测试

```bash
# 运行测试
pnpm test

# 监听模式运行测试
pnpm test:watch

# 生成测试覆盖率报告
pnpm test:coverage
```

## 代码规范

### ESLint

- 基于 Taro 官方配置
- 集成 TypeScript 支持
- React Hooks 规则检查

### Stylelint

- 基于标准配置
- 支持 SCSS/Sass
- 与 Prettier 集成

### Prettier

- 统一的代码格式化
- 支持 TypeScript、React、SCSS 等
- 保存时自动格式化

### TypeScript

- 严格的类型检查
- 编译时错误检查
- 类型安全保证

## 项目结构

```
src/
├── app.config.ts      # 应用配置
├── app.scss          # 全局样式
├── app.ts            # 应用入口
├── index.html        # H5 入口页面
└── pages/            # 页面目录
    └── index/        # 首页
        ├── index.config.ts
        ├── index.scss
        └── index.tsx
```

## 支持的平台

- 微信小程序 (weapp)
- 支付宝小程序 (alipay)
- 字节跳动小程序 (tt)
- 百度小程序 (swan)
- 京东小程序 (jd)
- QQ 小程序 (qq)
- 快应用 (quickapp)
- H5 (h5)
- React Native (rn)

## 开发工具推荐

推荐安装以下 VSCode 扩展以获得最佳开发体验：

- ESLint
- Prettier
- Stylelint
- TypeScript Importer
- Auto Rename Tag
- Path Intellisense

## 代码质量工具

本项目集成了多种代码质量检查工具，确保代码的一致性和质量。

### 可用的检查命令

#### 代码检查
- `pnpm run lint` - 运行 ESLint 检查 TypeScript/JavaScript 代码
- `pnpm run lint:fix` - 自动修复 ESLint 发现的问题
- `pnpm run stylelint` - 运行 Stylelint 检查 CSS/SCSS 代码
- `pnpm run stylelint:fix` - 自动修复 Stylelint 发现的问题

#### 类型检查
- `pnpm run type` 或 `pnpm run type:check` - 运行 TypeScript 类型检查

#### 代码格式化
- `pnpm run format` - 使用 Prettier 格式化代码
- `pnpm run format:check` - 检查代码格式是否符合 Prettier 规范

#### 测试
- `pnpm run test` - 运行 Jest 测试
- `pnpm run test:watch` - 以监听模式运行测试
- `pnpm run test:coverage` - 生成测试覆盖率报告

#### 组合检查命令
- `pnpm run check:lint` - 运行代码检查（ESLint + Stylelint）
- `pnpm run check:lint:fix` - 自动修复代码检查问题
- `pnpm run check:type` - 运行类型检查
- `pnpm run check:test` - 运行测试
- `pnpm run check:format` - 检查代码格式
- `pnpm run check:format:fix` - 自动修复代码格式
- `pnpm run check` - 运行所有检查（lint + stylelint + type + test）
- `pnpm run check:fix` - 自动修复所有可修复的问题

### Git Hooks

项目配置了 Husky 和 lint-staged，在每次 git commit 前会自动：
1. 运行 ESLint 检查并自动修复
2. 运行 Stylelint 检查并自动修复  
3. 使用 Prettier 格式化代码

### 配置文件

- `.eslintrc.js` - ESLint 配置
- `.stylelintrc.js` - Stylelint 配置
- `.prettierrc` - Prettier 配置
- `.lintstagedrc.js` - lint-staged 配置
- `.husky/pre-commit` - Git pre-commit hook
- `tsconfig.json` - TypeScript 配置

### 使用建议

1. **开发时**：使用 `pnpm run check:lint` 检查代码质量
2. **提交前**：使用 `pnpm run check:format:fix` 确保代码格式正确
3. **完整检查**：使用 `pnpm run check` 运行所有检查
4. **自动修复**：使用 `pnpm run check:fix` 自动修复大部分问题

### 注意事项

- TypeScript 版本兼容性警告可以忽略，不影响功能
- 如果遇到 stylelint 规则问题，可以调整 `.stylelintrc.js` 配置
- 建议在 IDE 中安装相应的 ESLint、Stylelint 和 Prettier 插件以获得更好的开发体验

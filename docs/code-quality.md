# 代码质量工具配置说明

本项目已成功集成了完整的代码质量检查工具链，包括代码检查、类型检查、代码格式化和测试等。

## 🛠️ 已配置的工具

### 1. ESLint - JavaScript/TypeScript 代码检查
- **配置文件**: `.eslintrc.js`
- **忽略文件**: `.eslintignore`
- **功能**: 检查代码质量、发现潜在问题、强制执行编码规范

### 2. Stylelint - CSS/SCSS 代码检查
- **配置文件**: `.stylelintrc.js`
- **忽略文件**: `.stylelintignore`
- **功能**: 检查样式代码规范、发现样式问题

### 3. Prettier - 代码格式化
- **配置文件**: `.prettierrc`
- **忽略文件**: `.prettierignore`
- **功能**: 统一代码格式、自动格式化代码

### 4. TypeScript 类型检查
- **配置文件**: `tsconfig.json`
- **功能**: 静态类型检查、发现类型错误

### 5. Jest - 测试框架
- **配置文件**: `jest.config.ts`
- **功能**: 单元测试、测试覆盖率

### 6. Husky + lint-staged - Git Hooks
- **配置**: `.husky/pre-commit`, `.lintstagedrc.js`
- **功能**: 提交前自动运行代码检查

## 📋 可用的命令

### 基础检查命令
```bash
# 代码检查
pnpm run lint              # ESLint 检查
pnpm run lint:fix          # ESLint 自动修复
pnpm run stylelint         # Stylelint 检查
pnpm run stylelint:fix     # Stylelint 自动修复

# 类型检查
pnpm run type              # TypeScript 类型检查
pnpm run type:check        # 同上

# 代码格式化
pnpm run format            # Prettier 格式化
pnpm run format:check      # 检查格式

# 测试
pnpm run test              # 运行测试
pnpm run test:watch        # 监听模式测试
pnpm run test:coverage     # 生成覆盖率报告
```

### 组合检查命令
```bash
# 代码质量检查
pnpm run check:lint        # 代码检查 (ESLint + Stylelint)
pnpm run check:lint:fix    # 自动修复代码问题
pnpm run check:type        # 类型检查
pnpm run check:test        # 运行测试
pnpm run check:format      # 格式检查
pnpm run check:format:fix  # 自动修复格式

# 完整检查
pnpm run check             # 所有检查 (lint + stylelint + type + test)
pnpm run check:fix         # 自动修复所有问题
```

## 🔧 配置文件说明

### ESLint 配置 (`.eslintrc.js`)
- 基于 Taro React 配置
- 支持 TypeScript
- 包含 React Hooks 规则
- 自定义规则配置

### Stylelint 配置 (`.stylelintrc.js`)
- 支持 SCSS 语法
- 基础规则配置
- 忽略构建文件和第三方库

### Prettier 配置 (`.prettierrc`)
- 统一的代码风格
- 支持多种文件类型
- 与 ESLint 和 Stylelint 兼容

### TypeScript 配置 (`tsconfig.json`)
- 严格的类型检查
- 支持装饰器
- 包含测试文件

### Jest 配置 (`jest.config.ts`)
- 支持 TypeScript
- 配置测试环境
- 包含测试工具

## 🚀 使用流程

### 开发时
1. 编写代码
2. 运行 `pnpm run check:lint` 检查代码质量
3. 运行 `pnpm run check:type` 检查类型
4. 运行 `pnpm run test` 运行测试

### 提交前
1. 运行 `pnpm run check:format:fix` 格式化代码
2. 运行 `pnpm run check:lint:fix` 修复代码问题
3. 运行 `pnpm run check` 完整检查
4. 提交代码

### 自动检查
- 每次 `git commit` 前会自动运行代码检查
- 自动修复可修复的问题
- 自动格式化代码

## ⚠️ 注意事项

### TypeScript 版本兼容性
- 当前 TypeScript 版本 (5.9.2) 与 ESLint 插件不完全兼容
- 警告信息可以忽略，不影响功能
- 建议在 IDE 中安装相应插件获得更好体验

### Stylelint 配置
- 使用基础配置避免版本兼容性问题
- 可根据需要逐步添加规则
- 支持 SCSS 语法检查

### 测试配置
- 使用简单的测试避免 Taro 工具兼容性问题
- 可根据项目需要扩展测试用例
- 支持 TypeScript 测试文件

## 🔍 故障排除

### 常见问题
1. **依赖版本冲突**: 检查 package.json 中的版本兼容性
2. **配置文件错误**: 验证配置文件语法
3. **忽略文件问题**: 检查 .ignore 文件配置

### 调试命令
```bash
# 单独运行各个工具
pnpm run lint
pnpm run stylelint
pnpm run type
pnpm run test

# 查看详细输出
pnpm run lint --debug
pnpm run stylelint --debug
```

## 📚 扩展建议

### 可添加的工具
- **Commitlint**: 提交信息规范检查
- **SonarQube**: 代码质量分析
- **Bundle Analyzer**: 打包分析
- **Performance Testing**: 性能测试

### 规则定制
- 根据团队规范调整 ESLint 规则
- 添加项目特定的 Stylelint 规则
- 配置 Prettier 格式化选项

## 🎯 最佳实践

1. **日常开发**: 使用 `pnpm run check:lint` 快速检查
2. **提交前**: 使用 `pnpm run check` 完整检查
3. **CI/CD**: 集成到自动化流程中
4. **团队协作**: 统一工具配置和规则
5. **持续改进**: 定期更新工具和规则

# 建议的开发命令

## 开发启动命令
```bash
# H5 开发（推荐用于日常开发）
pnpm dev:h5

# 微信小程序开发
pnpm dev:weapp

# 其他平台开发
pnpm dev:swan      # 百度小程序
pnpm dev:alipay    # 支付宝小程序
pnpm dev:tt        # 字节跳动小程序
pnpm dev:rn        # React Native
```

## 构建命令
```bash
# H5 构建
pnpm build:h5

# 微信小程序构建
pnpm build:weapp

# 生产环境构建（其他平台类似）
pnpm build:swan
pnpm build:alipay
```

## 代码质量检查（重要）
```bash
# 运行所有检查（推荐在提交前使用）
pnpm check

# 自动修复所有问题
pnpm check:fix

# 单独运行检查
pnpm run lint          # ESLint 检查
pnpm run stylelint      # 样式检查
pnpm run type          # TypeScript 类型检查
pnpm run format:check   # 格式检查

# 单独修复问题
pnpm run lint:fix       # 修复 ESLint 问题
pnpm run stylelint:fix  # 修复样式问题
pnpm run format         # 格式化代码
```

## 测试命令
```bash
# 运行测试
pnpm test

# 监听模式运行测试
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage
```

## MSW 相关命令
```bash
# 初始化 MSW
pnpm msw:init

# 生成 Service Worker
pnpm msw:generate
```

## 系统命令（macOS）
```bash
# 文件操作
ls -la              # 列出详细文件信息
find . -name "*.ts" # 查找 TypeScript 文件
grep -r "keyword"   # 搜索关键词

# Git 操作
git status          # 查看状态
git add .           # 添加所有更改
git commit -m "msg" # 提交更改
git push            # 推送更改

# 包管理
pnpm install        # 安装依赖
pnpm add package    # 添加依赖
pnpm remove package # 移除依赖
```

## 性能分析
```bash
# 构建分析
pnpm analyze

# 性能测试
pnpm perf
```
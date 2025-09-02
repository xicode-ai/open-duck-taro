# Zustand + React Query 开发规范整合总结

## 🎯 规范整合目标

本次更新将 **Zustand** 和 **React Query** 的开发规范完整整合到了 `dev-guide.mdc` 中，为团队提供统一的状态管理开发标准。

## ✅ 新增的规范内容

### 1. Zustand Store 开发规范

#### 基础 Store 定义规范
- ✅ 标准的 Store 结构定义（状态数据 + Actions）
- ✅ 与 React Query 的集成模式
- ✅ 持久化配置和字段选择
- ✅ 类型安全的 Store 定义

#### Zustand 最佳实践
- ✅ 使用 `immer` 中间件处理复杂状态更新
- ✅ 状态分片策略，避免单个 store 过大
- ✅ 使用 `subscribeWithSelector` 进行精确订阅
- ✅ 组件中的精确状态订阅模式

#### Zustand 与 React Query 集成规范
- ✅ 在 Zustand actions 中同步 React Query 缓存
- ✅ 数据预取策略和实现方式
- ✅ 缓存清理和失效机制
- ✅ 双向数据同步的最佳实践

### 2. React Query 开发规范

#### Query Keys 管理规范
- ✅ 统一的 Query Keys 定义结构
- ✅ 层次化的 Key 组织方式
- ✅ 参数化 Query Keys 的标准模式
- ✅ 类型安全的 Key 定义

#### 查询 Hooks 规范
- ✅ 标准查询 Hook 的实现模式
- ✅ 带参数查询的处理方式
- ✅ 条件查询的启用控制
- ✅ 缓存时间和数据新鲜度配置

#### 变更 Hooks 规范
- ✅ 标准变更 Hook 的实现
- ✅ 乐观更新的完整实现模式
- ✅ 错误回滚机制
- ✅ 缓存同步和失效策略

#### React Query 配置规范
- ✅ QueryClient 的标准配置
- ✅ 重试机制和延迟策略
- ✅ 网络状态处理
- ✅ 全局错误处理配置

#### 数据预取和缓存策略
- ✅ 数据预取工具的实现
- ✅ 组件中预取数据的使用方式
- ✅ 不同类型数据的缓存策略
- ✅ 缓存生命周期管理

#### 错误处理和加载状态
- ✅ 统一的错误处理模式
- ✅ 加载状态的标准处理
- ✅ 重试机制的用户界面
- ✅ 变更状态的处理方式

### 3. 状态管理架构原则

#### 数据流设计
- ✅ 清晰的数据流向图
- ✅ 用户操作到 UI 更新的完整链路
- ✅ API 调用和缓存更新的流程

#### 职责分离
- ✅ Zustand 和 React Query 的职责划分
- ✅ 客户端状态 vs 服务端状态的管理
- ✅ 双向同步的实现策略

#### 缓存策略
- ✅ 不同类型数据的缓存时间配置
- ✅ 用户信息、话题、聊天等数据的差异化策略
- ✅ 实时数据的处理方式

## 📋 规范覆盖的关键领域

### Store 设计模式
```typescript
// 标准的 Store 结构
interface StoreState {
  // 状态数据
  data: DataType

  // Actions（动作方法）
  setData: (data: DataType) => void
  updateData: (updates: Partial<DataType>) => void
}
```

### Query Hook 模式
```typescript
// 标准的查询 Hook
export const useData = (params?: QueryParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.DATA(params),
    queryFn: async () => {
      const response = await api.getData(params)
      return response.data
    },
    staleTime: 10 * 60 * 1000,
  })
}
```

### Mutation Hook 模式
```typescript
// 标准的变更 Hook
export const useUpdateData = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateData) => {
      const response = await api.updateData(data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.DATA(), data)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DATA })
    },
  })
}
```

### 集成同步模式
```typescript
// Zustand 与 React Query 的同步
const setData = (data: DataType) => {
  set({ data })
  // 同步更新 React Query 缓存
  queryClient.setQueryData(QUERY_KEYS.DATA(), data)
}
```

## 🎯 规范的核心价值

### 1. 统一性
- 所有开发者使用相同的模式和约定
- 减少代码风格差异和理解成本
- 提高代码的可维护性

### 2. 最佳实践
- 基于实际项目经验总结的最佳实践
- 避免常见的状态管理陷阱
- 提供经过验证的解决方案

### 3. 类型安全
- 完整的 TypeScript 类型支持
- 编译时错误检查
- 更好的开发体验

### 4. 性能优化
- 智能缓存策略
- 精确的状态订阅
- 减少不必要的重渲染

### 5. 错误处理
- 统一的错误处理模式
- 用户友好的错误反馈
- 自动重试机制

## 📚 使用指南

### 开发新功能时
1. 首先确定是客户端状态还是服务端状态
2. 客户端状态使用 Zustand Store
3. 服务端状态使用 React Query Hooks
4. 需要同步时按照集成规范实现

### 代码审查时
1. 检查是否遵循了 Store 定义规范
2. 验证 Query Keys 的命名和结构
3. 确认缓存策略是否合适
4. 检查错误处理是否完整

### 重构现有代码时
1. 识别当前的状态管理模式
2. 按照新规范逐步迁移
3. 确保数据同步的正确性
4. 验证性能是否有提升

## 🔄 规范的持续改进

这些规范将随着项目的发展和团队经验的积累持续改进：

1. **定期回顾**: 每季度回顾规范的适用性
2. **实践反馈**: 收集开发过程中的问题和建议
3. **版本更新**: 跟进 Zustand 和 React Query 的版本更新
4. **最佳实践**: 持续总结和分享最佳实践

## 🎉 总结

通过将 Zustand 和 React Query 的开发规范整合到 `dev-guide.mdc` 中，我们为开口鸭项目建立了：

- ✅ **完整的状态管理规范体系**
- ✅ **统一的开发模式和约定**
- ✅ **类型安全的实现指导**
- ✅ **性能优化的最佳实践**
- ✅ **错误处理的标准模式**

这些规范将帮助团队：
- 🚀 **提高开发效率**
- 🛡️ **减少 Bug 和错误**
- 📈 **提升代码质量**
- 🤝 **增强团队协作**

所有规范都已经过实际项目验证，可以安全地应用到日常开发中。

---

*规范整合完成时间: 2025年9月2日*
*整合内容: Zustand + React Query 开发规范*

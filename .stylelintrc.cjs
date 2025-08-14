module.exports = {
  customSyntax: 'postcss-scss',
  rules: {
    // 允许 Taro UI 组件的类名格式（如 .at-card__header, .at-button--small）
    'selector-class-pattern': null,

    // 允许 :global 伪类（Taro 常用）
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],

    // 允许 Taro 相关的选择器类型
    'selector-type-no-unknown': [
      true,
      {
        ignoreTypes: ['page'],
      },
    ],

    // 允许现代 CSS 函数语法
    'color-function-notation': null,
    'alpha-value-notation': null,

    // 允许媒体查询的现代语法
    'media-feature-range-notation': null,

    // 允许字体名称的引号
    'font-family-name-quotes': null,

    // 允许重复属性（某些情况下需要）
    'declaration-block-no-duplicate-properties': null,

    // 允许降序特异性（某些情况下需要）
    'no-descending-specificity': null,

    // 允许动画名称模式
    'keyframes-name-pattern': null,

    // 允许导入语法
    'import-notation': null,

    // 允许 Taro 特定的样式规则
    'property-no-unknown': [
      true,
      {
        ignoreProperties: ['composes'],
      },
    ],

    // 允许 Taro UI 的特定值
    'value-keyword-case': null,
    'function-name-case': null,

    // 允许 Taro 的特定前缀
    'property-no-vendor-prefix': null,
    'value-no-vendor-prefix': null,
    'selector-no-vendor-prefix': null,
    'at-rule-no-vendor-prefix': null,

    // 允许 Taro 的长度单位
    'length-zero-no-unit': null,

    // 允许 Taro 的颜色值
    'color-hex-length': null,

    // 允许 Taro 的注释
    'no-invalid-double-slash-comments': null,

    // 允许 Taro 的规则顺序
    'rule-empty-line-before': null,

    // 允许 Taro 的简写属性
    'shorthand-property-no-redundant-values': null,
  },
  ignoreFiles: [
    'dist/**/*',
    'node_modules/**/*',
    '**/node_modules/**/*',
    '**/dist/**/*',
  ],
}

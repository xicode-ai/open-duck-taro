module.exports = {
  plugins: {
    // 修复 Flexbox 在旧版本浏览器中的问题
    'postcss-flexbugs-fixes': {},

    // 将 px 转换为 viewport 单位，实现更好的响应式
    'postcss-px-to-viewport': {
      viewportWidth: 375, // 设计稿宽度，基于 iPhone 标准尺寸
      viewportHeight: 667, // 设计稿高度
      unitPrecision: 5, // 转换后的精度
      viewportUnit: 'vw', // 转换成的视窗单位
      selectorBlackList: [
        '.ignore', // 忽略的类名
        '.hairlines', // 忽略的类名
        '.taro', // 忽略 Taro 相关类名
        '.at-', // 忽略 Taro UI 相关类名
      ],
      minPixelValue: 1, // 小于或等于1px不转换为视窗单位
      mediaQuery: false, // 是否在媒体查询的css代码中也进行转换
      exclude: [
        /node_modules/i, // 排除 node_modules 目录
        /src\/components\/common/i, // 排除公共组件
      ],
    },

    // 自动添加 viewport 单位回退
    'postcss-viewport-units': {
      filterRule: rule =>
        rule.selector.indexOf('::after') !== -1 &&
        rule.selector.indexOf('::before') !== -1 &&
        rule.selector.indexOf(':after') !== -1 &&
        rule.selector.indexOf(':before') !== -1,
    },

    // 自动添加浏览器前缀
    autoprefixer: {
      overrideBrowserslist: [
        'last 3 versions',
        'Android >= 4.1',
        'iOS >= 8',
        'Chrome >= 50',
        'Safari >= 8',
        'Firefox >= 50',
      ],
    },
  },
}

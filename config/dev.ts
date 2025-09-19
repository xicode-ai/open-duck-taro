import type { UserConfigExport } from '@tarojs/cli'

export default {
  mini: {},
  h5: {
    devServer: {
      port: 10086,
      host: '0.0.0.0',
      hot: true, // 启用热模块替换
      open: true, // 自动打开浏览器
      historyApiFallback: true, // 支持 History API
    },
    // 优化 webpack 配置
    webpackChain(chain) {
      // 优化模块解析
      chain.resolve.extensions.merge(['.ts', '.tsx', '.js', '.jsx'])

      // 减少警告输出，提升开发体验
      chain.stats('minimal')

      // 优化性能
      chain.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      })
    },
  },
} satisfies UserConfigExport<'webpack5'>

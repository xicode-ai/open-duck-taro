import { defineConfig } from '@tarojs/cli'

export default defineConfig({
  projectName: 'open-duck',
  date: '2025-1-19',
  designWidth: 375, // 基于 iPhone 标准尺寸
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 2 / 1, // iPhone 标准尺寸
    414: 3 / 2, // iPhone Plus 尺寸
    390: 2 / 1, // iPhone 12/13/14 尺寸
    428: 3 / 2, // iPhone 12/13/14 Pro Max 尺寸
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-html', '@tarojs/plugin-platform-h5'],
  defineConstants: {},
  copy: {
    patterns: [],
    options: {},
  },
  framework: 'react',
  compiler: 'webpack5',
  cache: {
    enable: false, // 开发时关闭缓存
  },
  mini: {},
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {
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
      pxtransform: {
        enable: true,
        config: {
          selectorBlackList: ['.ignore', '.hairlines', '.taro', '.at-'],
        },
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
    webpackChain(chain) {
      // 优化 H5 端配置
      chain.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial',
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            chunks: 'initial',
            reuseExistingChunk: true,
          },
        },
      })

      // 添加手机端优化
      chain.plugin('html').tap(args => {
        args[0].meta = {
          ...args[0].meta,
          viewport:
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover',
          'apple-mobile-web-app-capable': 'yes',
          'apple-mobile-web-app-status-bar-style': 'black-translucent',
          'format-detection': 'telephone=no',
          'msapplication-tap-highlight': 'no',
        }
        return args
      })

      // 优化图片加载
      chain.module
        .rule('images')
        .test(/\.(png|jpe?g|gif|svg|webp)$/i)
        .use('url-loader')
        .loader('url-loader')
        .options({
          limit: 8192,
          fallback: 'file-loader',
          name: 'static/images/[name].[hash:8].[ext]',
        })

      return chain
    },
    router: {
      mode: 'browser',
    },
    devServer: {
      host: '0.0.0.0',
      port: 10086,
      open: false,
      hot: true,
      compress: true,
      disableHostCheck: true,
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  },
})

import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import devConfig from './dev'
import prodConfig from './prod'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'webpack5'>(
  async (merge, { command: _command, mode: _mode }) => {
    const baseConfig: UserConfigExport<'webpack5'> = {
      projectName: 'open-duck',
      date: '2024-1-1',
      designWidth: 375,
      deviceRatio: {
        640: 2.34 / 2,
        750: 1,
        375: 1,
        414: 375 / 414,
        428: 375 / 428,
        390: 375 / 390,
        393: 375 / 393,
        360: 375 / 360,
        828: 1.81 / 2,
      },
      sourceRoot: 'src',
      outputRoot: 'dist',
      entry: 'src/app.tsx',
      plugins: [
        '@tarojs/plugin-framework-react',
        '@tarojs/plugin-platform-h5',
        '@tarojs/plugin-platform-weapp',
      ],
      defineConstants: {},
      copy: {
        patterns: [
          // 复制MSW Service Worker文件到输出目录
          {
            from: 'public/mockServiceWorker.js',
            to: 'dist/mockServiceWorker.js',
          },
        ],
        options: {},
      },
      framework: 'react',
      compiler: 'webpack5',
      alias: {
        '@': resolve(__dirname, '..', 'src'),
        '@/components': resolve(__dirname, '..', 'src/components'),
        '@/pages': resolve(__dirname, '..', 'src/pages'),
        '@/utils': resolve(__dirname, '..', 'src/utils'),
        '@/stores': resolve(__dirname, '..', 'src/stores'),
        '@/services': resolve(__dirname, '..', 'src/services'),
        '@/types': resolve(__dirname, '..', 'src/types'),
      },
      mini: {
        postcss: {
          pxtransform: {
            enable: true,
            config: {},
          },
          cssModules: {
            enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
            config: {
              namingPattern: 'module', // 转换模式，取值为 global/module
              generateScopedName: '[name]__[local]___[hash:base64:5]',
            },
          },
        },
      },
      h5: {
        publicPath: '/',
        staticDirectory: 'static',
        miniCssExtractPluginOption: {
          ignoreOrder: true,
          filename: 'css/[name].[hash].css',
          chunkFilename: 'css/[name].[chunkhash].css',
        },
        postcss: {
          pxtransform: {
            enable: true,
            config: {
              baseFontSize: 20,
              unitPrecision: 5,
              propList: ['*'],
              selectorBlackList: [],
              replace: true,
              mediaQuery: false,
              minPixelValue: 0,
            },
          },
          autoprefixer: {
            enable: true,
            config: {},
          },
          cssModules: {
            enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
            config: {
              namingPattern: 'module', // 转换模式，取值为 global/module
              generateScopedName: '[name]__[local]___[hash:base64:5]',
            },
          },
        },
      },
      rn: {
        appName: 'openDuck',
        postcss: {
          cssModules: {
            enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          },
        },
      },
    }
    if (process.env.NODE_ENV === 'development') {
      // 本地开发构建配置（不混淆压缩）
      return merge({}, baseConfig, devConfig)
    }
    // 生产构建配置（默认开启压缩混淆等）
    return merge({}, baseConfig, prodConfig)
  }
)

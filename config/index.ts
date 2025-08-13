import path from 'path'
import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import { fileURLToPath } from 'url'
import devConfig from './dev'
import prodConfig from './prod'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const config = defineConfig(async (merge, { command: _command, mode: _mode }) => {
  const baseConfig: UserConfigExport = {
    projectName: 'open-duck',
    date: '2024-1-1',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2,
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: ['@tarojs/plugin-html', '@tarojs/plugin-framework-react'],
    defineConstants: {},
    alias: {
      '@': path.resolve(__dirname, '..', 'src'),
      '@/components': path.resolve(__dirname, '..', 'src/components'),
      '@/pages': path.resolve(__dirname, '..', 'src/pages'),
      '@/utils': path.resolve(__dirname, '..', 'src/utils'),
      '@/stores': path.resolve(__dirname, '..', 'src/stores'),
      '@/services': path.resolve(__dirname, '..', 'src/services'),
      '@/types': path.resolve(__dirname, '..', 'src/types'),
    },
    copy: {
      patterns: [],
      options: {},
    },
    framework: 'react',
    compiler: 'webpack5',
    cache: {
      enable: false,
    },
    prebundle: {
      enable: true,
      force: false,
      include: ['react', 'react-dom'],
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        url: {
          enable: true,
          config: {
            limit: 1024,
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
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
      },
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      output: {
        filename: 'js/[name].[hash:8].js',
        chunkFilename: 'js/[name].[chunkhash:8].js',
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css',
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {},
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
        // 添加 tsconfig-paths 插件
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)

        // 配置模块解析
        chain.resolve.extensions.add('.ts').add('.tsx').add('.js').add('.jsx').add('.json')

        // 配置 target 为 web
        chain.target('web')

        // 配置 output 的 globalObject
        chain.output.globalObject('globalThis')
      },
    },
    rn: {
      appName: 'taroDemo',
      postcss: {
        cssModules: {
          enable: false,
        },
      },
    },
  }

  if (process.env.NODE_ENV === 'development') {
    return merge({}, baseConfig, devConfig)
  }
  return merge({}, baseConfig, prodConfig)
})

export default config

import type { UserConfigExport } from '@tarojs/cli'

export default {
  mini: {},
  h5: {
    devServer: {
      port: 10086,
      host: '0.0.0.0',
    },
  },
} satisfies UserConfigExport<'webpack5'>

import type { UserConfigExport } from '@tarojs/cli'

export default {
  logger: {
    quiet: false,
    stats: true,
  },
  mini: {},
  h5: {
    devServer: {
      host: 'localhost',
      port: 10086,
      https: false,
      open: false,
    },
  },
} satisfies UserConfigExport

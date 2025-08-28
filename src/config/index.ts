// 环境配置
interface Config {
  // API配置
  api: {
    baseUrl: string
    timeout: number
    retryCount: number
  }

  // 应用配置
  app: {
    name: string
    version: string
    debug: boolean
  }

  // 功能开关
  features: {
    aiChat: boolean
    voiceRecognition: boolean
    pronunciationScoring: boolean
    offlineMode: boolean
    socialFeatures: boolean
  }

  // 第三方服务配置
  services: {
    // AI服务
    openai?: {
      apiKey: string
      model: string
      maxTokens: number
    }

    // 语音服务
    speech?: {
      provider: 'azure' | 'google' | 'baidu'
      apiKey: string
      region: string
    }

    // 翻译服务
    translation?: {
      provider: 'google' | 'baidu' | 'youdao'
      apiKey: string
    }

    // 支付服务
    payment?: {
      wechat: {
        appId: string
        mchId: string
      }
      alipay: {
        appId: string
      }
    }
  }

  // 缓存配置
  cache: {
    maxAge: number
    maxSize: number
  }

  // 学习配置
  learning: {
    maxDailyConversations: number
    maxDailyWords: number
    practiceTimeLimit: number
    levelUpThreshold: number
  }
}

// 开发环境配置
const devConfig: Config = {
  api: {
    baseUrl: '', // 开发环境使用相对路径，让MSW能拦截请求
    timeout: 10000,
    retryCount: 2,
  },
  app: {
    name: '开口鸭',
    version: '1.0.0',
    debug: true,
  },
  features: {
    aiChat: true,
    voiceRecognition: true,
    pronunciationScoring: true,
    offlineMode: false,
    socialFeatures: false,
  },
  services: {
    openai: {
      apiKey:
        (typeof process !== 'undefined' &&
          process.env?.REACT_APP_OPENAI_API_KEY) ||
        '',
      model: 'gpt-3.5-turbo',
      maxTokens: 1000,
    },
    speech: {
      provider: 'azure',
      apiKey:
        (typeof process !== 'undefined' &&
          process.env?.REACT_APP_SPEECH_API_KEY) ||
        '',
      region: 'eastasia',
    },
    translation: {
      provider: 'google',
      apiKey:
        (typeof process !== 'undefined' &&
          process.env?.REACT_APP_TRANSLATION_API_KEY) ||
        '',
    },
    payment: {
      wechat: {
        appId:
          (typeof process !== 'undefined' &&
            process.env?.REACT_APP_WECHAT_APP_ID) ||
          '',
        mchId:
          (typeof process !== 'undefined' &&
            process.env?.REACT_APP_WECHAT_MCH_ID) ||
          '',
      },
      alipay: {
        appId:
          (typeof process !== 'undefined' &&
            process.env?.REACT_APP_ALIPAY_APP_ID) ||
          '',
      },
    },
  },
  cache: {
    maxAge: 24 * 60 * 60 * 1000, // 24小时
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  learning: {
    maxDailyConversations: 5,
    maxDailyWords: 20,
    practiceTimeLimit: 30 * 60, // 30分钟
    levelUpThreshold: 1000,
  },
}

// 测试环境配置
const testConfig: Config = {
  ...devConfig,
  api: {
    ...devConfig.api,
    baseUrl: 'https://test-api.openduck.com',
  },
  app: {
    ...devConfig.app,
    debug: true,
  },
  features: {
    ...devConfig.features,
    offlineMode: true,
  },
}

// 生产环境配置
const prodConfig: Config = {
  ...devConfig,
  api: {
    ...devConfig.api,
    baseUrl: 'https://api.openduck.com',
    timeout: 15000,
    retryCount: 3,
  },
  app: {
    ...devConfig.app,
    debug: false,
  },
  features: {
    ...devConfig.features,
    offlineMode: true,
    socialFeatures: true,
  },
  learning: {
    ...devConfig.learning,
    maxDailyConversations: 10,
    maxDailyWords: 50,
  },
}

// 安全获取环境变量
const getNodeEnv = (): string => {
  try {
    return (
      (typeof process !== 'undefined' && process.env?.NODE_ENV) || 'development'
    )
  } catch {
    return 'development'
  }
}

// 根据环境获取配置
const getConfig = (): Config => {
  const env = getNodeEnv()

  switch (env) {
    case 'production':
      return prodConfig
    case 'test':
      return testConfig
    case 'development':
    default:
      return devConfig
  }
}

// 当前配置
const config = getConfig()

// 导出配置
export default config

// 导出类型
export type { Config }

// 导出环境变量
export const isDev = getNodeEnv() === 'development'
export const isTest = getNodeEnv() === 'test'
export const isProd = getNodeEnv() === 'production'

// 导出常用配置
export const {
  api: apiConfig,
  app: appConfig,
  features: featureConfig,
  services: serviceConfig,
  cache: cacheConfig,
  learning: learningConfig,
} = config

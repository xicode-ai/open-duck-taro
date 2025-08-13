/// <reference types="@tarojs/taro" />

declare module '*.png'
declare module '*.gif'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.svg'
declare module '*.css'
declare module '*.scss'
declare module '*.sass'
declare module '*.less'

// 扩展 Taro 全局变量
declare const process: {
  env: {
    TARO_ENV: 'weapp' | 'swan' | 'alipay' | 'h5' | 'rn' | 'tt' | 'quickapp' | 'qq' | 'jd'
    NODE_ENV: 'development' | 'production' | 'test'
    [key: string]: string | undefined
  }
}

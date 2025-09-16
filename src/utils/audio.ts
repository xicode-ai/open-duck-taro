import Taro from '@tarojs/taro'

/**
 * 音频工具函数
 */

// 音频格式映射
const AUDIO_FORMATS = {
  mp3: 'audio/mpeg',
  aac: 'audio/aac',
  m4a: 'audio/mp4',
  wav: 'audio/wav',
} as const

/**
 * 将音频文件转换为Base64
 * @param filePath 文件路径
 * @param format 音频格式
 * @returns Base64字符串
 */
export const audioToBase64 = async (
  filePath: string,
  format: keyof typeof AUDIO_FORMATS = 'mp3'
): Promise<string> => {
  try {
    const fileManager = Taro.getFileSystemManager()
    const base64Data = fileManager.readFileSync(filePath, 'base64')
    const mimeType = AUDIO_FORMATS[format] || AUDIO_FORMATS.mp3
    return `data:${mimeType};base64,${base64Data}`
  } catch (error) {
    console.error('音频转Base64失败:', error)
    throw new Error('音频文件转换失败')
  }
}

/**
 * 将Base64转换为临时文件
 * @param base64 Base64字符串
 * @param fileName 文件名
 * @returns 临时文件路径
 */
export const base64ToAudioFile = async (
  base64: string,
  fileName: string = `audio_${Date.now()}.mp3`
): Promise<string> => {
  try {
    // 移除data URL前缀
    const base64Data = base64.replace(/^data:audio\/\w+;base64,/, '')

    // 写入临时文件
    const fileManager = Taro.getFileSystemManager()
    const tempFilePath = `${Taro.env.USER_DATA_PATH}/${fileName}`

    fileManager.writeFileSync(tempFilePath, base64Data, 'base64')

    return tempFilePath
  } catch (error) {
    console.error('Base64转音频文件失败:', error)
    throw new Error('音频文件保存失败')
  }
}

/**
 * 获取音频时长
 * @param filePath 文件路径
 * @returns 时长（秒）
 */
export const getAudioDuration = (filePath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audioContext = Taro.createInnerAudioContext()

    audioContext.src = filePath

    audioContext.onCanplay(() => {
      const duration = audioContext.duration
      audioContext.destroy()
      resolve(duration)
    })

    audioContext.onError(error => {
      audioContext.destroy()
      reject(error)
    })
  })
}

/**
 * 播放音频
 * @param audioUrl 音频URL或路径
 * @param options 播放选项
 */
export const playAudio = (
  audioUrl: string,
  options: {
    autoplay?: boolean
    loop?: boolean
    volume?: number
    onPlay?: () => void
    onPause?: () => void
    onEnded?: () => void
    onError?: (error: unknown) => void
    onTimeUpdate?: (currentTime: number, duration: number) => void
  } = {}
): Taro.InnerAudioContext => {
  const audioContext = Taro.createInnerAudioContext()

  audioContext.src = audioUrl
  audioContext.autoplay = options.autoplay ?? true
  audioContext.loop = options.loop ?? false
  audioContext.volume = options.volume ?? 1

  if (options.onPlay) {
    audioContext.onPlay(options.onPlay)
  }

  if (options.onPause) {
    audioContext.onPause(options.onPause)
  }

  if (options.onEnded) {
    audioContext.onEnded(options.onEnded)
  }

  if (options.onError) {
    audioContext.onError(options.onError)
  }

  if (options.onTimeUpdate) {
    audioContext.onTimeUpdate(() => {
      options.onTimeUpdate?.(audioContext.currentTime, audioContext.duration)
    })
  }

  return audioContext
}

/**
 * 停止所有音频播放
 */
export const stopAllAudio = () => {
  // Taro暂不支持获取所有音频上下文，需要手动管理
  console.log('停止所有音频播放')
}

/**
 * 格式化音频时长
 * @param seconds 秒数
 * @returns 格式化的时间字符串 mm:ss
 */
export const formatAudioDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * 计算音频文件大小
 * @param filePath 文件路径
 * @returns 文件大小（字节）
 */
export const getAudioFileSize = async (filePath: string): Promise<number> => {
  try {
    const fileManager = Taro.getFileSystemManager()
    const stats = fileManager.statSync(filePath)
    return stats.size
  } catch (error) {
    console.error('获取音频文件大小失败:', error)
    return 0
  }
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * 检查录音权限
 * @returns 是否有权限
 */
export const checkRecordPermission = async (): Promise<boolean> => {
  try {
    const { authSetting } = await Taro.getSetting()

    if (authSetting['scope.record']) {
      return true
    }

    // 请求权限
    const { errMsg } = await Taro.authorize({ scope: 'scope.record' })
    return errMsg === 'authorize:ok'
  } catch (error) {
    console.error('检查录音权限失败:', error)
    return false
  }
}

/**
 * 显示录音权限提示
 */
export const showRecordPermissionModal = () => {
  Taro.showModal({
    title: '需要录音权限',
    content: '请在设置中开启录音权限，以使用语音功能',
    confirmText: '去设置',
    success: res => {
      if (res.confirm) {
        Taro.openSetting()
      }
    },
  })
}

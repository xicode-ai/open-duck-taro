import { useState, useRef, useCallback, useEffect } from 'react'
import Taro from '@tarojs/taro'

interface UseAudioRecordingOptions {
  maxDuration?: number // 最大录音时长（毫秒）
  sampleRate?:
    | 8000
    | 11025
    | 12000
    | 16000
    | 22050
    | 24000
    | 32000
    | 44100
    | 48000 // 采样率
  numberOfChannels?: 1 | 2 // 声道数
  encodeBitRate?: number // 编码码率
  format?: 'mp3' | 'aac' // 音频格式（Taro只支持这两种）
  onStart?: () => void // 开始录音回调
  onStop?: (result: RecordingResult) => void // 停止录音回调
  onError?: (error: unknown) => void // 错误回调
}

interface RecordingResult {
  tempFilePath: string
  duration: number
  fileSize: number
  base64?: string
}

export const useAudioRecording = (options: UseAudioRecordingOptions = {}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const recorderManager = useRef<Taro.RecorderManager | null>(null)
  const durationTimer = useRef<NodeJS.Timeout | null>(null)
  const startTime = useRef<number>(0)
  const isDev = process.env.NODE_ENV === 'development'

  // 初始化录音管理器
  useEffect(() => {
    if (!isDev && !recorderManager.current) {
      recorderManager.current = Taro.getRecorderManager()

      // 设置录音事件监听
      recorderManager.current.onStart(() => {
        console.log('录音开始')
        setIsRecording(true)
        setIsPaused(false)
        setError(null)
        startTime.current = Date.now()

        // 开始计时
        durationTimer.current = setInterval(() => {
          setDuration(Date.now() - startTime.current)
        }, 100)

        options.onStart?.()
      })

      recorderManager.current.onPause(() => {
        console.log('录音暂停')
        setIsPaused(true)
        if (durationTimer.current) {
          clearInterval(durationTimer.current)
        }
      })

      recorderManager.current.onResume(() => {
        console.log('录音继续')
        setIsPaused(false)
        durationTimer.current = setInterval(() => {
          setDuration(Date.now() - startTime.current)
        }, 100)
      })

      recorderManager.current.onStop(async res => {
        console.log('录音结束', res)
        setIsRecording(false)
        setIsPaused(false)
        setDuration(0)

        if (durationTimer.current) {
          clearInterval(durationTimer.current)
          durationTimer.current = null
        }

        // 转换为base64（如果需要）
        let base64: string | undefined
        try {
          const fileManager = Taro.getFileSystemManager()
          const fileContent = fileManager.readFileSync(
            res.tempFilePath,
            'base64'
          )
          base64 = `data:audio/${options.format || 'mp3'};base64,${fileContent}`
        } catch (err) {
          console.error('转换base64失败:', err)
        }

        const result: RecordingResult = {
          tempFilePath: res.tempFilePath,
          duration: res.duration,
          fileSize: res.fileSize,
          base64,
        }

        options.onStop?.(result)
      })

      recorderManager.current.onError(error => {
        console.error('录音错误', error)
        setIsRecording(false)
        setIsPaused(false)
        setDuration(0)
        setError(error.errMsg || '录音失败')

        if (durationTimer.current) {
          clearInterval(durationTimer.current)
          durationTimer.current = null
        }

        options.onError?.(error)
      })
    }

    return () => {
      if (durationTimer.current) {
        clearInterval(durationTimer.current)
      }
    }
  }, [isDev, options])

  // 开始录音
  const startRecording = useCallback(async () => {
    // 开发环境模拟
    if (isDev) {
      console.log('开发环境：模拟录音开始')
      setIsRecording(true)
      setError(null)
      startTime.current = Date.now()

      durationTimer.current = setInterval(() => {
        setDuration(Date.now() - startTime.current)
      }, 100)

      options.onStart?.()

      // 模拟自动停止
      setTimeout(() => {
        stopRecording()
      }, options.maxDuration || 10000)

      return
    }

    // 生产环境真实录音
    try {
      // 检查权限
      const { authSetting } = await Taro.getSetting()
      if (!authSetting['scope.record']) {
        const { errMsg } = await Taro.authorize({ scope: 'scope.record' })
        if (errMsg !== 'authorize:ok') {
          throw new Error('未获得录音权限')
        }
      }

      // 开始录音
      const recordOptions: Taro.RecorderManager.StartOption = {
        duration: options.maxDuration || 60000,
        numberOfChannels: options.numberOfChannels || 1,
        encodeBitRate: options.encodeBitRate || 48000,
      }

      // 设置采样率（Taro要求特定值）
      if (options.sampleRate) {
        recordOptions.sampleRate = options.sampleRate as
          | 8000
          | 11025
          | 12000
          | 16000
          | 22050
          | 24000
          | 32000
          | 44100
          | 48000
      }

      // 设置格式（Taro只支持mp3和aac）
      if (
        options.format &&
        (options.format === 'mp3' || options.format === 'aac')
      ) {
        recordOptions.format = options.format
      }

      recorderManager.current?.start(recordOptions)
    } catch (err) {
      console.error('开始录音失败:', err)
      const errorMessage = err instanceof Error ? err.message : '开始录音失败'
      setError(errorMessage)

      Taro.showModal({
        title: '需要录音权限',
        content: '请在设置中开启录音权限',
        showCancel: false,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDev, options])

  // 停止录音
  const stopRecording = useCallback(() => {
    // 开发环境模拟
    if (isDev) {
      console.log('开发环境：模拟录音停止')
      setIsRecording(false)
      setDuration(0)

      if (durationTimer.current) {
        clearInterval(durationTimer.current)
        durationTimer.current = null
      }

      // 模拟返回结果
      const mockResult: RecordingResult = {
        tempFilePath: '/mock/audio/recording.mp3',
        duration: Date.now() - startTime.current,
        fileSize: 1024 * 50, // 50KB
        base64: 'data:audio/mp3;base64,mock_base64_data',
      }

      options.onStop?.(mockResult)
      return
    }

    // 生产环境真实停止
    if (recorderManager.current && isRecording) {
      recorderManager.current.stop()
    }
  }, [isDev, isRecording, options])

  // 暂停录音
  const pauseRecording = useCallback(() => {
    if (isDev) {
      console.log('开发环境：模拟录音暂停')
      setIsPaused(true)
      if (durationTimer.current) {
        clearInterval(durationTimer.current)
      }
      return
    }

    if (recorderManager.current && isRecording && !isPaused) {
      recorderManager.current.pause()
    }
  }, [isDev, isRecording, isPaused])

  // 继续录音
  const resumeRecording = useCallback(() => {
    if (isDev) {
      console.log('开发环境：模拟录音继续')
      setIsPaused(false)
      durationTimer.current = setInterval(() => {
        setDuration(Date.now() - startTime.current)
      }, 100)
      return
    }

    if (recorderManager.current && isRecording && isPaused) {
      recorderManager.current.resume()
    }
  }, [isDev, isRecording, isPaused])

  // 格式化时长
  const formatDuration = useCallback((ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  return {
    // 状态
    isRecording,
    isPaused,
    duration,
    formattedDuration: formatDuration(duration),
    error,

    // 方法
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  }
}

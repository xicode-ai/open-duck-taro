import { View } from '@tarojs/components'
import { FC } from 'react'
import './index.scss'

interface VoiceWaveformProps {
  duration: number // 音频时长（秒）
  isPlaying?: boolean // 是否正在播放
  className?: string
}

/**
 * 语音波形组件
 * 显示模拟的音频波形效果
 */
const VoiceWaveform: FC<VoiceWaveformProps> = ({
  duration,
  isPlaying = false,
  className = '',
}) => {
  // 格式化时长显示
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.floor(seconds)}"`
    }
    const min = Math.floor(seconds / 60)
    const sec = Math.floor(seconds % 60)
    return `${min}'${sec.toString().padStart(2, '0')}"`
  }

  // 根据时长生成波形条数（3-7条）
  const waveCount = Math.min(7, Math.max(3, Math.floor(duration / 3)))

  return (
    <View
      className={`voice-waveform ${isPlaying ? 'playing' : ''} ${className}`}
    >
      <View className="waveform-bars">
        {Array.from({ length: waveCount }).map((_, index) => (
          <View
            key={index}
            className="wave-bar"
            style={{
              animationDelay: `${index * 0.1}s`,
              height: `${20 + (index % 3) * 8}rpx`, // 创建不同高度的波形
            }}
          />
        ))}
      </View>
      <View className="duration-text">{formatDuration(duration)}</View>
    </View>
  )
}

export default VoiceWaveform

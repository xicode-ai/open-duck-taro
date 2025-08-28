/**
 * Mock录音服务 - 仅在开发环境下使用
 */

import { isDevelopment } from '../utils/environment'

export interface MockAudioData {
  audioUrl: string
  duration: number
  text: string
  confidence: number
}

/**
 * 模拟语音转文字结果
 */
const mockSpeechToTextResults = [
  "Hello, I'd like to practice speaking English.",
  'How are you doing today?',
  'I want to improve my pronunciation.',
  'Can you help me with grammar?',
  "What's the weather like today?",
  'I enjoy learning new languages.',
  'Could you repeat that, please?',
  'Thank you for your help.',
  "I'm trying to speak more fluently.",
  'What topics should we discuss?',
  'I like watching English movies.',
  'My favorite color is blue.',
  'I work as a software developer.',
  'I live in a big city.',
  'I love traveling to new places.',
]

/**
 * 模拟AI回复内容
 */
const mockAIResponses = [
  {
    text: "That's great! What topics would you like to discuss today?",
    duration: 5,
    translation: '太好了！今天你想讨论什么话题呢？',
  },
  {
    text: 'Excellent pronunciation! Your English is improving.',
    duration: 4,
    translation: '发音很棒！你的英语在进步。',
  },
  {
    text: 'I understand. Could you tell me more about that?',
    duration: 4,
    translation: '我明白了。你能详细说说吗？',
  },
  {
    text: 'Interesting point! How do you usually practice English?',
    duration: 6,
    translation: '有趣的观点！你平时是怎么练习英语的？',
  },
  {
    text: 'Good job! Let me help you with a more natural expression.',
    duration: 5,
    translation: '做得好！让我帮你用更地道的表达方式。',
  },
  {
    text: 'Your accent is getting better. Keep practicing!',
    duration: 4,
    translation: '你的口音在变好。继续练习！',
  },
  {
    text: "That's a good question. Let me explain it to you.",
    duration: 5,
    translation: '这是个好问题。让我为你解释一下。',
  },
  {
    text: "I can see you're making progress. Well done!",
    duration: 4,
    translation: '我能看到你在进步。做得好！',
  },
]

/**
 * 生成模拟录音数据
 */
export const generateMockAudioData = (): MockAudioData => {
  if (!isDevelopment()) {
    throw new Error('Mock录音服务仅在开发环境下可用')
  }

  const randomText =
    mockSpeechToTextResults[
      Math.floor(Math.random() * mockSpeechToTextResults.length)
    ]
  const duration = Math.floor(Math.random() * 10 + 3) // 3-13秒
  const confidence = 0.8 + Math.random() * 0.2 // 80%-100%的置信度

  return {
    audioUrl: `mock-audio-${Date.now()}.wav`,
    duration,
    text: randomText,
    confidence,
  }
}

/**
 * 获取模拟AI回复
 */
export const getMockAIResponse = () => {
  if (!isDevelopment()) {
    throw new Error('Mock录音服务仅在开发环境下可用')
  }

  return mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)]
}

/**
 * 模拟录音开始
 */
export const mockStartRecording = (): Promise<void> => {
  if (!isDevelopment()) {
    throw new Error('Mock录音服务仅在开发环境下可用')
  }

  return new Promise(resolve => {
    console.log('🎤 Mock录音开始...')
    setTimeout(resolve, 100)
  })
}

/**
 * 模拟录音停止
 */
export const mockStopRecording = (): Promise<MockAudioData> => {
  if (!isDevelopment()) {
    throw new Error('Mock录音服务仅在开发环境下可用')
  }

  return new Promise(resolve => {
    console.log('🎤 Mock录音停止...')
    setTimeout(() => {
      resolve(generateMockAudioData())
    }, 500)
  })
}

/**
 * 模拟语音转文字
 */
export const mockSpeechToText = (audioData: MockAudioData): Promise<string> => {
  if (!isDevelopment()) {
    throw new Error('Mock录音服务仅在开发环境下可用')
  }

  return new Promise(resolve => {
    console.log('🔊 Mock语音转文字处理中...')
    setTimeout(
      () => {
        resolve(audioData.text)
      },
      1000 + Math.random() * 1000
    ) // 1-2秒的随机延迟
  })
}

/**
 * 检查是否应该使用mock录音
 */
export const shouldUseMockAudio = (): boolean => {
  return isDevelopment()
}

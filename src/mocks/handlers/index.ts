import { http, HttpResponse } from 'msw'
import { chatHandlers } from './chat'
import { userHandlers } from './user'
import { vocabularyHandlers } from './vocabulary'
import { topicsHandlers } from './topics'
import { translateHandlers } from './translate'
import { progressHandlers } from './progress'
import { membershipHandlers } from './membership'
import { photoStoryHandlers } from './photoStory'

// 通用handlers（处理favicon等）
const commonHandlers = [
  // 处理favicon请求，避免MSW警告
  http.get('/favicon.ico', () => {
    return new HttpResponse(null, { status: 204 })
  }),
]

// 合并所有handlers
export const handlers = [
  ...commonHandlers,
  ...chatHandlers,
  ...userHandlers,
  ...vocabularyHandlers,
  ...topicsHandlers,
  ...translateHandlers,
  ...progressHandlers,
  ...membershipHandlers,
  ...photoStoryHandlers,
]

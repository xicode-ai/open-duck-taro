import { chatHandlers } from './chat'
import { userHandlers } from './user'
import { vocabularyHandlers } from './vocabulary'
import { topicsHandlers } from './topics'
import { translateHandlers } from './translate'
import { progressHandlers } from './progress'
import { membershipHandlers } from './membership'
import { photoStoryHandlers } from './photoStory'

// 合并所有handlers
export const handlers = [
  ...chatHandlers,
  ...userHandlers,
  ...vocabularyHandlers,
  ...topicsHandlers,
  ...translateHandlers,
  ...progressHandlers,
  ...membershipHandlers,
  ...photoStoryHandlers,
]

import React from 'react'
import { View } from '@tarojs/components'
import './index.scss'

export interface CustomIconProps {
  name: string
  size?: number
  color?: string // 添加color属性支持
  style?: React.CSSProperties
  className?: string
  onClick?: () => void
}

// 自定义图标SVG数据 - 匹配原型UI设计
const customIcons: Record<string, { svg: string; bgColor: string }> = {
  chat: {
    bgColor: '#3B82F6', // 蓝色
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.4183 21 12 21C10.8881 21 9.84482 20.7927 8.90353 20.4187L3 22L4.58132 16.0965C4.20731 15.1552 4 14.1119 4 13C4 8.58172 8.58172 4 13 4C17.4183 4 22 8.58172 22 13Z"
              stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
  },
  list: {
    bgColor: '#10B981', // 绿色
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 5H20M9 12H20M9 19H20M5 5H5.01M5 12H5.01M5 19H5.01"
              stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3 7C3 8.10457 3.89543 9 5 9C6.10457 9 7 8.10457 7 7C7 5.89543 6.10457 5 5 5C3.89543 5 3 5.89543 3 7Z"
              fill="white"/>
        <path d="M3 12C3 13.1046 3.89543 14 5 14C6.10457 14 7 13.1046 7 12C7 10.8954 6.10457 10 5 10C3.89543 10 3 10.8954 3 12Z"
              fill="white"/>
        <path d="M3 17C3 18.1046 3.89543 19 5 19C6.10457 19 7 18.1046 7 17C7 15.8954 6.10457 15 5 15C3.89543 15 3 15.8954 3 17Z"
              fill="white"/>
      </svg>
    `,
  },
  translate: {
    bgColor: '#8B5CF6', // 紫色
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 8L3 12L7 16M17 8L21 12L17 16M14 4L10 20"
              stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="2" fill="white"/>
      </svg>
    `,
  },
  'photo-story': {
    bgColor: '#F59E0B', // 橙色
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M23 19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V8C1 6.89543 1.89543 6 3 6H5.5L7.5 3H16.5L18.5 6H21C22.1046 6 23 6.89543 23 8V19Z"
              stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="13" r="4" stroke="white" stroke-width="2"/>
        <path d="M8 15L10 13L13 16L17 12L19 14" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
  },
  vocabulary: {
    bgColor: '#EF4444', // 红色
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 19.5C4 18.1193 4.95818 17 6.5 17H20V18.5C20 19.3284 19.3284 20 18.5 20H6.5C4.95818 20 4 18.8807 4 17.5V19.5Z"
              fill="white"/>
        <path d="M6.5 2H20V17H6.5C4.95818 17 4 15.8807 4 14.5V4.5C4 3.11929 4.95818 2 6.5 2Z"
              stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 6H16M8 10H16M8 14H12" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="7.5" cy="6" r="0.5" fill="white"/>
        <circle cx="7.5" cy="10" r="0.5" fill="white"/>
        <circle cx="7.5" cy="14" r="0.5" fill="white"/>
      </svg>
    `,
  },
  help: {
    bgColor: '#F59E0B', // 橙色
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/>
        <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13"
              stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 17H12.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
  },

  // 通用UI图标
  'arrow-left': {
    bgColor: '#6B7280',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 12H5M12 19l-7-7 7-7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
  },
  'arrow-right': {
    bgColor: '#6B7280',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 12h14M12 5l7 7-7 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
  },
  settings: {
    bgColor: '#6B7280',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="3" stroke="white" stroke-width="2"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="white" stroke-width="2"/>
      </svg>
    `,
  },
  notification: {
    bgColor: '#F59E0B',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
  },

  // 媒体控制图标
  'play-circle': {
    bgColor: '#10B981',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/>
        <polygon points="10,8 16,12 10,16" fill="white"/>
      </svg>
    `,
  },
  'pause-circle': {
    bgColor: '#F59E0B',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/>
        <line x1="10" y1="15" x2="10" y2="9" stroke="white" stroke-width="2" stroke-linecap="round"/>
        <line x1="14" y1="15" x2="14" y2="9" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `,
  },
  microphone: {
    bgColor: '#EF4444',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="12" y1="19" x2="12" y2="23" stroke="white" stroke-width="2" stroke-linecap="round"/>
        <line x1="8" y1="23" x2="16" y2="23" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `,
  },

  // 学习工具图标
  book: {
    bgColor: '#3B82F6',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="white" stroke-width="2"/>
        <line x1="8" y1="6" x2="16" y2="6" stroke="white" stroke-width="1.5"/>
        <line x1="8" y1="10" x2="16" y2="10" stroke="white" stroke-width="1.5"/>
        <line x1="8" y1="14" x2="12" y2="14" stroke="white" stroke-width="1.5"/>
      </svg>
    `,
  },
  clock: {
    bgColor: '#10B981',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/>
        <polyline points="12,6 12,12 16,14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
  },
  star: {
    bgColor: '#FBBF24',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                 fill="white" stroke="white" stroke-width="2" stroke-linejoin="round"/>
      </svg>
    `,
  },
  target: {
    bgColor: '#10B981',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="12" r="6" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="12" r="2" stroke="white" stroke-width="2"/>
      </svg>
    `,
  },
  trophy: {
    bgColor: '#FBBF24',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 9a6 6 0 0 0 12 0" stroke="white" stroke-width="2"/>
        <path d="M12 15v6" stroke="white" stroke-width="2"/>
        <path d="M8 21h8" stroke="white" stroke-width="2"/>
      </svg>
    `,
  },

  // 操作图标
  plus: {
    bgColor: '#10B981',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="12" y1="5" x2="12" y2="19" stroke="white" stroke-width="2" stroke-linecap="round"/>
        <line x1="5" y1="12" x2="19" y2="12" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `,
  },
  edit: {
    bgColor: '#3B82F6',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
  },
  share: {
    bgColor: '#8B5CF6',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="5" r="3" stroke="white" stroke-width="2"/>
        <circle cx="6" cy="12" r="3" stroke="white" stroke-width="2"/>
        <circle cx="18" cy="19" r="3" stroke="white" stroke-width="2"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="white" stroke-width="2"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="white" stroke-width="2"/>
      </svg>
    `,
  },
  heart: {
    bgColor: '#EF4444',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              fill="white"/>
      </svg>
    `,
  },

  // 状态图标
  'check-circle': {
    bgColor: '#10B981',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="22,4 12,14.01 9,11.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
  },
  'x-circle': {
    bgColor: '#EF4444',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/>
        <line x1="15" y1="9" x2="9" y2="15" stroke="white" stroke-width="2" stroke-linecap="round"/>
        <line x1="9" y1="9" x2="15" y2="15" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `,
  },

  // 个人资料图标
  user: {
    bgColor: '#6B7280',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="7" r="4" stroke="white" stroke-width="2"/>
      </svg>
    `,
  },
  crown: {
    bgColor: '#FBBF24',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 18h20l-2-12-4 6-4-6-4 6-4-6-2 12z" stroke="white" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="7" cy="6" r="2" fill="white"/>
        <circle cx="12" cy="4" r="2" fill="white"/>
        <circle cx="17" cy="6" r="2" fill="white"/>
      </svg>
    `,
  },
  camera: {
    bgColor: '#8B5CF6',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="13" r="4" stroke="white" stroke-width="2"/>
      </svg>
    `,
  },

  // 个人资料专用图标
  calendar: {
    bgColor: '#F59E0B',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="white" stroke-width="2"/>
        <line x1="16" y1="2" x2="16" y2="6" stroke="white" stroke-width="2" stroke-linecap="round"/>
        <line x1="8" y1="2" x2="8" y2="6" stroke="white" stroke-width="2" stroke-linecap="round"/>
        <line x1="3" y1="10" x2="21" y2="10" stroke="white" stroke-width="2" stroke-linecap="round"/>
        <circle cx="8" cy="14" r="1" fill="white"/>
        <circle cx="12" cy="14" r="1" fill="white"/>
        <circle cx="16" cy="14" r="1" fill="white"/>
        <circle cx="8" cy="18" r="1" fill="white"/>
        <circle cx="12" cy="18" r="1" fill="white"/>
      </svg>
    `,
  },
  bell: {
    bgColor: '#FBBF24',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
  },
  sound: {
    bgColor: '#EC4899',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" stroke="white" stroke-width="2" stroke-linejoin="round"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
  },
  message: {
    bgColor: '#3B82F6',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="8" y1="9" x2="16" y2="9" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="8" y1="13" x2="14" y2="13" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `,
  },
  lock: {
    bgColor: '#6B7280',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="16" r="1" fill="white"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
  },
  blocked: {
    bgColor: '#EF4444',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/>
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `,
  },
  search: {
    bgColor: '#6B7280',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="8" stroke="white" stroke-width="2"/>
        <path d="m21 21-4.35-4.35" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
  },

  // 新增chat页面需要的图标
  'more-horizontal': {
    bgColor: 'transparent',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="1" fill="currentColor"/>
        <circle cx="19" cy="12" r="1" fill="currentColor"/>
        <circle cx="5" cy="12" r="1" fill="currentColor"/>
      </svg>
    `,
  },
  globe: {
    bgColor: 'transparent',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M2 12h20" stroke="currentColor" stroke-width="2"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" stroke-width="2"/>
      </svg>
    `,
  },
  mic: {
    bgColor: 'transparent',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `,
  },
  'plus-circle': {
    bgColor: 'transparent',
    svg: `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `,
  },
}

const CustomIcon: React.FC<CustomIconProps> = ({
  name,
  size = 48,
  color,
  style = {},
  className = '',
  onClick,
}) => {
  const iconData = customIcons[name]

  if (!iconData) {
    return (
      <View
        className={`custom-icon ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: '#f0f0f0',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
        onClick={onClick}
      >
        <View style={{ color: '#999', fontSize: '12px' }}>?</View>
      </View>
    )
  }

  // 如果背景色是transparent，则不显示背景和阴影
  const isTransparent = iconData.bgColor === 'transparent'

  return (
    <View
      className={`custom-icon ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: isTransparent ? 'transparent' : iconData.bgColor,
        borderRadius: isTransparent ? '0' : '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isTransparent ? '0' : '8px',
        boxShadow: isTransparent ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.15)',
        color: color || 'currentColor',
        ...style,
      }}
      onClick={onClick}
    >
      <View
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color || 'currentColor',
        }}
        dangerouslySetInnerHTML={{
          __html: iconData.svg.replace(
            /currentColor/g,
            color || 'currentColor'
          ),
        }}
      />
    </View>
  )
}

export default CustomIcon

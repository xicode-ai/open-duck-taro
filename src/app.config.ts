export default {
  pages: [
    'pages/index/index',
    'pages/translate/index',
    'pages/vocabulary/index',
    'pages/profile/index',
    'pages/chat/index',
    'pages/topics/index',
    'pages/topic-chat/index',
    'pages/translate-history/index',
    'pages/photo-story/index',
    'pages/photo-story-history/index',
    'pages/vocabulary-study/index',
    'pages/progress/index',
    'pages/membership/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#4A90E2',
    navigationBarTitleText: '开口鸭',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F5F7FA',
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#6366f1',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/icons/home.svg',
        selectedIconPath: 'assets/icons/home-active.svg',
      },
      {
        pagePath: 'pages/progress/index',
        text: '进度',
        iconPath: 'assets/icons/progress.svg',
        selectedIconPath: 'assets/icons/progress-active.svg',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/icons/profile.svg',
        selectedIconPath: 'assets/icons/profile-active.svg',
      },
    ],
  },
  permission: {
    'scope.record': {
      desc: '需要使用你的麦克风进行语音对话和发音练习',
    },
  },
}

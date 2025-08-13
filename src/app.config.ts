export default {
  pages: [
    'pages/index/index',
    'pages/chat/index',
    'pages/topics/index',
    'pages/topic-chat/index',
    'pages/translate/index',
    'pages/translate-history/index',
    'pages/photo-story/index',
    'pages/vocabulary/index',
    'pages/vocabulary-study/index',
    'pages/profile/index',
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
    selectedColor: '#4A90E2',
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
        pagePath: 'pages/translate/index',
        text: '翻译',
        iconPath: 'assets/icons/translate.svg',
        selectedIconPath: 'assets/icons/translate-active.svg',
      },
      {
        pagePath: 'pages/vocabulary/index',
        text: '单词',
        iconPath: 'assets/icons/vocabulary.svg',
        selectedIconPath: 'assets/icons/vocabulary-active.svg',
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

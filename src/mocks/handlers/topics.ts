import { http, HttpResponse, delay } from 'msw'
import type { TopicParams, LessonParams, TopicPracticeBody } from '../types'

// Mock自定义话题数据
let customTopics = [
  {
    id: 'custom-1',
    title: '游戏交流',
    description: '3个对话 · 已练习2次',
    icon: '🎮',
    conversations: 3,
    created: '2024-01-01',
    isCustom: true,
  },
  {
    id: 'custom-2',
    title: '音乐分享',
    description: '2个对话 · 已练习1次',
    icon: '🎵',
    conversations: 2,
    created: '2024-01-02',
    isCustom: true,
  },
]

// Mock学习进度数据
const topicProgress = [
  {
    topicId: '1',
    title: '咖啡话题',
    icon: '☕',
    completedDialogues: 8,
    totalDialogues: 15,
    progress: 53,
  },
  {
    topicId: '2',
    title: '旅游话题',
    icon: '✈️',
    completedDialogues: 12,
    totalDialogues: 20,
    progress: 60,
  },
  {
    topicId: '3',
    title: '健身话题',
    icon: '💪',
    completedDialogues: 5,
    totalDialogues: 12,
    progress: 42,
  },
  {
    topicId: '4',
    title: '餐厅话题',
    icon: '🍽️',
    completedDialogues: 14,
    totalDialogues: 18,
    progress: 78,
  },
  {
    topicId: '5',
    title: '购物话题',
    icon: '🛒',
    completedDialogues: 6,
    totalDialogues: 16,
    progress: 38,
  },
  {
    topicId: '6',
    title: '工作话题',
    icon: '💼',
    completedDialogues: 18,
    totalDialogues: 22,
    progress: 82,
  },
]

// Mock热门话题数据
const hotTopicsData = [
  {
    id: '1',
    title: '咖啡',
    description: '点咖啡、描述口味偏好',
    icon: '☕',
    background: '#FF6B35',
    category: 'daily',
    difficulty: 'easy',
    conversations: 15,
    progress: 53,
    isPopular: true,
  },
  {
    id: '2',
    title: '旅游',
    description: '机场、酒店、问路',
    icon: '✈️',
    background: '#4ECDC4',
    category: 'travel',
    difficulty: 'medium',
    conversations: 20,
    progress: 60,
    isPopular: true,
  },
  {
    id: '3',
    title: '健身',
    description: '健身房、运动计划',
    icon: '💪',
    background: '#45B7D1',
    category: 'health',
    difficulty: 'medium',
    conversations: 12,
    progress: 42,
  },
  {
    id: '4',
    title: '餐厅',
    description: '点餐、服务、买单',
    icon: '🍽️',
    background: '#F7931E',
    category: 'daily',
    difficulty: 'easy',
    conversations: 18,
    progress: 78,
  },
  {
    id: '5',
    title: '购物',
    description: '选择、试穿、砍价',
    icon: '🛒',
    background: '#C44569',
    category: 'shopping',
    difficulty: 'easy',
    conversations: 16,
    progress: 38,
  },
  {
    id: '6',
    title: '工作',
    description: '面试、会议、同事',
    icon: '💼',
    background: '#6C5CE7',
    category: 'work',
    difficulty: 'hard',
    conversations: 22,
    progress: 82,
  },
  {
    id: '7',
    title: '闲聊',
    description: '',
    icon: '💬',
    background: '#A8E6CF',
    category: 'daily',
    difficulty: 'medium',
    conversations: 8,
    progress: 0,
  },
  {
    id: '8',
    title: '电话',
    description: '',
    icon: '📞',
    background: '#74B9FF',
    category: 'daily',
    difficulty: 'medium',
    conversations: 6,
    progress: 0,
  },
]

// Mock话题对话数据
const topicDialogues = new Map([
  [
    '1', // 咖啡话题
    {
      id: '1',
      title: '咖啡话题',
      subtitle: '对话 3/8',
      scene: {
        location: '星巴克咖啡店',
        description: '你想要点一杯咖啡，向服务员询问推荐并描述你的口味偏好。',
      },
      currentDialogueIndex: 2, // 当前对话索引（从0开始）
      totalDialogues: 8,
      progress: 37,
      isFavorited: false,
      dialogues: [
        {
          id: 'dialogue-1',
          speaker: 'ai' as const,
          speakerName: '服务员',
          english: 'Good morning! What can I get for you today?',
          chinese: '早上好！今天我能为您做些什么？',
          audioUrl: '/mock-audio/dialogue-1.mp3',
          duration: 3,
        },
        {
          id: 'dialogue-2',
          speaker: 'user' as const,
          speakerName: '您',
          english: "I'd like a coffee, please. What do you recommend?",
          chinese: '我想要一杯咖啡，请问您推荐什么？',
          referenceAnswer: {
            show: false,
            text: "I'd like to have a coffee, please. What would you recommend for someone who likes medium roast?",
          },
          userRecording: null, // 用户录音数据
          completed: false,
        },
        {
          id: 'dialogue-3',
          speaker: 'ai' as const,
          speakerName: '服务员',
          english:
            'We have some excellent single-origin beans. Do you prefer something light and fruity or rich and chocolatey?',
          chinese:
            '我们有一些很棒的单品咖啡豆。您喜欢清淡果香型的还是浓郁巧克力味的？',
          audioUrl: '/mock-audio/dialogue-3.mp3',
          duration: 4,
        },
        {
          id: 'dialogue-4',
          speaker: 'user' as const,
          speakerName: '您',
          english:
            'I prefer something rich and chocolatey. What do you suggest?',
          chinese: '我喜欢浓郁巧克力味的。您有什么建议吗？',
          referenceAnswer: {
            show: false,
            text: 'I prefer something rich and chocolatey. What would you recommend for that taste profile?',
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-5',
          speaker: 'ai' as const,
          speakerName: '服务员',
          english:
            'Perfect! I recommend our Sumatra blend. It has deep chocolate notes with a hint of spice.',
          chinese:
            '太好了！我推荐我们的苏门答腊混合咖啡。它有浓郁的巧克力味，还带一点香料味。',
          audioUrl: '/mock-audio/dialogue-5.mp3',
          duration: 4,
        },
        {
          id: 'dialogue-6',
          speaker: 'user' as const,
          speakerName: '您',
          english: "That sounds great! I'll have a large cup, please.",
          chinese: '听起来很棒！我要一大杯。',
          referenceAnswer: {
            show: false,
            text: "That sounds perfect! I'll take a large cup, please. And could I have it with a little cream?",
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-7',
          speaker: 'ai' as const,
          speakerName: '服务员',
          english:
            'Excellent choice! Would you like any cream or sugar with that?',
          chinese: '很好的选择！您需要加奶油或糖吗？',
          audioUrl: '/mock-audio/dialogue-7.mp3',
          duration: 3,
        },
        {
          id: 'dialogue-8',
          speaker: 'user' as const,
          speakerName: '您',
          english: 'Just a little cream, please. Thank you!',
          chinese: '只要一点奶油就好。谢谢！',
          referenceAnswer: {
            show: false,
            text: 'Just a little cream, please. Thank you so much for the recommendation!',
          },
          userRecording: null,
          completed: false,
        },
      ],
    },
  ],
  [
    '2', // 旅游话题
    {
      id: '2',
      title: '旅游话题',
      subtitle: '对话 3/8',
      scene: {
        location: '机场信息台',
        description: '你在机场需要询问登机口信息和航班延误情况。',
      },
      currentDialogueIndex: 2,
      totalDialogues: 8,
      progress: 37,
      isFavorited: true,
      dialogues: [
        {
          id: 'dialogue-1',
          speaker: 'ai' as const,
          speakerName: '工作人员',
          english: 'Hello! How can I help you today?',
          chinese: '您好！今天我能为您做什么？',
          audioUrl: '/mock-audio/travel-1.mp3',
          duration: 2,
        },
        {
          id: 'dialogue-2',
          speaker: 'user' as const,
          speakerName: '您',
          english: "I'm looking for gate information for my flight to Tokyo.",
          chinese: '我想了解我飞往东京航班的登机口信息。',
          referenceAnswer: {
            show: false,
            text: 'Excuse me, could you help me find the gate for flight JL123 to Tokyo?',
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-3',
          speaker: 'ai' as const,
          speakerName: '工作人员',
          english: "Of course! What's your flight number?",
          chinese: '当然可以！您的航班号是多少？',
          audioUrl: '/mock-audio/travel-3.mp3',
          duration: 3,
        },
        {
          id: 'dialogue-4',
          speaker: 'user' as const,
          speakerName: '您',
          english: "It's JL123, departing at 2:30 PM.",
          chinese: '是JL123，下午2:30起飞。',
          referenceAnswer: {
            show: false,
            text: "My flight number is JL123, and it's scheduled to depart at 2:30 PM.",
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-5',
          speaker: 'ai' as const,
          speakerName: '工作人员',
          english:
            "Let me check that for you. Gate A12, but there's a 30-minute delay.",
          chinese: '让我为您查询一下。登机口是A12，但是延误30分钟。',
          audioUrl: '/mock-audio/travel-5.mp3',
          duration: 4,
        },
        {
          id: 'dialogue-6',
          speaker: 'user' as const,
          speakerName: '您',
          english: 'Thank you! Is there a lounge nearby where I can wait?',
          chinese: '谢谢！附近有休息室可以等待吗？',
          referenceAnswer: {
            show: false,
            text: 'Thank you for the information. Is there a lounge nearby where I can wait comfortably?',
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-7',
          speaker: 'ai' as const,
          speakerName: '工作人员',
          english:
            "Yes, there's a business lounge on the second floor. You can access it with your boarding pass.",
          chinese: '有的，二楼有商务休息室。您可以用登机牌进入。',
          audioUrl: '/mock-audio/travel-7.mp3',
          duration: 4,
        },
        {
          id: 'dialogue-8',
          speaker: 'user' as const,
          speakerName: '您',
          english: 'Perfect! Thank you for your help.',
          chinese: '太好了！谢谢您的帮助。',
          referenceAnswer: {
            show: false,
            text: 'Perfect! Thank you so much for your help. Have a great day!',
          },
          userRecording: null,
          completed: false,
        },
      ],
    },
  ],
  [
    '3', // 健身话题
    {
      id: '3',
      title: '健身话题',
      subtitle: '对话 3/8',
      scene: {
        location: '健身房',
        description: '你在健身房想要制定一个健身计划，向教练咨询建议。',
      },
      currentDialogueIndex: 2,
      totalDialogues: 8,
      progress: 37,
      isFavorited: false,
      dialogues: [
        {
          id: 'dialogue-1',
          speaker: 'ai' as const,
          speakerName: '健身教练',
          english: 'Hi there! Welcome to our gym. How can I help you today?',
          chinese: '你好！欢迎来到我们的健身房。今天我能为您做些什么？',
          audioUrl: '/mock-audio/fitness-1.mp3',
          duration: 3,
        },
        {
          id: 'dialogue-2',
          speaker: 'user' as const,
          speakerName: '您',
          english: "I'm new here and I'd like to start a workout routine.",
          chinese: '我是新来的，想要开始一个锻炼计划。',
          referenceAnswer: {
            show: false,
            text: "I'm new to this gym and I'd like to start a workout routine. Could you help me create a plan?",
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-3',
          speaker: 'ai' as const,
          speakerName: '健身教练',
          english:
            'Great! What are your fitness goals? Are you looking to lose weight, build muscle, or improve endurance?',
          chinese: '太好了！您的健身目标是什么？您是想减肥、增肌还是提高耐力？',
          audioUrl: '/mock-audio/fitness-3.mp3',
          duration: 4,
        },
        {
          id: 'dialogue-4',
          speaker: 'user' as const,
          speakerName: '您',
          english: 'I want to build muscle and get stronger.',
          chinese: '我想要增肌和变得更强壮。',
          referenceAnswer: {
            show: false,
            text: 'I want to build muscle and get stronger. I have some experience with basic exercises.',
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-5',
          speaker: 'ai' as const,
          speakerName: '健身教练',
          english:
            'Perfect! I recommend starting with compound exercises like squats, deadlifts, and bench press.',
          chinese: '完美！我建议从复合动作开始，比如深蹲、硬拉和卧推。',
          audioUrl: '/mock-audio/fitness-5.mp3',
          duration: 4,
        },
        {
          id: 'dialogue-6',
          speaker: 'user' as const,
          speakerName: '您',
          english: 'How often should I work out?',
          chinese: '我应该多久锻炼一次？',
          referenceAnswer: {
            show: false,
            text: 'How often should I work out? And how long should each session be?',
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-7',
          speaker: 'ai' as const,
          speakerName: '健身教练',
          english:
            'For beginners, I suggest 3-4 times per week, about 45-60 minutes each session.',
          chinese: '对于初学者，我建议每周3-4次，每次大约45-60分钟。',
          audioUrl: '/mock-audio/fitness-7.mp3',
          duration: 4,
        },
        {
          id: 'dialogue-8',
          speaker: 'user' as const,
          speakerName: '您',
          english: 'That sounds perfect! Can you show me the proper form?',
          chinese: '听起来很棒！您能教我正确的姿势吗？',
          referenceAnswer: {
            show: false,
            text: 'That sounds perfect! Can you show me the proper form for these exercises?',
          },
          userRecording: null,
          completed: false,
        },
      ],
    },
  ],
  [
    '4', // 餐厅话题
    {
      id: '4',
      title: '餐厅话题',
      subtitle: '对话 3/8',
      scene: {
        location: '意大利餐厅',
        description: '你在意大利餐厅用餐，需要点餐、询问菜品和结账。',
      },
      currentDialogueIndex: 2,
      totalDialogues: 8,
      progress: 37,
      isFavorited: false,
      dialogues: [
        {
          id: 'dialogue-1',
          speaker: 'ai' as const,
          speakerName: '服务员',
          english:
            'Good evening! Welcome to our restaurant. Do you have a reservation?',
          chinese: '晚上好！欢迎来到我们的餐厅。您有预订吗？',
          audioUrl: '/mock-audio/restaurant-1.mp3',
          duration: 3,
        },
        {
          id: 'dialogue-2',
          speaker: 'user' as const,
          speakerName: '您',
          english: 'Yes, I have a reservation under the name Smith.',
          chinese: '是的，我以Smith的名字预订了。',
          referenceAnswer: {
            show: false,
            text: 'Yes, I have a reservation under the name Smith for 7:30 PM.',
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-3',
          speaker: 'ai' as const,
          speakerName: '服务员',
          english:
            'Perfect! Right this way. Here are your menus. Can I get you something to drink first?',
          chinese: '完美！请跟我来。这是您的菜单。我可以先为您上些饮料吗？',
          audioUrl: '/mock-audio/restaurant-3.mp3',
          duration: 4,
        },
        {
          id: 'dialogue-4',
          speaker: 'user' as const,
          speakerName: '您',
          english: "I'll have a glass of red wine, please.",
          chinese: '我要一杯红酒，谢谢。',
          referenceAnswer: {
            show: false,
            text: "I'll have a glass of red wine, please. Do you have any recommendations?",
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-5',
          speaker: 'ai' as const,
          speakerName: '服务员',
          english:
            'Excellent choice! Our house red is very popular. Are you ready to order your meal?',
          chinese: '很好的选择！我们的招牌红酒很受欢迎。您准备好点餐了吗？',
          audioUrl: '/mock-audio/restaurant-5.mp3',
          duration: 4,
        },
        {
          id: 'dialogue-6',
          speaker: 'user' as const,
          speakerName: '您',
          english: "I'd like to try the lasagna. What does it come with?",
          chinese: '我想试试千层面。它配什么？',
          referenceAnswer: {
            show: false,
            text: "I'd like to try the lasagna. What does it come with? And is it spicy?",
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-7',
          speaker: 'ai' as const,
          speakerName: '服务员',
          english:
            "Our lasagna comes with a side salad and garlic bread. It's not spicy at all.",
          chinese: '我们的千层面配有一份沙拉和大蒜面包。一点也不辣。',
          audioUrl: '/mock-audio/restaurant-7.mp3',
          duration: 4,
        },
        {
          id: 'dialogue-8',
          speaker: 'user' as const,
          speakerName: '您',
          english: "Perfect! I'll have the lasagna then.",
          chinese: '完美！那我就要千层面了。',
          referenceAnswer: {
            show: false,
            text: "Perfect! I'll have the lasagna then. Thank you for the recommendation.",
          },
          userRecording: null,
          completed: false,
        },
      ],
    },
  ],
  [
    '5', // 购物话题
    {
      id: '5',
      title: '购物话题',
      subtitle: '对话 3/8',
      scene: {
        location: '服装店',
        description: '你在服装店购物，需要试穿衣服、询问价格和尺寸。',
      },
      currentDialogueIndex: 2,
      totalDialogues: 8,
      progress: 37,
      isFavorited: false,
      dialogues: [
        {
          id: 'dialogue-1',
          speaker: 'ai' as const,
          speakerName: '店员',
          english: 'Hello! Welcome to our store. How can I help you today?',
          chinese: '您好！欢迎来到我们的商店。今天我能为您做些什么？',
          audioUrl: '/mock-audio/shopping-1.mp3',
          duration: 3,
        },
        {
          id: 'dialogue-2',
          speaker: 'user' as const,
          speakerName: '您',
          english: "I'm looking for a nice dress for a party.",
          chinese: '我在找一件适合派对的漂亮裙子。',
          referenceAnswer: {
            show: false,
            text: "I'm looking for a nice dress for a party. Something elegant but not too formal.",
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-3',
          speaker: 'ai' as const,
          speakerName: '店员',
          english:
            'Great! What size are you looking for? We have some beautiful options in the back.',
          chinese: '太好了！您需要什么尺寸？我们在后面有一些很漂亮的款式。',
          audioUrl: '/mock-audio/shopping-3.mp3',
          duration: 4,
        },
        {
          id: 'dialogue-4',
          speaker: 'user' as const,
          speakerName: '您',
          english: 'I usually wear a medium. What colors do you have?',
          chinese: '我通常穿中号。你们有什么颜色？',
          referenceAnswer: {
            show: false,
            text: 'I usually wear a medium. What colors do you have available?',
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-5',
          speaker: 'ai' as const,
          speakerName: '店员',
          english:
            'We have black, navy blue, and a beautiful emerald green. Would you like to try them on?',
          chinese: '我们有黑色、海军蓝和漂亮的翠绿色。您想试穿一下吗？',
          audioUrl: '/mock-audio/shopping-5.mp3',
          duration: 4,
        },
        {
          id: 'dialogue-6',
          speaker: 'user' as const,
          speakerName: '您',
          english:
            "Yes, I'd like to try the emerald green one. Where are the fitting rooms?",
          chinese: '是的，我想试试翠绿色的。试衣间在哪里？',
          referenceAnswer: {
            show: false,
            text: "Yes, I'd like to try the emerald green one. Where are the fitting rooms?",
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-7',
          speaker: 'ai' as const,
          speakerName: '店员',
          english:
            "The fitting rooms are right over there. I'll get the dress for you in medium.",
          chinese: '试衣间就在那边。我去给您拿中号的裙子。',
          audioUrl: '/mock-audio/shopping-7.mp3',
          duration: 4,
        },
        {
          id: 'dialogue-8',
          speaker: 'user' as const,
          speakerName: '您',
          english: 'Thank you! How much does it cost?',
          chinese: '谢谢！这件多少钱？',
          referenceAnswer: {
            show: false,
            text: 'Thank you! How much does it cost? And do you have any sales or discounts?',
          },
          userRecording: null,
          completed: false,
        },
      ],
    },
  ],
  [
    '6', // 工作话题
    {
      id: '6',
      title: '工作话题',
      subtitle: '对话 3/8',
      scene: {
        location: '办公室',
        description: '你在办公室与同事讨论项目进展和会议安排。',
      },
      currentDialogueIndex: 2,
      totalDialogues: 8,
      progress: 37,
      isFavorited: false,
      dialogues: [
        {
          id: 'dialogue-1',
          speaker: 'ai' as const,
          speakerName: '同事',
          english: "Good morning! How's the project going?",
          chinese: '早上好！项目进展如何？',
          audioUrl: '/mock-audio/work-1.mp3',
          duration: 3,
        },
        {
          id: 'dialogue-2',
          speaker: 'user' as const,
          speakerName: '您',
          english: "It's going well, but we're running a bit behind schedule.",
          chinese: '进展不错，但我们有点落后于计划。',
          referenceAnswer: {
            show: false,
            text: "It's going well, but we're running a bit behind schedule. We need to catch up this week.",
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-3',
          speaker: 'ai' as const,
          speakerName: '同事',
          english:
            "I see. What's causing the delay? Is there anything I can help with?",
          chinese: '我明白了。是什么原因导致的延误？有什么我能帮忙的吗？',
          audioUrl: '/mock-audio/work-3.mp3',
          duration: 4,
        },
        {
          id: 'dialogue-4',
          speaker: 'user' as const,
          speakerName: '您',
          english:
            'The client keeps changing requirements. Could you help me prepare for the meeting?',
          chinese: '客户一直在改变需求。您能帮我准备会议吗？',
          referenceAnswer: {
            show: false,
            text: 'The client keeps changing requirements. Could you help me prepare for the meeting tomorrow?',
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-5',
          speaker: 'ai' as const,
          speakerName: '同事',
          english:
            'Of course! What time is the meeting? I can review the presentation with you.',
          chinese: '当然可以！会议是什么时候？我可以和您一起检查演示文稿。',
          audioUrl: '/mock-audio/work-5.mp3',
          duration: 4,
        },
        {
          id: 'dialogue-6',
          speaker: 'user' as const,
          speakerName: '您',
          english: "It's at 2 PM. Let's meet in the conference room at 1:30.",
          chinese: '下午2点。我们1:30在会议室见面。',
          referenceAnswer: {
            show: false,
            text: "It's at 2 PM. Let's meet in the conference room at 1:30 to go over everything.",
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-7',
          speaker: 'ai' as const,
          speakerName: '同事',
          english:
            "Perfect! I'll bring my laptop and we can make any last-minute changes.",
          chinese: '完美！我会带上我的笔记本电脑，我们可以做任何最后的修改。',
          audioUrl: '/mock-audio/work-7.mp3',
          duration: 4,
        },
        {
          id: 'dialogue-8',
          speaker: 'user' as const,
          speakerName: '您',
          english: 'Great! Thanks for your help. I really appreciate it.',
          chinese: '太好了！谢谢您的帮助。我真的很感激。',
          referenceAnswer: {
            show: false,
            text: 'Great! Thanks for your help. I really appreciate it. This will make a big difference.',
          },
          userRecording: null,
          completed: false,
        },
      ],
    },
  ],
  [
    '7', // 闲聊话题
    {
      id: '7',
      title: '闲聊话题',
      subtitle: '对话 3/8',
      scene: {
        location: '咖啡厅',
        description: '你在咖啡厅与朋友闲聊，讨论周末计划和兴趣爱好。',
      },
      currentDialogueIndex: 2,
      totalDialogues: 8,
      progress: 37,
      isFavorited: false,
      dialogues: [
        {
          id: 'dialogue-1',
          speaker: 'ai' as const,
          speakerName: '朋友',
          english: 'Hey! How was your week?',
          chinese: '嘿！你这周过得怎么样？',
          audioUrl: '/mock-audio/chat-1.mp3',
          duration: 2,
        },
        {
          id: 'dialogue-2',
          speaker: 'user' as const,
          speakerName: '您',
          english: 'It was pretty busy, but good overall. How about you?',
          chinese: '很忙，但总体不错。你呢？',
          referenceAnswer: {
            show: false,
            text: 'It was pretty busy, but good overall. How about you? Did you do anything interesting?',
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-3',
          speaker: 'ai' as const,
          speakerName: '朋友',
          english:
            'Same here! I went to that new restaurant downtown. The food was amazing!',
          chinese: '我也是！我去了市中心那家新餐厅。食物很棒！',
          audioUrl: '/mock-audio/chat-3.mp3',
          duration: 4,
        },
        {
          id: 'dialogue-4',
          speaker: 'user' as const,
          speakerName: '您',
          english: 'Really? What kind of food do they serve?',
          chinese: '真的吗？他们提供什么类型的食物？',
          referenceAnswer: {
            show: false,
            text: "Really? What kind of food do they serve? I'm always looking for new places to try.",
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-5',
          speaker: 'ai' as const,
          speakerName: '朋友',
          english:
            "It's Italian cuisine. Their pasta is incredible! You should definitely try it.",
          chinese: '是意大利菜。他们的意大利面很棒！你绝对应该试试。',
          audioUrl: '/mock-audio/chat-5.mp3',
          duration: 4,
        },
        {
          id: 'dialogue-6',
          speaker: 'user' as const,
          speakerName: '您',
          english: 'That sounds delicious! What are you doing this weekend?',
          chinese: '听起来很美味！你这个周末做什么？',
          referenceAnswer: {
            show: false,
            text: 'That sounds delicious! What are you doing this weekend? Maybe we could go together.',
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-7',
          speaker: 'ai' as const,
          speakerName: '朋友',
          english:
            "I'm planning to go hiking. The weather is supposed to be perfect!",
          chinese: '我计划去徒步旅行。天气应该会很完美！',
          audioUrl: '/mock-audio/chat-7.mp3',
          duration: 4,
        },
        {
          id: 'dialogue-8',
          speaker: 'user' as const,
          speakerName: '您',
          english: 'That sounds like fun! I love hiking too.',
          chinese: '听起来很有趣！我也喜欢徒步旅行。',
          referenceAnswer: {
            show: false,
            text: 'That sounds like fun! I love hiking too. Which trail are you planning to take?',
          },
          userRecording: null,
          completed: false,
        },
      ],
    },
  ],
  [
    '8', // 电话话题
    {
      id: '8',
      title: '电话话题',
      subtitle: '对话 3/8',
      scene: {
        location: '电话中',
        description: '你正在打电话给客户服务，询问账单问题和账户信息。',
      },
      currentDialogueIndex: 2,
      totalDialogues: 8,
      progress: 37,
      isFavorited: false,
      dialogues: [
        {
          id: 'dialogue-1',
          speaker: 'ai' as const,
          speakerName: '客服代表',
          english:
            'Good morning! Thank you for calling. How can I assist you today?',
          chinese: '早上好！感谢您的来电。今天我能为您做些什么？',
          audioUrl: '/mock-audio/phone-1.mp3',
          duration: 3,
        },
        {
          id: 'dialogue-2',
          speaker: 'user' as const,
          speakerName: '您',
          english:
            "Hi, I'm calling about my recent bill. There seems to be an error.",
          chinese: '你好，我打电话是关于我最近的账单。似乎有错误。',
          referenceAnswer: {
            show: false,
            text: "Hi, I'm calling about my recent bill. There seems to be an error in the charges.",
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-3',
          speaker: 'ai' as const,
          speakerName: '客服代表',
          english:
            "I'd be happy to help you with that. Can I have your account number, please?",
          chinese: '我很乐意帮助您解决这个问题。请提供您的账户号码好吗？',
          audioUrl: '/mock-audio/phone-3.mp3',
          duration: 4,
        },
        {
          id: 'dialogue-4',
          speaker: 'user' as const,
          speakerName: '您',
          english: "Sure, it's 123456789.",
          chinese: '当然，是123456789。',
          referenceAnswer: {
            show: false,
            text: "Sure, it's 123456789. My name is John Smith.",
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-5',
          speaker: 'ai' as const,
          speakerName: '客服代表',
          english:
            'Thank you. I can see your account. What specific charge are you questioning?',
          chinese: '谢谢。我可以看到您的账户。您对哪项具体收费有疑问？',
          audioUrl: '/mock-audio/phone-5.mp3',
          duration: 4,
        },
        {
          id: 'dialogue-6',
          speaker: 'user' as const,
          speakerName: '您',
          english:
            "There's a $50 charge for premium service that I didn't sign up for.",
          chinese: '有一项50美元的高级服务费用，但我没有注册过。',
          referenceAnswer: {
            show: false,
            text: "There's a $50 charge for premium service that I didn't sign up for. I want to dispute this charge.",
          },
          userRecording: null,
          completed: false,
        },
        {
          id: 'dialogue-7',
          speaker: 'ai' as const,
          speakerName: '客服代表',
          english:
            'I understand your concern. Let me check your account history and remove that charge.',
          chinese: '我理解您的担忧。让我检查您的账户历史记录并移除那项费用。',
          audioUrl: '/mock-audio/phone-7.mp3',
          duration: 4,
        },
        {
          id: 'dialogue-8',
          speaker: 'user' as const,
          speakerName: '您',
          english: "Thank you so much! That's exactly what I needed.",
          chinese: '非常感谢！这正是我需要的。',
          referenceAnswer: {
            show: false,
            text: "Thank you so much! That's exactly what I needed. I really appreciate your help.",
          },
          userRecording: null,
          completed: false,
        },
      ],
    },
  ],
])

// Mock收藏话题数据
let favoritedTopics = new Set(['2'])

// Mock语音评分数据
const generateVoiceScore = () => ({
  overallScore: Math.floor(Math.random() * 15) + 80, // 80-95分
  pronunciation: Math.floor(Math.random() * 20) + 75, // 75-95%
  fluency: Math.floor(Math.random() * 25) + 70, // 70-95%
  naturalness: Math.floor(Math.random() * 30) + 65, // 65-95%
  stars: Math.floor((Math.random() * 15 + 80) / 20) + 1, // 1-5星，基于总分
})

export const topicsHandlers = [
  // 获取热门话题列表
  http.get('/api/topics/hot', async ({ request }) => {
    await delay(500)
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const difficulty = url.searchParams.get('difficulty')

    let filteredTopics = [...hotTopicsData]

    if (category) {
      filteredTopics = filteredTopics.filter(t => t.category === category)
    }

    if (difficulty) {
      filteredTopics = filteredTopics.filter(t => t.difficulty === difficulty)
    }

    return HttpResponse.json({
      code: 200,
      data: filteredTopics,
      message: 'success',
    })
  }),

  // 获取自定义话题列表
  http.get('/api/topics/custom', async () => {
    await delay(300)

    return HttpResponse.json({
      code: 200,
      data: customTopics,
      message: 'success',
    })
  }),

  // 创建自定义话题
  http.post('/api/topics/custom', async ({ request }) => {
    await delay(400)
    const body = (await request.json()) as {
      title: string
      description?: string
      icon: string
    }

    if (!body) {
      return HttpResponse.json(
        { code: 400, message: '参数不能为空' },
        { status: 400 }
      )
    }

    const newTopic = {
      id: `custom-${Date.now()}`,
      title: body.title,
      description: body.description || `0个对话 · 未练习`,
      icon: body.icon,
      conversations: 0,
      created: new Date().toISOString().split('T')[0],
      isCustom: true,
    }

    customTopics.push(newTopic)

    return HttpResponse.json({
      code: 200,
      data: newTopic,
      message: '创建成功',
    })
  }),

  // 更新自定义话题
  http.put('/api/topics/custom/:topicId', async ({ params, request }) => {
    await delay(300)
    const body = (await request.json()) as {
      title: string
      icon: string
    }
    const topicIndex = customTopics.findIndex(t => t.id === params.topicId)

    if (topicIndex === -1) {
      return HttpResponse.json(
        { code: 404, message: '话题不存在' },
        { status: 404 }
      )
    }

    if (!body) {
      return HttpResponse.json(
        { code: 400, message: '参数不能为空' },
        { status: 400 }
      )
    }

    customTopics[topicIndex] = {
      ...customTopics[topicIndex],
      title: body.title,
      icon: body.icon,
    }

    return HttpResponse.json({
      code: 200,
      data: customTopics[topicIndex],
      message: '更新成功',
    })
  }),

  // 删除自定义话题
  http.delete('/api/topics/custom/:topicId', async ({ params }) => {
    await delay(300)
    const topicIndex = customTopics.findIndex(t => t.id === params.topicId)

    if (topicIndex === -1) {
      return HttpResponse.json(
        { code: 404, message: '话题不存在' },
        { status: 404 }
      )
    }

    customTopics.splice(topicIndex, 1)

    return HttpResponse.json({
      code: 200,
      message: '删除成功',
    })
  }),

  // 获取学习进度
  http.get('/api/topics/progress', async () => {
    await delay(400)

    return HttpResponse.json({
      code: 200,
      data: topicProgress,
      message: 'success',
    })
  }),

  // 获取话题列表（兼容旧接口）
  http.get('/api/topics', async ({ request }) => {
    await delay(500)
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const difficulty = url.searchParams.get('difficulty')

    let filteredTopics = [...hotTopicsData]

    if (category) {
      filteredTopics = filteredTopics.filter(t => t.category === category)
    }

    if (difficulty) {
      filteredTopics = filteredTopics.filter(t => t.difficulty === difficulty)
    }

    return HttpResponse.json({
      code: 200,
      data: filteredTopics,
      message: 'success',
    })
  }),

  // 获取话题详情
  http.get<TopicParams>('/api/topics/:topicId', async ({ params }) => {
    await delay(400)
    const topic = [...hotTopicsData, ...customTopics].find(
      t => t.id === params.topicId
    )

    if (!topic) {
      return HttpResponse.json(
        { code: 404, message: '话题不存在' },
        { status: 404 }
      )
    }

    // 获取相关话题（只从hotTopicsData中获取，因为customTopics没有category）
    const topicCategory = 'category' in topic ? topic.category : 'daily'
    const relatedTopics = hotTopicsData
      .filter(t => t.id !== topic.id && t.category === topicCategory)
      .slice(0, 3)

    // 添加更多详细内容
    const detailedTopic = {
      ...topic,
      introduction:
        'This topic will help you master essential English for this situation.',
      objectives: [
        'Learn key vocabulary and phrases',
        'Practice real-world conversations',
        'Improve pronunciation and fluency',
      ],
      resources: [
        {
          type: 'video',
          title: 'Introduction Video',
          url: '/mock-video/intro.mp4',
        },
        {
          type: 'audio',
          title: 'Pronunciation Guide',
          url: '/mock-audio/guide.mp3',
        },
        { type: 'pdf', title: 'Study Notes', url: '/mock-pdf/notes.pdf' },
      ],
      relatedTopics,
    }

    return HttpResponse.json({
      code: 200,
      data: detailedTopic,
      message: 'success',
    })
  }),

  // 开始学习话题
  http.post<TopicParams>('/api/topics/:topicId/start', async ({ params }) => {
    await delay(300)

    return HttpResponse.json({
      code: 200,
      data: {
        topicId: params.topicId,
        sessionId: `session-${Date.now()}`,
        startTime: new Date().toISOString(),
      },
      message: '开始学习',
    })
  }),

  // 完成课程
  http.post<LessonParams>(
    '/api/topics/:topicId/lessons/:lessonId/complete',
    async ({ params }) => {
      await delay(400)

      return HttpResponse.json({
        code: 200,
        data: {
          topicId: params.topicId,
          lessonId: params.lessonId,
          completed: true,
          pointsEarned: 20,
          nextLesson:
            'lesson-00' +
            (parseInt((params.lessonId as string).split('-')[1]) + 1),
        },
        message: '课程已完成',
      })
    }
  ),

  // 获取话题对话练习
  http.get<TopicParams>(
    '/api/topics/:topicId/conversations',
    async ({ params: _params }) => {
      await delay(500)

      const conversations = [
        {
          id: 'conv-001',
          scenario: 'Meeting someone new',
          difficulty: 'beginner',
          turns: [
            { speaker: 'A', text: 'Hi, nice to meet you!' },
            { speaker: 'B', text: "Nice to meet you too! What's your name?" },
            { speaker: 'A', text: "I'm Alex. How about you?" },
            { speaker: 'B', text: "I'm Emma. Where are you from?" },
          ],
          practicePoints: [
            'Greeting phrases',
            'Introducing yourself',
            'Asking about others',
          ],
        },
        {
          id: 'conv-002',
          scenario: 'Talking about hobbies',
          difficulty: 'intermediate',
          turns: [
            { speaker: 'A', text: 'What do you like to do in your free time?' },
            {
              speaker: 'B',
              text: 'I enjoy reading and hiking. How about you?',
            },
            { speaker: 'A', text: 'I love playing guitar and cooking.' },
            {
              speaker: 'B',
              text: 'That sounds interesting! How long have you been playing guitar?',
            },
          ],
          practicePoints: [
            'Discussing hobbies',
            'Expressing interests',
            'Follow-up questions',
          ],
        },
      ]

      return HttpResponse.json({
        code: 200,
        data: conversations,
        message: 'success',
      })
    }
  ),

  // 提交话题练习
  http.post<TopicParams>(
    '/api/topics/:topicId/practice',
    async ({ params, request }) => {
      await delay(600)
      const _body = (await request.json()) as TopicPracticeBody

      // 模拟AI评分
      const evaluation = {
        score: Math.floor(Math.random() * 20) + 80,
        feedback: {
          pronunciation: Math.floor(Math.random() * 20) + 80,
          fluency: Math.floor(Math.random() * 20) + 75,
          grammar: Math.floor(Math.random() * 20) + 85,
          vocabulary: Math.floor(Math.random() * 20) + 80,
        },
        suggestions: [
          'Good use of vocabulary!',
          'Try to speak more naturally',
          'Pay attention to the past tense',
        ],
        corrections: [
          {
            original: 'I go there yesterday',
            corrected: 'I went there yesterday',
          },
        ],
      }

      return HttpResponse.json({
        code: 200,
        data: {
          topicId: params.topicId,
          practiceId: `practice-${Date.now()}`,
          evaluation,
          pointsEarned: Math.floor(evaluation.score / 10),
        },
        message: '练习已提交',
      })
    }
  ),

  // 获取推荐话题
  http.get('/api/topics/recommendations', async () => {
    await delay(400)

    const recommendations = hotTopicsData
      .filter(t => t.progress < 100)
      .sort((a, b) => (a.progress || 0) - (b.progress || 0))
      .slice(0, 3)
      .map(t => ({
        ...t,
        reason: (t.progress || 0) > 0 ? '继续学习' : '新话题',
        estimatedTime: '15-20分钟',
      }))

    return HttpResponse.json({
      code: 200,
      data: recommendations,
      message: 'success',
    })
  }),

  // 获取话题分类
  http.get('/api/topics/categories', async () => {
    await delay(300)

    const categories = [
      { id: 'daily', name: '日常对话', icon: '💬', count: 15 },
      { id: 'business', name: '商务职场', icon: '💼', count: 10 },
      { id: 'lifestyle', name: '生活方式', icon: '🌟', count: 12 },
      { id: 'culture', name: '文化交流', icon: '🌍', count: 8 },
      { id: 'education', name: '教育学习', icon: '📚', count: 7 },
      { id: 'technology', name: '科技创新', icon: '💻', count: 6 },
    ]

    return HttpResponse.json({
      code: 200,
      data: categories,
      message: 'success',
    })
  }),

  // 获取话题对话详情
  http.get<TopicParams>('/api/topics/:topicId/dialogue', async ({ params }) => {
    await delay(600)
    const topicDialogue = topicDialogues.get(params.topicId)

    if (!topicDialogue) {
      return HttpResponse.json(
        { code: 404, message: '话题不存在' },
        { status: 404 }
      )
    }

    // 更新收藏状态
    topicDialogue.isFavorited = favoritedTopics.has(params.topicId)

    return HttpResponse.json({
      code: 200,
      data: topicDialogue,
      message: 'success',
    })
  }),

  // 录音跟读API
  http.post<TopicParams>(
    '/api/topics/:topicId/record',
    async ({ params, request }) => {
      await delay(2000) // 模拟录音处理时间
      const body = (await request.json()) as {
        dialogueId: string
        audioBlob?: string
        duration?: number
      }

      const topicDialogue = topicDialogues.get(params.topicId)
      if (!topicDialogue) {
        return HttpResponse.json(
          { code: 404, message: '话题不存在' },
          { status: 404 }
        )
      }

      // 模拟语音转文字
      const mockTranscriptions = [
        "I'd like a coffee please. What do you recommend?",
        'I want to have a coffee. Can you suggest something?',
        'Could I get a coffee? What would you recommend?',
        "I'd like to order a coffee. What's your recommendation?",
      ]

      const transcription =
        mockTranscriptions[
          Math.floor(Math.random() * mockTranscriptions.length)
        ]
      const voiceScore = generateVoiceScore()

      // 更新用户录音数据
      const dialogue = topicDialogue.dialogues.find(
        d => d.id === body.dialogueId
      )
      if (dialogue && dialogue.speaker === 'user') {
        const userDialogue = dialogue as import('../../types').UserDialogue
        userDialogue.userRecording = {
          audioUrl: '/mock-audio/user-recording.mp3',
          duration: body.duration || 3,
          transcription,
          translation: '我想要一杯咖啡，请问您推荐什么？', // 添加翻译
          score: voiceScore,
        }
        userDialogue.completed = true

        // 生成AI回复（系统回复）
        const nextDialogueIndex =
          topicDialogue.dialogues.findIndex(d => d.id === body.dialogueId) + 1
        if (nextDialogueIndex < topicDialogue.dialogues.length) {
          const nextDialogue = topicDialogue.dialogues[nextDialogueIndex]
          if (nextDialogue && nextDialogue.speaker === 'ai') {
            // AI回复已经存在，不需要额外生成
            console.log('AI回复已存在:', nextDialogue.english)
          }
        }
      }

      return HttpResponse.json({
        code: 200,
        data: {
          transcription,
          translation: '我想要一杯咖啡，请问您推荐什么？',
          score: voiceScore,
          feedback: {
            strengths: ['发音清晰', '语调自然'],
            improvements: ['可以说得更流利一些', '注意语音的连读'],
          },
        },
        message: '录音完成',
      })
    }
  ),

  // 切换话题收藏状态
  http.post<TopicParams>(
    '/api/topics/:topicId/favorite',
    async ({ params }) => {
      await delay(300)

      if (favoritedTopics.has(params.topicId)) {
        favoritedTopics.delete(params.topicId)
      } else {
        favoritedTopics.add(params.topicId)
      }

      const isFavorited = favoritedTopics.has(params.topicId)

      return HttpResponse.json({
        code: 200,
        data: {
          topicId: params.topicId,
          isFavorited,
        },
        message: isFavorited ? '已收藏' : '已取消收藏',
      })
    }
  ),

  // 重新练习（重置对话状态）
  http.post<TopicParams>('/api/topics/:topicId/reset', async ({ params }) => {
    await delay(400)

    const topicDialogue = topicDialogues.get(params.topicId)
    if (!topicDialogue) {
      return HttpResponse.json(
        { code: 404, message: '话题不存在' },
        { status: 404 }
      )
    }

    // 只重置用户录音数据，保留参考答案显示状态和用户模块
    topicDialogue.dialogues.forEach(dialogue => {
      if (dialogue.speaker === 'user') {
        const userDialogue = dialogue as import('../../types').UserDialogue
        // 只清空录音数据，保留其他状态
        userDialogue.userRecording = null
        userDialogue.completed = false
        // 保留参考答案的显示状态，不重置为false
        // if (userDialogue.referenceAnswer) {
        //   userDialogue.referenceAnswer.show = false
        // }
      }
    })

    // 不重置currentDialogueIndex和progress，让用户可以继续在当前位置练习
    // topicDialogue.currentDialogueIndex = 0
    // topicDialogue.progress = 0

    return HttpResponse.json({
      code: 200,
      data: topicDialogue,
      message: '已重置录音，可继续练习',
    })
  }),

  // 获取系统回答（录音完成后调用）
  http.post<TopicParams>(
    '/api/topics/:topicId/system-response',
    async ({ params, request }) => {
      await delay(1500) // 模拟系统思考时间

      const body = (await request.json()) as {
        currentDialogueId: string
      }

      const topicDialogue = topicDialogues.get(params.topicId)
      if (!topicDialogue) {
        return HttpResponse.json(
          { code: 404, message: '话题不存在' },
          { status: 404 }
        )
      }

      // 找到当前对话的索引
      const currentDialogueIndex = topicDialogue.dialogues.findIndex(
        d => d.id === body.currentDialogueId
      )

      if (currentDialogueIndex === -1) {
        return HttpResponse.json(
          { code: 404, message: '对话不存在' },
          { status: 404 }
        )
      }

      // 寻找下一个AI对话
      let nextAIDialogue = null
      for (
        let i = currentDialogueIndex + 1;
        i < topicDialogue.dialogues.length;
        i++
      ) {
        if (topicDialogue.dialogues[i].speaker === 'ai') {
          nextAIDialogue = topicDialogue.dialogues[i]
          break
        }
      }

      if (!nextAIDialogue) {
        return HttpResponse.json({
          code: 200,
          data: {
            hasResponse: false,
            message: '对话已完成',
          },
          message: 'success',
        })
      }

      return HttpResponse.json({
        code: 200,
        data: {
          hasResponse: true,
          aiResponse: {
            id: nextAIDialogue.id,
            english: nextAIDialogue.english,
            chinese: nextAIDialogue.chinese,
            speakerName: nextAIDialogue.speakerName,
            audioUrl: nextAIDialogue.audioUrl,
            duration: nextAIDialogue.duration,
          },
        },
        message: '系统回答生成成功',
      })
    }
  ),

  // 下一个对话
  http.post<TopicParams>(
    '/api/topics/:topicId/next-dialogue',
    async ({ params }) => {
      await delay(300)

      const topicDialogue = topicDialogues.get(params.topicId)
      if (!topicDialogue) {
        return HttpResponse.json(
          { code: 404, message: '话题不存在' },
          { status: 404 }
        )
      }

      // 更新当前对话索引和进度
      if (
        topicDialogue.currentDialogueIndex <
        topicDialogue.totalDialogues - 1
      ) {
        topicDialogue.currentDialogueIndex += 1
        topicDialogue.progress = Math.round(
          ((topicDialogue.currentDialogueIndex + 1) /
            topicDialogue.totalDialogues) *
            100
        )
      }

      return HttpResponse.json({
        code: 200,
        data: {
          currentIndex: topicDialogue.currentDialogueIndex,
          progress: topicDialogue.progress,
          isCompleted:
            topicDialogue.currentDialogueIndex >=
            topicDialogue.totalDialogues - 1,
        },
        message: 'success',
      })
    }
  ),

  // 显示/隐藏参考答案
  http.post<TopicParams>(
    '/api/topics/:topicId/toggle-reference',
    async ({ params, request }) => {
      await delay(200)
      const body = (await request.json()) as { dialogueId: string }

      const topicDialogue = topicDialogues.get(params.topicId)
      if (!topicDialogue) {
        return HttpResponse.json(
          { code: 404, message: '话题不存在' },
          { status: 404 }
        )
      }

      const dialogue = topicDialogue.dialogues.find(
        d => d.id === body.dialogueId
      )
      if (dialogue && dialogue.speaker === 'user') {
        const userDialogue = dialogue as import('../../types').UserDialogue
        if (userDialogue.referenceAnswer) {
          userDialogue.referenceAnswer.show = !userDialogue.referenceAnswer.show
        }
      }

      return HttpResponse.json({
        code: 200,
        data: {
          dialogueId: body.dialogueId,
          showReference: dialogue?.referenceAnswer?.show || false,
        },
        message: 'success',
      })
    }
  ),
]

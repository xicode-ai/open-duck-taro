// auth.js - 全局用户认证和权限管理

// 默认用户状态
const defaultUserState = {
  isMember: false,
  membershipExpiry: null,
  dailyUsage: {
    date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    help: 0,
    translate: 0,
    photo: 0,
  },
}

// 从localStorage获取用户状态，如果不存在则使用默认值
function getUserState() {
  let userState = JSON.parse(localStorage.getItem('userState'))
  if (!userState) {
    userState = defaultUserState
    saveUserState(userState)
  }
  // 检查每日使用次数是否需要重置
  const today = new Date().toISOString().slice(0, 10)
  if (userState.dailyUsage.date !== today) {
    userState.dailyUsage = defaultUserState.dailyUsage
    saveUserState(userState)
  }
  return userState
}

// 保存用户状态到localStorage
function saveUserState(state) {
  localStorage.setItem('userState', JSON.stringify(state))
}

// 检查是否是会员
function isMember() {
  const userState = getUserState()
  if (userState.isMember) {
    // 可以在这里添加会员到期检查
    // const expiry = new Date(userState.membershipExpiry);
    // return expiry > new Date();
    return true
  }
  return false
}

// 检查并增加使用次数
function checkUsage(featureType) {
  if (isMember()) {
    return { canUse: true, remaining: Infinity }
  }

  const userState = getUserState()
  const limits = {
    help: 3,
    translate: 3,
    photo: 3,
  }

  const currentUsage = userState.dailyUsage[featureType] || 0
  const limit = limits[featureType]

  if (currentUsage < limit) {
    return { canUse: true, remaining: limit - currentUsage }
  } else {
    return { canUse: false, remaining: 0 }
  }
}

// 增加使用次数
function incrementUsage(featureType) {
  if (isMember()) return // 会员不增加次数

  const userState = getUserState()
  userState.dailyUsage[featureType] = (userState.dailyUsage[featureType] || 0) + 1
  saveUserState(userState)
}

// 显示开通会员提示
function showMembershipPrompt(message) {
  const confirmed = confirm(message + '\n\n是否立即开通会员，解锁无限次使用权限？')
  if (confirmed) {
    // 在实际应用中，这里会跳转到开通会员页面
    // window.location.href = 'membership.html';
    alert('正在跳转到开通会员页面...')
  }
}

// 模拟开通会员
function becomeMember() {
  let userState = getUserState()
  userState.isMember = true
  const expiryDate = new Date()
  expiryDate.setFullYear(expiryDate.getFullYear() + 1)
  userState.membershipExpiry = expiryDate.toISOString().slice(0, 10)
  saveUserState(userState)
  alert('恭喜您已成为会员！所有功能已解锁。')
  // 在实际应用中，可能需要刷新页面或更新UI
  window.location.reload()
}

// 模拟重置状态（用于测试）
function resetUser() {
  localStorage.removeItem('userState')
  alert('用户状态已重置为非会员。')
  window.location.reload()
}

// 添加全局测试按钮（开发调试用）
function addGlobalTestButtons() {
  if (window.location.search.includes('debug=true')) {
    const testDiv = document.createElement('div')
    testDiv.className = 'fixed bottom-4 right-4 space-x-2 z-50'
    testDiv.innerHTML = `
            <button onclick="becomeMember()" class="bg-green-500 text-white px-3 py-2 rounded text-xs shadow-lg">成为会员</button>
            <button onclick="resetUser()" class="bg-red-500 text-white px-3 py-2 rounded text-xs shadow-lg">重置状态</button>
            <button onclick="showUsageStats()" class="bg-blue-500 text-white px-3 py-2 rounded text-xs shadow-lg">查看统计</button>
        `
    document.body.appendChild(testDiv)
  }
}

// 显示使用统计
function showUsageStats() {
  const userState = getUserState()
  const stats = `
用户状态: ${userState.isMember ? '会员' : '普通用户'}
${userState.isMember ? `会员到期: ${userState.membershipExpiry}` : ''}

今日使用情况:
• 求助: ${userState.dailyUsage.help || 0}/3
• 地道翻译: ${userState.dailyUsage.translate || 0}/3
• 拍照短文: ${userState.dailyUsage.photo || 0}/3

${userState.isMember ? '🎉 会员享受无限次使用！' : '💡 开通会员解锁无限次使用'}
    `
  alert(stats)
}

// 页面加载时自动添加测试按钮
document.addEventListener('DOMContentLoaded', () => {
  addGlobalTestButtons()
})

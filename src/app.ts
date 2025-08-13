import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import './app.scss'

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    // 开口鸭应用启动
  })

  // children 就是要渲染的页面
  return children
}

export default App

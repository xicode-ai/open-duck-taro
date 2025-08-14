import React from 'react'
import { PropsWithChildren } from 'react'
import './app.scss'

function App({ children }: PropsWithChildren) {
  React.useEffect(() => {
    // 开口鸭应用启动
    console.log('开口鸭应用启动')
  }, [])

  // children 就是要渲染的页面
  return <div className="app">{children}</div>
}

export default App

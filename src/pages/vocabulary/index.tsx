import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import CustomNavBar from '@/components/common/CustomNavBar'
import { useLearningStages, useStudyNotes } from '@/hooks/useApiQueries'
import './index.scss'

const VocabularyPage = () => {
  const [_selectedStage, setSelectedStage] = useState<string>('')

  // 使用React Query获取数据
  const { data: learningStages, isLoading: stagesLoading } = useLearningStages()
  const { data: studyNotes, isLoading: notesLoading } = useStudyNotes()

  // 返回上一页
  const _handleBack = () => {
    Taro.navigateBack()
  }

  // 重新开始/刷新
  const handleRefresh = () => {
    setSelectedStage('')
    Taro.showToast({
      title: '已重置选择',
      icon: 'success',
    })
  }

  // 选择学习阶段
  const selectStage = (stageId: string, isPremium: boolean) => {
    if (isPremium) {
      Taro.showModal({
        title: '开通会员',
        content: '该阶段需要开通会员后才能使用',
        confirmText: '去开通',
        success: res => {
          if (res.confirm) {
            Taro.navigateTo({
              url: '/pages/membership/index',
            })
          }
        },
      })
      return
    }

    setSelectedStage(stageId)
    // 跳转到新的词汇学习页面
    Taro.navigateTo({
      url: `/pages/vocabulary-study/index?stage=${stageId}`,
    })
  }

  return (
    <View className="vocabulary-page">
      {/* 导航栏 */}
      <CustomNavBar
        title="背单词"
        backgroundColor="linear-gradient(135deg, #ef5350 0%, #e53935 100%)"
      />

      {/* 主要内容 */}
      <View className="content with-custom-navbar">
        {/* 学习阶段选择 */}
        <View className="stages-grid">
          {stagesLoading ? (
            <Text className="loading-text">加载中...</Text>
          ) : (
            learningStages?.map(stage => (
              <View
                key={stage.id}
                className="stage-item"
                style={{ backgroundColor: stage.bgColor }}
                onClick={() => selectStage(stage.id, stage.isPremium)}
              >
                {stage.isPremium && (
                  <View className="crown-icon">
                    <Text>👑</Text>
                  </View>
                )}
                <Text className="stage-icon">{stage.icon}</Text>
                <Text className="stage-name">{stage.name}</Text>
                <Text className="stage-age">{stage.ageRange}</Text>
              </View>
            ))
          )}
        </View>

        {/* 学习说明 */}
        <View className="study-notes">
          <Text className="notes-title">学习说明</Text>

          {notesLoading ? (
            <Text className="loading-text">加载中...</Text>
          ) : (
            studyNotes?.map(note => (
              <View key={note.id} className="note-item">
                <View className="note-icon">
                  <Text>{note.icon}</Text>
                </View>
                <Text className="note-text">{note.text}</Text>
              </View>
            ))
          )}
        </View>
      </View>
    </View>
  )
}

export default VocabularyPage

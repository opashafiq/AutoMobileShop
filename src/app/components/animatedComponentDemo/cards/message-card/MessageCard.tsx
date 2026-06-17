'use client'

import { useState } from 'react'
import CodePreview from '@/app/components/shared/CodePreview'
import MessageCardMotionCode from './MessageCardMotion'

export const MessageCard = () => {
  const [replayAnimation, setReplayAnimation] = useState(0)
  const handleReplay = () => {
    setReplayAnimation((prev) => prev + 1)
  }
  return (
    <>
      <CodePreview
        component={<MessageCardMotionCode replayAnimation={replayAnimation} />}
        filePath='src/app/components/animatedComponentDemo/cards/message-card/MessageCardMotion.tsx'
        title='Message Card'
        isAnimated={true}
        showReplayButton={true}
        onReplay={handleReplay}
      />
    </>
  )
}

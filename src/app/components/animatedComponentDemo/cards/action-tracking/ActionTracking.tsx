'use client'

import { useState } from 'react'
import CodePreview from '@/app/components/shared/CodePreview'
import ActionTrackingMotionCode from './ActionTrackingMotion'

export const ActionTracking = () => {
  const [replayAnimation, setReplayAnimation] = useState(0)
  const handleReplay = () => {
    setReplayAnimation((prev) => prev + 1)
  }
  return (
    <>
      <CodePreview
        component={
          <ActionTrackingMotionCode replayAnimation={replayAnimation} />
        }
        filePath='src/app/components/animatedComponentDemo/cards/action-tracking/ActionTrackingMotion.tsx'
        title='Action Series Motion'
        isAnimated={true}
        showReplayButton={true}
        onReplay={handleReplay}
      />
    </>
  )
}

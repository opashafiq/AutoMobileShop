'use client'

import { useState } from 'react'
import CodePreview from '@/app/components/shared/CodePreview'
import InsightCardMotionCode from './InsightCardMotion'

export const InsightCard = () => {
  const [replayAnimation, setReplayAnimation] = useState(0)
  const handleReplay = () => {
    setReplayAnimation((prev) => prev + 1)
  }
  return (
    <>
      <CodePreview
        component={<InsightCardMotionCode replayAnimation={replayAnimation} />}
        filePath='src/app/components/animatedComponentDemo/cards/insight-card/InsightCardMotion.tsx'
        title='Insight Card'
        isAnimated={true}
        showReplayButton={true}
        onReplay={handleReplay}
      />
    </>
  )
}

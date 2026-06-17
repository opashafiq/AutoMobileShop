'use client'

import { useState } from 'react'
import CodePreview from '@/app/components/shared/CodePreview'
import AnimatedListMotionCode from './AnimatedListMotion'

export const AnimatedList = () => {
  const [replayAnimation, setReplayAnimation] = useState(0)
  const handleReplay = () => {
    setReplayAnimation((prev) => prev + 1)
  }

  return (
    <>
      <CodePreview
        component={<AnimatedListMotionCode replayAnimation={replayAnimation} />}
        filePath='src/app/components/animatedComponentDemo/lists/animated-lists/AnimatedListMotion.tsx'
        title='Animate List'
        isAnimated={true}
        showReplayButton={true}
        onReplay={handleReplay}
      />
    </>
  )
}

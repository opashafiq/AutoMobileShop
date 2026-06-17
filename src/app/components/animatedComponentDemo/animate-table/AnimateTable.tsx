'use client'

import { useState } from 'react'
import CodePreview from '@/app/components/shared/CodePreview'
import AnimateTableMotionCode from './AnimateTableMotion'

export const AnimateTable = () => {
  const [replayAnimation, setReplayAnimation] = useState(0)
  const handleReplay = () => {
    setReplayAnimation((prev) => prev + 1)
  }
  return (
    <>
      <CodePreview
        component={<AnimateTableMotionCode replayAnimation={replayAnimation} />}
        filePath='src/app/components/animatedComponentDemo/animate-table/AnimateTableMotion.tsx'
        title='Animate Table'
        isAnimated={true}
        showReplayButton={true}
        onReplay={handleReplay}
      />
    </>
  )
}

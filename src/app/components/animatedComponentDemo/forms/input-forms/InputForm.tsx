'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import InputFormMotionCode from './InputFormMotion'

export const InputForm = () => {
  return (
    <>
      <CodePreview
        component={<InputFormMotionCode />}
        filePath='src/app/components/animatedComponentDemo/forms/input-forms/InputFormMotion.tsx'
        title='Animate Input Form'
        isAnimated={true}
      />
    </>
  )
}

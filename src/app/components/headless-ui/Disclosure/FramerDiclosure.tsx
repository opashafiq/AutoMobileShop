'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import FramerMotion from './Code/FramerMotionCode'

const FramerDiclosure = () => {
  return (
    <div>
      <CodePreview
        component={<FramerMotion />}
        filePath='src/app/components/headless-ui/Disclosure/Code/FramerMotionCode.tsx'
        title='Disclosure With Framer Motion'
      />
    </div>
  )
}

export default FramerDiclosure

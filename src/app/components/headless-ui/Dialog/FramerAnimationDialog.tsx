'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import FramerMotionDialog from './Code/FramerMotionDialogCode'

const FramerAnimationDialog = () => {
  return (
    <div>
      <CodePreview
        component={<FramerMotionDialog />}
        filePath='src/app/components/headless-ui/Dialog/Code/FramerMotionDialogCode.tsx'
        title='Framer Motion Dialog'
      />
    </div>
  )
}

export default FramerAnimationDialog

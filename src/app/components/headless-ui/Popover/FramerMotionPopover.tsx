'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import FramerPopover from './Code/FramerPopoverCode'

const FramerMotionPopover = () => {
  return (
    <div>
      <CodePreview
        component={<FramerPopover />}
        filePath='src/app/components/headless-ui/Popover/Code/FramerPopoverCode.tsx'
        title='Framer Motion Popover'
      />
    </div>
  )
}

export default FramerMotionPopover

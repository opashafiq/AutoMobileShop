'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import RenderPopover from './Code/RenderPopoverCode'

const RenderAsElement = () => {
  return (
    <div>
      <CodePreview
        component={<RenderPopover />}
        filePath='src/app/components/headless-ui/Popover/Code/RenderPopoverCode.tsx'
        title='Rendering Different Elements'
      />
    </div>
  )
}

export default RenderAsElement

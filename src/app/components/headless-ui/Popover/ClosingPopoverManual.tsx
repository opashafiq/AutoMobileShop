'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import ClosingManually from './Code/ClosingManuallyCode'

const ClosingPopoverManual = () => {
  return (
    <div>
      <CodePreview
        component={<ClosingManually />}
        filePath='src/app/components/headless-ui/Popover/Code/ClosingManuallyCode.tsx'
        title='Closing Popovers Manually'
      />
    </div>
  )
}

export default ClosingPopoverManual

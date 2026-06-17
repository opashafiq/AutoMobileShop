'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import Scrollabledialog from './Code/ScrollableDialogCode'

const ScrollableDialog = () => {
  return (
    <div>
      <CodePreview
        component={<Scrollabledialog />}
        filePath='src/app/components/headless-ui/Dialog/Code/ScrollableDialogCode.tsx'
        title='Scrollable Dialog'
      />
    </div>
  )
}

export default ScrollableDialog

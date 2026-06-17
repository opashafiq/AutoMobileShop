'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import Basicdialog from './Code/BasicDialodCode'

const BasicDialog = () => {
  return (
    <div>
      <CodePreview
        component={<Basicdialog />}
        filePath='src/app/components/headless-ui/Dialog/Code/BasicDialodCode.tsx'
        title='Basic Dialog'
      />
    </div>
  )
}

export default BasicDialog

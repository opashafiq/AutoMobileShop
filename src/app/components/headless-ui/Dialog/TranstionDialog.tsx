'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import Transitiondialog from './Code/TransitionDialogCode'

const TranstionDialog = () => {
  return (
    <div>
      <CodePreview
        component={<Transitiondialog />}
        filePath='src/app/components/headless-ui/Dialog/Code/TransitionDialogCode.tsx'
        title='Transitions Dialog'
      />
    </div>
  )
}

export default TranstionDialog

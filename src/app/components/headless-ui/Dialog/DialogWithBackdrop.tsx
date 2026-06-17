'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import WithBackdrop from './Code/WithBackdropCode'

const DialogWithBackdrop = () => {
  return (
    <div>
      <CodePreview
        component={<WithBackdrop />}
        filePath='src/app/components/headless-ui/Dialog/Code/WithBackdropCode.tsx'
        title='Dialog With Backdrop'
      />
    </div>
  )
}

export default DialogWithBackdrop

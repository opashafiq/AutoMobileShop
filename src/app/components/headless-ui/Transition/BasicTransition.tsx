'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import Basictransaction from './Codes/BasicTransactionCode'

const BasicTransition = () => {
  return (
    <div>
      <CodePreview
        component={<Basictransaction />}
        filePath='src/app/components/headless-ui/Transition/Codes/BasicTransactionCode.tsx'
        title='Basic Transition'
      />
    </div>
  )
}

export default BasicTransition

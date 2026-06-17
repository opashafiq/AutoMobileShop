'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import Transition from './Code/TransitionCode'

const TransitionDisclosure = () => {
  return (
    <div>
      <CodePreview
        component={<Transition />}
        filePath='src/app/components/headless-ui/Disclosure/Code/TransitionCode.tsx'
        title='Transitions Disclosure'
      />
    </div>
  )
}

export default TransitionDisclosure

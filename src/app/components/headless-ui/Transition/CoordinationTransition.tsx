'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import Coordination from './Codes/CoordinationCode'

const CoordinationTransition = () => {
  return (
    <div>
      <CodePreview
        component={<Coordination />}
        filePath='src/app/components/headless-ui/Transition/Codes/CoordinationCode.tsx'
        title='Coordinating Transition'
      />
    </div>
  )
}

export default CoordinationTransition

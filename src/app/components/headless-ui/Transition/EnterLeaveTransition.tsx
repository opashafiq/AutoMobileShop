'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import EnterLeavetransition from './Codes/EnterLeaveTransitionCode'

const EnterLeaveTransition = () => {
  return (
    <div>
      <CodePreview
        component={<EnterLeavetransition />}
        filePath='src/app/components/headless-ui/Transition/Codes/EnterLeaveTransitionCode.tsx'
        title='Different Transition'
      />
    </div>
  )
}

export default EnterLeaveTransition

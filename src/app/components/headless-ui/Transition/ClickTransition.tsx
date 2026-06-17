'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import Clicktransition from './Codes/ClickTransitionCode'

const ClickTransition = () => {
  return (
    <div>
      <CodePreview
        component={<Clicktransition />}
        filePath='src/app/components/headless-ui/Transition/Codes/ClickTransitionCode.tsx'
        title='Click To Transition'
      />
    </div>
  )
}
export default ClickTransition

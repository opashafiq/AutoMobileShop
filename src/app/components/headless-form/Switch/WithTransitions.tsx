'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import WithTransition from './Codes/WithTransitionCode'

const WithTransitionsSwitch = () => {
  return (
    <div>
      <CodePreview
        component={<WithTransition />}
        filePath='src/app/components/headless-form/Switch/Codes/WithTransitionCode.tsx'
        title='Adding Transitions'
      />
    </div>
  )
}

export default WithTransitionsSwitch

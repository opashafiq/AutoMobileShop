'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import DefaultOn from './Codes/DefaultOnSwitchCode'

const DEfaultOnSwitches = () => {
  return (
    <div>
      <CodePreview
        component={<DefaultOn />}
        filePath='src/app/components/headless-form/Switch/Codes/DefaultOnSwitchCode.tsx'
        title='Default On Switches'
      />
    </div>
  )
}

export default DEfaultOnSwitches

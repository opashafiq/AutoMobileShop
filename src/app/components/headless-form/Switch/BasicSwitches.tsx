'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import BasicSwitch from './Codes/BasicSwitchCode'

const BasicSwitches = () => {
  return (
    <div>
      <CodePreview
        component={<BasicSwitch />}
        filePath='src/app/components/headless-form/Switch/Codes/BasicSwitchCode.tsx'
        title='Basic Switches'
      />
    </div>
  )
}

export default BasicSwitches

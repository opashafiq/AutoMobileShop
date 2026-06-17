'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import DisableSwitch from './Codes/DisableSwitchesCode'

const DisabledSwitches = () => {
  return (
    <div>
      <CodePreview
        component={<DisableSwitch />}
        filePath='src/app/components/headless-form/Switch/Codes/DisableSwitchesCode.tsx'
        title='Disabled Switches'
      />
    </div>
  )
}

export default DisabledSwitches

'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import Disabled from './Codes/DisabledCode'

const DisableCombo = () => {
  return (
    <div>
      <CodePreview
        component={<Disabled />}
        filePath='src/app/components/headless-form/Combobox/Codes/DisabledCode.tsx'
        title='Disabled'
      />
    </div>
  )
}

export default DisableCombo

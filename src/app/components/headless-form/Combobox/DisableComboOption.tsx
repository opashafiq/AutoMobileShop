'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import DisableComboOpt from './Codes/DisableComboOptCode'

const DisableComboOption = () => {
  return (
    <div>
      <CodePreview
        component={<DisableComboOpt />}
        filePath='src/app/components/headless-form/Combobox/Codes/DisableComboOptCode.tsx'
        title='Disabled Combo Option'
      />
    </div>
  )
}

export default DisableComboOption

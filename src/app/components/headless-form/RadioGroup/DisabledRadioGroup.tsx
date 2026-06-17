'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import DisabledRadiogroup from './Codes/DisabledRadioGroupCode'

const DisabledRadioGroup = () => {
  return (
    <div>
      <CodePreview
        component={<DisabledRadiogroup />}
        filePath='src/app/components/headless-form/RadioGroup/Codes/DisabledRadioGroupCode.tsx'
        title='Disabled Radio Group '
      />
    </div>
  )
}

export default DisabledRadioGroup

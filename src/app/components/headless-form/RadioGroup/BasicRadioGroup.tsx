'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import BasicRadiogroup from './Codes/BasicRadioGroupCode'

const BasicRadioGroup = () => {
  return (
    <div>
      <CodePreview
        component={<BasicRadiogroup />}
        filePath='src/app/components/headless-form/RadioGroup/Codes/BasicRadioGroupCode.tsx'
        title='Styling Radio Group'
      />
    </div>
  )
}

export default BasicRadioGroup

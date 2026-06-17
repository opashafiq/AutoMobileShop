'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import MainRadiogroup from './Codes/MainRadioGroupCode'

const MainRadioGroup = () => {
  return (
    <div>
      <CodePreview
        component={<MainRadiogroup />}
        filePath='src/app/components/headless-form/RadioGroup/Codes/MainRadioGroupCode.tsx'
        title='Simple Radio Group '
      />
    </div>
  )
}

export default MainRadioGroup

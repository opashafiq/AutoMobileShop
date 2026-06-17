'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import RadioGroupWithdesc from './Codes/RadioGroupWithDescCode'

const RadioGroupWithDesc = () => {
  return (
    <div>
      <CodePreview
        component={<RadioGroupWithdesc />}
        filePath='src/app/components/headless-form/RadioGroup/Codes/RadioGroupWithDescCode.tsx'
        title='With Description'
      />
    </div>
  )
}

export default RadioGroupWithDesc

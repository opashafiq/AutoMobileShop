'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import ComboWithLable from './Codes/ComboWithLableCode'

const WithLabel = () => {
  return (
    <div>
      <CodePreview
        component={<ComboWithLable />}
        filePath='src/app/components/headless-form/Combobox/Codes/ComboWithLableCode.tsx'
        title='With Label'
      />
    </div>
  )
}

export default WithLabel

'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import BasicCombo from './Codes/BasicComboCode'

const BasicCombobox = () => {
  return (
    <div>
      <CodePreview
        component={<BasicCombo />}
        filePath='src/app/components/headless-form/Combobox/Codes/BasicComboCode.tsx'
        title='Basic'
      />
    </div>
  )
}

export default BasicCombobox

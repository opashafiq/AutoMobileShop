'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import Comboposition from './Codes/ComboPositionCode'

const ComboPosition = () => {
  return (
    <div>
      <CodePreview
        component={<Comboposition />}
        filePath='src/app/components/headless-form/Combobox/Codes/ComboPositionCode.tsx'
        title='Dropdown Position'
      />
    </div>
  )
}

export default ComboPosition

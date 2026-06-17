'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import Dropdownposition from './Codes/DropdownPositionCode'

const DropDownPosition = () => {
  return (
    <div>
      <CodePreview
        component={<Dropdownposition />}
        filePath='src/app/components/headless-ui/Dropdown/Codes/DropdownPositionCode.tsx'
        title='Position'
      />
    </div>
  )
}

export default DropDownPosition

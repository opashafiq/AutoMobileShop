'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import Basicdropdown from './Codes/BasicDropdownCode'

const BasicDropdown = () => {
  return (
    <div>
      <CodePreview
        component={<Basicdropdown />}
        filePath='src/app/components/headless-ui/Dropdown/Codes/BasicDropdownCode.tsx'
        title='Basic Dropdown'
      />
    </div>
  )
}

export default BasicDropdown

'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import LinkDropDown from './Codes/LinkDropdownCode'

const LinkDropdown = () => {
  return (
    <div>
      <CodePreview
        component={<LinkDropDown />}
        filePath='src/app/components/headless-ui/Dropdown/Codes/LinkDropdownCode.tsx'
        title='Links Dropdown'
      />
    </div>
  )
}

export default LinkDropdown

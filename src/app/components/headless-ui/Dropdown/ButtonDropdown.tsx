'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import ButtonAction from './Codes/ButtonActionCode'

const ButtonDropdown = () => {
  return (
    <div>
      <CodePreview
        component={<ButtonAction />}
        filePath='src/app/components/headless-ui/Dropdown/Codes/ButtonActionCode.tsx'
        title='Button Action'
      />
    </div>
  )
}

export default ButtonDropdown

'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import Dropdwonwidth from './Codes/DropdwonWidthCode'

const DropdownWidth = () => {
  return (
    <div>
      <CodePreview
        component={<Dropdwonwidth />}
        filePath='src/app/components/headless-ui/Dropdown/Codes/DropdwonWidthCode.tsx'
        title='Dropdown Width'
      />
    </div>
  )
}

export default DropdownWidth

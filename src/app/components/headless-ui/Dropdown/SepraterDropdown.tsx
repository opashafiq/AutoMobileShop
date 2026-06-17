'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import SepratingItems from './Codes/SepratingItemsCode'

const SepratorDropdown = () => {
  return (
    <div>
      <CodePreview
        component={<SepratingItems />}
        filePath='src/app/components/headless-ui/Dropdown/Codes/SepratingItemsCode.tsx'
        title='Separating Items'
      />
    </div>
  )
}

export default SepratorDropdown

'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import DisableItem from './Codes/DisableItemCode'

const DisablingItem = () => {
  return (
    <div>
      <CodePreview
        component={<DisableItem />}
        filePath='src/app/components/headless-ui/Dropdown/Codes/DisableItemCode.tsx'
        title='Disable Items'
      />
    </div>
  )
}

export default DisablingItem

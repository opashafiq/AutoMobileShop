'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import DisableListbox from './Codes/DisableListboxCode'

const DisableListAll = () => {
  return (
    <div>
      <CodePreview
        component={<DisableListbox />}
        filePath='src/app/components/headless-form/Listbox/Codes/DisableListboxCode.tsx'
        title='Disable Listbox'
      />
    </div>
  )
}

export default DisableListAll

'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import DisableListboxOption from './Codes/DisableListboxOptionCode'

const DisableListBox = () => {
  return (
    <div>
      <CodePreview
        component={<DisableListboxOption />}
        filePath='src/app/components/headless-form/Listbox/Codes/DisableListboxOptionCode.tsx'
        title='Disable Listbox Option'
      />
    </div>
  )
}

export default DisableListBox

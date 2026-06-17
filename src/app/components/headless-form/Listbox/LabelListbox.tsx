'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import LabelWithList from './Codes/LabelWithListcode'

const LabelListbox = () => {
  return (
    <div>
      <CodePreview
        component={<LabelWithList />}
        filePath='src/app/components/headless-form/Listbox/Codes/LabelWithListcode.tsx'
        title='Label With Listbox'
      />
    </div>
  )
}

export default LabelListbox

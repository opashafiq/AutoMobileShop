'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import ListDesc from './Codes/ListDescCode'

const ListboxWithDescription = () => {
  return (
    <div>
      <CodePreview
        component={<ListDesc />}
        filePath='src/app/components/headless-form/Listbox/Codes/ListDescCode.tsx'
        title='Listbox With Description'
      />
    </div>
  )
}

export default ListboxWithDescription

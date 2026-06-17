'use client'
import CodePreview from '@/app/components/shared/CodePreview'
import BasicList from './Codes/BasicListCode'

const BasicListbox = () => {
  return (
    <div>
      <CodePreview
        component={<BasicList />}
        filePath='src/app/components/headless-form/Listbox/Codes/BasicListCode.tsx'
        title='Basic Listbox'
      />
    </div>
  )
}

export default BasicListbox

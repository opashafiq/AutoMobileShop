'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import ListBoxWithHtml from './Codes/ListBoxWithHtmlCode'

const ListBoxWithHtmlForm = () => {
  return (
    <div>
      <CodePreview
        component={<ListBoxWithHtml />}
        filePath='src/app/components/headless-form/Listbox/Codes/ListBoxWithHtmlCode.tsx'
        title='Using HTML forms'
      />
    </div>
  )
}

export default ListBoxWithHtmlForm

'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import WithHtmlRadioForm from './Codes/WithHtmlRadioFormCode'

const WithHtmlForms = () => {
  return (
    <div>
      <CodePreview
        component={<WithHtmlRadioForm />}
        filePath='src/app/components/headless-form/RadioGroup/Codes/WithHtmlRadioFormCode.tsx'
        title='With HTML forms'
      />
    </div>
  )
}

export default WithHtmlForms

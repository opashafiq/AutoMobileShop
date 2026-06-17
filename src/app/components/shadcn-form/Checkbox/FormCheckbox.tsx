import CodePreview from '@/app/components/shared/CodePreview'
import FormCheckboxCode from './code/FormCheckboxCode'

const FormCheckbox = () => {
  return (
    <CodePreview
      component={<FormCheckboxCode />}
      filePath='src/app/components/shadcn-form/Checkbox/code/FormCheckboxCode.tsx'
      title='With Form'
    />
  )
}

export default FormCheckbox

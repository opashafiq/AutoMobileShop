import CodePreview from '@/app/components/shared/CodePreview'
import CheckboxWithTextCode from './code/CheckboxWithTextCode'

const CheckboxWithText = () => {
  return (
    <CodePreview
      component={<CheckboxWithTextCode />}
      filePath='src/app/components/shadcn-form/Checkbox/code/CheckboxWithTextCode.tsx'
      title='With Text'
    />
  )
}

export default CheckboxWithText

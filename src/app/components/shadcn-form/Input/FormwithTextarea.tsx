import CodePreview from '@/app/components/shared/CodePreview'
import FormwithTextareaCode from './code/FormwithTextareaCode'

const FormwithTextarea = () => {
  return (
    <>
      <CodePreview
        component={<FormwithTextareaCode />}
        filePath='src/app/components/shadcn-form/Input/code/FormwithTextareaCode.tsx'
        title='Form Textarea'
      />
    </>
  )
}

export default FormwithTextarea

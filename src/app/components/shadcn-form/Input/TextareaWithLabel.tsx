import CodePreview from '@/app/components/shared/CodePreview'
import TextareaWithLabelCode from './code/TextareaWithLabelCode'

const TextareaWithLabel = () => {
  return (
    <>
      <CodePreview
        component={<TextareaWithLabelCode />}
        filePath='src/app/components/shadcn-form/Input/code/TextareaWithLabelCode.tsx'
        title='Textarea with Label'
      />
    </>
  )
}

export default TextareaWithLabel

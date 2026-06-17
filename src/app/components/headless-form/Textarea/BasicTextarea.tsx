import CodePreview from '@/app/components/shared/CodePreview'
import Basictextarea from './Code/BasicTextareaCode'

const BasicTextarea = () => {
  return (
    <div>
      <CodePreview
        component={<Basictextarea />}
        filePath='src/app/components/headless-form/Textarea/Code/BasicTextareaCode.tsx'
        title='Basic Textarea'
      />
    </div>
  )
}

export default BasicTextarea

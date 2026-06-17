import CodePreview from '@/app/components/shared/CodePreview'
import WithDescriptiontextarea from './Code/WithDescriptionTextareaCode'

const WithDescriptionTextarea = () => {
  return (
    <div>
      <CodePreview
        component={<WithDescriptiontextarea />}
        filePath='src/app/components/headless-form/Textarea/Code/WithDescriptionTextareaCode.tsx'
        title='Discription With Textarea'
      />
    </div>
  )
}

export default WithDescriptionTextarea

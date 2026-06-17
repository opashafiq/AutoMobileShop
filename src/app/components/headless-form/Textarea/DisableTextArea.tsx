import CodePreview from '@/app/components/shared/CodePreview'
import DisableTextArea from './Code/DisableTextAreaCode'

const DisableTextarea = () => {
  return (
    <div>
      <CodePreview
        component={<DisableTextArea />}
        filePath='src/app/components/headless-form/Textarea/Code/DisableTextAreaCode.tsx'
        title='Disabled Textarea'
      />
    </div>
  )
}

export default DisableTextarea

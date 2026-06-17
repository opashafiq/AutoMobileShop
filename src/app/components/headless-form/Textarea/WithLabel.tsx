import CodePreview from '@/app/components/shared/CodePreview'
import WithLabel from './Code/WithLabelCode'

const WithLabelTextarea = () => {
  return (
    <div>
      <CodePreview
        component={<WithLabel />}
        filePath='src/app/components/headless-form/Textarea/Code/WithLabelCode.tsx'
        title='Label With Textarea'
      />
    </div>
  )
}

export default WithLabelTextarea

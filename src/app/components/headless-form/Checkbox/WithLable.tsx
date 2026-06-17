import CodePreview from '@/app/components/shared/CodePreview'
import Withlabel from './Codes/WithLabelCode'

const WithLable = () => {
  return (
    <div>
      <CodePreview
        component={<Withlabel />}
        filePath='src/app/components/headless-form/Checkbox/Codes/WithLabelCode.tsx'
        title='Checkbox Label'
      />
    </div>
  )
}

export default WithLable

import CodePreview from '@/app/components/shared/CodePreview'
import BasicbuttonsCode from './Codes/BasicButtonsCode'

const BasicButtons = () => {
  return (
    <div>
      <CodePreview
        component={<BasicbuttonsCode />}
        filePath='src/app/components/headless-form/Button/code/BasicButtonCode.tsx'
        title='Basic Button'
      />
    </div>
  )
}

export default BasicButtons

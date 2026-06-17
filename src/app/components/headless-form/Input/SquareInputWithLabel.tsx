import CodePreview from '@/app/components/shared/CodePreview'
import SquareInputWithLbl from './Codes/SquareInputCode'

const SquareInputWithLabel = () => {
  return (
    <div>
      <CodePreview
        component={<SquareInputWithLbl />}
        filePath='src/app/components/headless-form/Input/Codes/SquareInputCode.tsx'
        title='Square Input With Label'
      />
    </div>
  )
}

export default SquareInputWithLabel

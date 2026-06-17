import CodePreview from '@/app/components/shared/CodePreview'
import Transitioncheck from './Codes/TransitionCheckCode'

const TransitionCheckbox = () => {
  return (
    <div>
      <CodePreview
        component={<Transitioncheck />}
        filePath='src/app/components/headless-form/Checkbox/Codes/TransitionCheckCode.tsx'
        title='Transitions Checkbox'
      />
    </div>
  )
}

export default TransitionCheckbox

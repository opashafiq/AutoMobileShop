import CodePreview from '@/app/components/shared/CodePreview'
import UsingUnControlled from './Codes/UsingUncontrolledCode'

const UsingUncontrolled = () => {
  return (
    <div>
      <CodePreview
        component={<UsingUnControlled />}
        filePath='src/app/components/headless-form/Checkbox/Codes/UsingUncontrolledCode.tsx'
        title='Using as Uncontrolled'
      />
    </div>
  )
}

export default UsingUncontrolled

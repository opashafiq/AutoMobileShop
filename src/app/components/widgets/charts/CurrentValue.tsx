import CodePreview from '@/app/components/shared/CodePreview'
import CurrentValueCode from './code/CurrentValueCode'

const currentValue = () => {
  return (
    <>
      <CodePreview
        component={<CurrentValueCode />}
        filePath='src/app/components/widgets/charts/code/CurrentValueCode.tsx'
        title='Current Value Chart'
      />
    </>
  )
}

export default currentValue

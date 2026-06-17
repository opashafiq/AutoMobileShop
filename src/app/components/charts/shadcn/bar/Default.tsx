import CodePreview from '@/app/components/shared/CodePreview'
import DefaultCode from './code/DefaultCode'

const ChartBarDefault = () => {
  return (
    <>
      <CodePreview
        component={<DefaultCode />}
        filePath='src/app/components/charts/shadcn/bar/code/DefaultCode.tsx'
        title='Default'
      />
    </>
  )
}

export default ChartBarDefault

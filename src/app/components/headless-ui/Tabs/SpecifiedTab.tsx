import CodePreview from '@/app/components/shared/CodePreview'
import SpecifiedDefault from './Code/SpecifiedDefaultCode'

const SpecifiedTab = () => {
  return (
    <div>
      <CodePreview
        component={<SpecifiedDefault />}
        filePath='src/app/components/headless-ui/Tabs/Code/SpecifiedDefaultCode.tsx'
        title='Specifying The Default Tab'
      />
    </div>
  )
}

export default SpecifiedTab

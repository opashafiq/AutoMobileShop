import CodePreview from '@/app/components/shared/CodePreview'
import Basictabs from './Code/BasicTabsCode'

const BasicTabs = () => {
  return (
    <div>
      <CodePreview
        component={<Basictabs />}
        filePath='src/app/components/headless-ui/Tabs/Code/BasicTabsCode.tsx'
        title='Basic Tabs'
      />
    </div>
  )
}

export default BasicTabs

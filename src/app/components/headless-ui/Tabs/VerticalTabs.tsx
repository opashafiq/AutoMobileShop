import CodePreview from '@/app/components/shared/CodePreview'
import Verticaltabs from './Code/VerticalTabsCode'

const VerticalTabs = () => {
  return (
    <div>
      <CodePreview
        component={<Verticaltabs />}
        filePath='src/app/components/headless-ui/Tabs/Code/VerticalTabsCode.tsx'
        title='Vertical Tabs'
      />
    </div>
  )
}

export default VerticalTabs

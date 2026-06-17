import CodePreview from '@/app/components/shared/CodePreview'
import Disabletab from './Code/DisableTabCode'

const DisableTab = () => {
  return (
    <div>
      <CodePreview
        component={<Disabletab />}
        filePath='src/app/components/headless-ui/Tabs/Code/DisableTabCode.tsx'
        title='Disable Tab'
      />
    </div>
  )
}

export default DisableTab

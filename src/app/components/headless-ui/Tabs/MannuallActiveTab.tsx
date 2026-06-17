import CodePreview from '@/app/components/shared/CodePreview'
import ManuallActivetab from './Code/ManuallActiveTabCode'

const MannuallActiveTab = () => {
  return (
    <div>
      <CodePreview
        component={<ManuallActivetab />}
        filePath='src/app/components/headless-ui/Tabs/Code/ManuallActiveTabCode.tsx'
        title='Manually Active Tab'
      />
    </div>
  )
}

export default MannuallActiveTab

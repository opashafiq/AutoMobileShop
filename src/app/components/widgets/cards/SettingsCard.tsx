import CodePreview from '@/app/components/shared/CodePreview'
import SettingsCardCode from './code/SettingsCardCode'

const settingsCard = () => {
  return (
    <>
      <CodePreview
        component={<SettingsCardCode />}
        filePath='src/app/components/widgets/cards/code/SettingsCardCode.tsx'
        title='Settings Cards'
      />
    </>
  )
}

export default settingsCard

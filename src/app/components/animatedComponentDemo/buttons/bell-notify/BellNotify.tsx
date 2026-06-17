import CodePreview from '@/app/components/shared/CodePreview'
import BellNotifyButtonCode from './BellNotifyButton'

export const BellNotify = () => {
  return (
    <>
      <CodePreview
        component={<BellNotifyButtonCode />}
        filePath='src/app/components/animatedComponentDemo/buttons/bell-notify/BellNotifyButton.tsx'
        title='Bell Notify Button'
        isAnimated={true}
      />
    </>
  )
}

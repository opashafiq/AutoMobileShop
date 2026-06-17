import CodePreview from '@/app/components/shared/CodePreview'
import TapPopButtonCode from './TapPopButton'

export const TapPop = () => {
  return (
    <>
      <CodePreview
        component={<TapPopButtonCode />}
        filePath='src/app/components/animatedComponentDemo/buttons/tap-pop/TapPopButton.tsx'
        title='TapPop Button'
        isAnimated={true}
      />
    </>
  )
}

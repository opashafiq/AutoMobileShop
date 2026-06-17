import CodePreview from '@/app/components/shared/CodePreview'
import LiquidFillButtonCode from './LiquidFillButton'

export const LiquidFill = () => {
  return (
    <>
      <CodePreview
        component={<LiquidFillButtonCode />}
        filePath='src/app/components/animatedComponentDemo/buttons/liquid-fill/LiquidFillButton.tsx'
        title='Liquid Fill Button'
        isAnimated={true}
      />
    </>
  )
}

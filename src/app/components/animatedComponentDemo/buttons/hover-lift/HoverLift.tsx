import CodePreview from '@/app/components/shared/CodePreview'
import HoverLiftButtonCode from './HoverLiftButton'

export const HoverLift = () => {
  return (
    <>
      <CodePreview
        component={<HoverLiftButtonCode />}
        filePath='src/app/components/animatedComponentDemo/buttons/hover-lift/HoverLiftButton.tsx'
        title='Hover Lift Button'
        isAnimated={true}
      />
    </>
  )
}

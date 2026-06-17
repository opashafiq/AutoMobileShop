import CodePreview from '@/app/components/shared/CodePreview'
import ExpandableCardMotionCode from './ExpandableCardMotion'

export const ExpandableCard = () => {
  return (
    <>
      <CodePreview
        component={<ExpandableCardMotionCode />}
        filePath='src/app/components/animatedComponentDemo/cards/expandable-card/ExpandableCardMotion.tsx'
        title='Expandable Card'
        isAnimated={true}
      />
    </>
  )
}

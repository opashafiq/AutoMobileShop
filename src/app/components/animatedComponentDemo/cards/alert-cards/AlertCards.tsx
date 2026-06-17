import CodePreview from '@/app/components/shared/CodePreview'
import AlertCardMotionCode from './AlertCardMotion'

export const AlertCards = () => {
  return (
    <>
      <CodePreview
        component={<AlertCardMotionCode />}
        filePath='src/app/components/animatedComponentDemo/cards/alert-cards/AlertCardMotion.tsx'
        title='Alert Card Motion'
        isAnimated={true}
      />
    </>
  )
}

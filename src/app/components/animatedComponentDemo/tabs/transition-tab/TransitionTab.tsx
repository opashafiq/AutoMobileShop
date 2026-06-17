import CodePreview from '@/app/components/shared/CodePreview'
import TransitionTabMotionCode from './TransitionTabMotion'

export const TransitionTab = () => {
  return (
    <>
      <CodePreview
        component={<TransitionTabMotionCode />}
        filePath='src/app/components/animatedComponentDemo/tabs/transition-tab/TransitionTabMotion.tsx'
        title='Transition Tab'
        isAnimated={true}
      />
    </>
  )
}

import CodePreview from '@/app/components/shared/CodePreview'
import InputPlaceholderAnimateCode from './InputPlaceholderAnimate'

export const InputPlaceholder = () => {
  return (
    <>
      <CodePreview
        component={<InputPlaceholderAnimateCode />}
        filePath='src/app/components/animatedComponentDemo/forms/input-placeholder/InputPlaceholderAnimate.tsx'
        title='Animate Input Placeholder'
        isAnimated={true}
      />
    </>
  )
}

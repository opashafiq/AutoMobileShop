import CodePreview from '@/app/components/shared/CodePreview'
import GlitchButtonCode from './GlitchButton'

export const Glitch = () => {
  return (
    <>
      <CodePreview
        component={<GlitchButtonCode />}
        filePath='src/app/components/animatedComponentDemo/buttons/glitch/GlitchButton.tsx'
        title='Glitch Button'
        isAnimated={true}
      />
    </>
  )
}

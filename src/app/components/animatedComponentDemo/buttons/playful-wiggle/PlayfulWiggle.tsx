import CodePreview from '@/app/components/shared/CodePreview'
import PlayfulWigleButtonCode from './PlayfulWigleButton'

export const PlayfulWiggle = () => {
  return (
    <>
      <CodePreview
        component={<PlayfulWigleButtonCode />}
        filePath='src/app/components/animatedComponentDemo/buttons/playful-wiggle/PlayfulWigleButton.tsx'
        title='Playful Wiggle Button'
        isAnimated={true}
      />
    </>
  )
}

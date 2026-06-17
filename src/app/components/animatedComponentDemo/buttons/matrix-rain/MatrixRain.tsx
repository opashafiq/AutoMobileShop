import CodePreview from '@/app/components/shared/CodePreview'
import MatrixRainButtonCode from './MatrixRainButton'

export const MatrixRain = () => {
  return (
    <>
      <CodePreview
        component={<MatrixRainButtonCode />}
        filePath='src/app/components/animatedComponentDemo/buttons/matrix-rain/MatrixRainButton.tsx'
        title='Matrix Rain Button'
        isAnimated={true}
      />
    </>
  )
}

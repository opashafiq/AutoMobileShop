import CodePreview from '@/app/components/shared/CodePreview'
import HeartLikesButtonCode from './HeartLikesButton'

export const HeartLike = () => {
  return (
    <>
      <CodePreview
        component={<HeartLikesButtonCode />}
        filePath='src/app/components/animatedComponentDemo/buttons/heart-like/HeartLikesButton.tsx'
        title='Heart Like Button'
        isAnimated={true}
      />
    </>
  )
}

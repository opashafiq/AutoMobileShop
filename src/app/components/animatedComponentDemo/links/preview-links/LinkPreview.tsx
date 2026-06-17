import CodePreview from '@/app/components/shared/CodePreview'
import LinkPreviewMotionCode from './LinkPreviewMotion'

export const LinkPreview = () => {
  return (
    <>
      <CodePreview
        component={<LinkPreviewMotionCode />}
        filePath='src/app/components/animatedComponentDemo/links/preview-links/LinkPreviewMotion.tsx'
        title='Preview Links'
        isAnimated={true}
      />
    </>
  )
}

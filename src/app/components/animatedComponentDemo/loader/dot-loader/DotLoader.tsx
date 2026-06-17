import CodePreview from '@/app/components/shared/CodePreview'
import DotLoaderMotionCode from './DotLoaderMotion'

const DotLoader = () => {
  return (
    <>
      <CodePreview
        component={<DotLoaderMotionCode />}
        filePath='src/app/components/animatedComponentDemo/loader/dot-loader/DotLoaderMotion.tsx'
        title='Dot Loader'
        isAnimated={true}
      />
    </>
  )
}

export default DotLoader

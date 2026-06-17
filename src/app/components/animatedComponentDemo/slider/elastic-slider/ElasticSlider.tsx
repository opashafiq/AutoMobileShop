import CodePreview from '@/app/components/shared/CodePreview'
import ElasticSliderMotionCode from './ElasticSliderMotion'

export const ElasticSlider = () => {
  return (
    <>
      <CodePreview
        component={<ElasticSliderMotionCode />}
        filePath='src/app/components/animatedComponentDemo/slider/elastic-slider/ElasticSliderMotion.tsx'
        title='Elastic Slider'
        isAnimated={true}
      />
    </>
  )
}

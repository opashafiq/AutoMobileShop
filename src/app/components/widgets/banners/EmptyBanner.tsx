import CodePreview from '@/app/components/shared/CodePreview'
import EmptyBannerCode from './code/EmptyBannerCode'

const EmptyBanner = () => {
  return (
    <>
      <CodePreview
        component={<EmptyBannerCode />}
        filePath='src/app/components/widgets/banners/code/EmptyBannerCode.tsx'
        title='Empty Banner'
      />
    </>
  )
}

export default EmptyBanner

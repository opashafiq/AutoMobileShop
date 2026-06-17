import CodePreview from '@/app/components/shared/CodePreview'
import WelcomeBannerCode from './code/WelcomeBannerCode.tsx'

const GreetingBanner2 = () => {
  return (
    <>
      <CodePreview
        component={<WelcomeBannerCode />}
        filePath='src/app/components/widgets/banners/code/WelcomeBannerCode.tsx'
        title='Notification Banner'
      />
    </>
  )
}

export default GreetingBanner2

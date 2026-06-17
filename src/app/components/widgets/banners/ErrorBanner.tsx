import CodePreview from '@/app/components/shared/CodePreview'
import ErroreBannerCode from './code/ErroreBannerCode'

const ErrorBanner = () => {
  return (
    <>
      <CodePreview
        component={<ErroreBannerCode />}
        filePath='src/app/components/widgets/banners/code/ErroreBannerCode.tsx'
        title='Error Banner'
      />
    </>
  )
}

export default ErrorBanner

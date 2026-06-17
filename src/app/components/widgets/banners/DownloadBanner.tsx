import CodePreview from '@/app/components/shared/CodePreview'
import DownloaadBannerCode from './code/DownloadBannerCode'

const DownloadBanner = () => {
  return (
    <>
      <CodePreview
        component={<DownloaadBannerCode />}
        filePath='src/app/components/widgets/banners/code/DownloadBannerCode.tsx'
        title='Download Banner'
      />
    </>
  )
}

export default DownloadBanner

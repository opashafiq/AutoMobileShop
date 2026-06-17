import CodePreview from '@/app/components/shared/CodePreview'
import NotificationBannerCode from './code/NotificationBannerCode'

const NotificationsBanner = () => {
  return (
    <>
      <CodePreview
        component={<NotificationBannerCode />}
        filePath='src/app/components/widgets/banners/code/NotificationBannerCode.tsx'
        title='Notification Banner'
      />
    </>
  )
}

export default NotificationsBanner

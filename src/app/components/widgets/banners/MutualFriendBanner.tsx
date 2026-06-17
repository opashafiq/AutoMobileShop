import CodePreview from '@/app/components/shared/CodePreview'
import MutualBannerCode from './code/MutualFriendBannerCode'

const MutualFriendsBanner = () => {
  return (
    <>
      <CodePreview
        component={<MutualBannerCode />}
        filePath='src/app/components/widgets/banners/code/MutualBannerCode.tsx'
        title='Mutual Friend Banner'
      />
    </>
  )
}

export default MutualFriendsBanner

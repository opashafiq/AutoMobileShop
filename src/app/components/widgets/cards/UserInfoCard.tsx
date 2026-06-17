import CodePreview from '@/app/components/shared/CodePreview'
import UserInfoCardCode from './code/UserInfoCardCode'

const UserInfoCard = () => {
  return (
    <>
      <CodePreview
        component={<UserInfoCardCode />}
        filePath='src/app/components/widgets/cards/code/UserInfoCardCode.tsx'
        title='User Info Card'
      />
    </>
  )
}

export default UserInfoCard

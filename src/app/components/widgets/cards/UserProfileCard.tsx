import CodePreview from '@/app/components/shared/CodePreview'
import UserProfileCardCode from './code/UserProfileCardCode'

const UserProfileCard = () => {
  return (
    <>
      <CodePreview
        component={<UserProfileCardCode />}
        filePath='src/app/components/widgets/cards/code/UserProfileCardCode.tsx'
        title='User Profile Card'
      />
    </>
  )
}

export default UserProfileCard

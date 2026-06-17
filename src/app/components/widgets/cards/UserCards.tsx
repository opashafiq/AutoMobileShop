import CodePreview from '@/app/components/shared/CodePreview'
import UserCardsCode from './code/UserCardsCode'

const User = () => {
  return (
    <>
      <CodePreview
        component={<UserCardsCode />}
        filePath='src/app/components/widgets/cards/code/UserCardsCode.tsx'
        title='User Cards'
      />
    </>
  )
}

export default User

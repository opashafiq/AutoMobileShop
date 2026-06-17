import CodePreview from '@/app/components/shared/CodePreview'
import SocialPostCode from './code/SocialPostCode'

const SocialPostCard = () => {
  return (
    <>
      <CodePreview
        component={<SocialPostCode />}
        filePath='src/app/components/widgets/cards/code/SocialPostCode.tsx'
        title='Social Post Card'
      />
    </>
  )
}

export default SocialPostCard

import CodePreview from '@/app/components/shared/CodePreview'
import SocialCardCode from './code/SocialCardCode'

const SocialCard = () => {
  return (
    <>
      <CodePreview
        component={<SocialCardCode />}
        filePath='src/app/components/widgets/cards/code/SocialCardCode.tsx'
        title='Social Card'
      />
    </>
  )
}

export default SocialCard

import CodePreview from '@/app/components/shared/CodePreview'
import WelcomeCardCode from './code/WelcomeCardCode'

const GreetingBanner = () => {
  return (
    <>
      <CodePreview
        component={<WelcomeCardCode />}
        filePath='src/app/components/widgets/banners/code/WelcomeCardCode.tsx'
        title='Greeting Banner'
      />
    </>
  )
}

export default GreetingBanner

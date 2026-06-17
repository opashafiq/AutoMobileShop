import CodePreview from '@/app/components/shared/CodePreview'
import UsingHtmlform from './Codes/UsingHtmlFormCode'

const UsingHtmlForm = () => {
  return (
    <div>
      <CodePreview
        component={<UsingHtmlform />}
        filePath='src/app/components/headless-form/Checkbox/Codes/UsingHtmlFormCode.tsx'
        title='With HTML Forms'
      />
    </div>
  )
}

export default UsingHtmlForm

import CodePreview from '@/app/components/shared/CodePreview'
import Withdescription from './Codes/WithDescriptionCode'

const WithDescription = () => {
  return (
    <div>
      <CodePreview
        component={<Withdescription />}
        filePath='src/app/components/headless-form/Checkbox/Codes/WithDescriptionCode.tsx'
        title='With Discription'
      />
    </div>
  )
}

export default WithDescription

import CodePreview from '@/app/components/shared/CodePreview'
import Advancecollpse from './code/AdvanceCollpaseCode'

const AdvanceCollapse = () => {
  return (
    <>
      <CodePreview
        component={<Advancecollpse />}
        filePath='src/app/components/shadcn-ui/Collapsible/code/AdvanceCollpaseCode.tsx'
        title='Advance Collapse'
      />
    </>
  )
}

export default AdvanceCollapse

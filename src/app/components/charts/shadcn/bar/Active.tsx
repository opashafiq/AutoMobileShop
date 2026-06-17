import CodePreview from '@/app/components/shared/CodePreview'
import ActiveCode from './code/ActiveCode'

const ChartBarActive = () => {
  return (
    <>
      <CodePreview
        component={<ActiveCode />}
        filePath='src/app/components/charts/shadcn/bar/code/ActiveCode.tsx'
        title='Active'
      />
    </>
  )
}

export default ChartBarActive

import CodePreview from '@/app/components/shared/CodePreview'
import Basicpopover from './Code/BasicPopoverCode'

const BasicPopover = () => {
  return (
    <div>
      <CodePreview
        component={<Basicpopover />}
        filePath='src/app/components/headless-ui/Popover/Code/BasicPopoverCode.tsx'
        title='Basic Popover'
      />
    </div>
  )
}

export default BasicPopover

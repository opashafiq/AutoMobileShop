import CodePreview from '@/app/components/shared/CodePreview'
import Popoverwidth from './Code/PopoverWidthCode'

const PopoverWidth = () => {
  return (
    <div>
      <CodePreview
        component={<Popoverwidth />}
        filePath='src/app/components/headless-ui/Popover/Code/PopoverWidthCode.tsx'
        title='Popover Width'
      />
    </div>
  )
}

export default PopoverWidth

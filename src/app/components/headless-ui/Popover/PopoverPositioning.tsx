import CodePreview from '@/app/components/shared/CodePreview'
import PopoverPosition from './Code/PopoverPositionCode'

const PopoverPositioning = () => {
  return (
    <div>
      <CodePreview
        component={<PopoverPosition />}
        filePath='src/app/components/headless-ui/Popover/Code/PopoverPositionCode.tsx'
        title='Popover Positioning'
      />
    </div>
  )
}

export default PopoverPositioning

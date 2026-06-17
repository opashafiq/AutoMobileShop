import CodePreview from '@/app/components/shared/CodePreview'
import Groupingpopover from './Code/GroupingPopoverCode'

const GroupingPopover = () => {
  return (
    <div>
      <CodePreview
        component={<Groupingpopover />}
        filePath='src/app/components/headless-ui/Popover/Code/GroupingPopoverCode.tsx'
        title='Grouping Related Popover'
      />
    </div>
  )
}

export default GroupingPopover

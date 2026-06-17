import CodePreview from '@/app/components/shared/CodePreview'
import Popovertransition from './Code/PopoverTransitionCode'

const PopoverTransition = () => {
  return (
    <div>
      <CodePreview
        component={<Popovertransition />}
        filePath='src/app/components/headless-ui/Popover/Code/PopoverTransitionCode.tsx'
        title='Popover Transitions'
      />
    </div>
  )
}

export default PopoverTransition

import CodePreview from '@/app/components/shared/CodePreview'
import PopoverBgDrop from './Code/PopoverBgDropcode'

const PopoverBackdrops = () => {
  return (
    <div>
      <CodePreview
        component={<PopoverBgDrop />}
        filePath='src/app/components/headless-ui/Popover/Code/PopoverBgDropcode.tsx'
        title='Popover Backdrop'
      />
    </div>
  )
}

export default PopoverBackdrops

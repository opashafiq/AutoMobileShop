import CodePreview from '@/app/components/shared/CodePreview'
import PopoverCombo from './code/PopoverComboCode'

const PopoverCombobox = () => {
  return (
    <>
      <CodePreview
        component={<PopoverCombo />}
        filePath='src/app/components/shadcn-ui/Combobox/code/PopoverComboCode.tsx'
        title='Popover Combobox'
      />
    </>
  )
}

export default PopoverCombobox

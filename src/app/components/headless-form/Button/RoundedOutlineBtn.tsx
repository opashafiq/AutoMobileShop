import CodePreview from '@/app/components/shared/CodePreview'
import RoundedOutlinedBtn from './Codes/RoundedOutlinedBtnCode'

const RoundedOutlineBtn = () => {
  return (
    <div>
      <CodePreview
        component={<RoundedOutlinedBtn />}
        filePath='src/app/components/headless-form/Button/Codes/RoundedOutlinedBtnCode.tsx'
        title='Rounded Outlined Buttons'
      />
    </div>
  )
}

export default RoundedOutlineBtn

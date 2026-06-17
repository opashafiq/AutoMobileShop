import CodePreview from '@/app/components/shared/CodePreview'
import ControlledOtpInputCode from './code/ControlledOtpInputCode'

const ControlledOtpInput = () => {
  return (
    <>
      <CodePreview
        component={<ControlledOtpInputCode />}
        filePath='src/app/components/shadcn-form/Input/code/ControlledOtpInputCode.tsx'
        title='Controlled OTP Input'
      />
    </>
  )
}

export default ControlledOtpInput

import CodePreview from '@/app/components/shared/CodePreview'
import OtpInputSepratorCode from './code/OtpInputSepratorCode'

const OtpInputSeprator = () => {
  return (
    <>
      <CodePreview
        component={<OtpInputSepratorCode />}
        filePath='src/app/components/shadcn-form/Input/code/OtpInputSepratorCode.tsx'
        title='OTP Input Seprator'
      />
    </>
  )
}

export default OtpInputSeprator

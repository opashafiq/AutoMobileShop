import CodePreview from '@/app/components/shared/CodePreview'
import StudentEnrollmentFormCode from './code/StudentEnrollmentFormCode'

const StudentEnrollmentForm = () => {
  return (
    <>
      <CodePreview
        component={<StudentEnrollmentFormCode />}
        filePath='src/app/components/form-components/form-examples/code/StudentEnrollmentFormCode.tsx'
        title='StudentEnrollment Form'
      />
    </>
  )
}

export default StudentEnrollmentForm

import CodePreview from '@/app/components/shared/CodePreview'
import CourseRepeaterFormCode from './code/CourseRepeaterFormCode'

const CourseRepeaterForm = () => {
  return (
    <>
      <CodePreview
        component={<CourseRepeaterFormCode />}
        filePath='src/app/components/form-components/repeater-forms/code/CourseRepeaterFormCode.tsx'
        title='Course Form'
      />
    </>
  )
}

export default CourseRepeaterForm

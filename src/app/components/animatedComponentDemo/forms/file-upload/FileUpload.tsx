import CodePreview from '@/app/components/shared/CodePreview'
import FileUploadMotionCode from './FileUploadMotion'

export const FileUpload = () => {
  return (
    <>
      <CodePreview
        component={<FileUploadMotionCode />}
        filePath='src/app/components/animatedComponentDemo/forms/file-upload/FileUploadMotion.tsx'
        title='Animate File Upload'
        isAnimated={true}
      />
    </>
  )
}

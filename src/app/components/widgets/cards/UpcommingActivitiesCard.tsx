import CodePreview from '@/app/components/shared/CodePreview'
import UpcommingActCardCode from './code/UpcommingActivitiesCardCode'

const UpcommingActivities = () => {
  return (
    <>
      <CodePreview
        component={<UpcommingActCardCode />}
        filePath='src/app/components/widgets/cards/code/UpcommingActivitiesCardCode.tsx'
        title='Upcomming Activity Cards'
      />
    </>
  )
}

export default UpcommingActivities

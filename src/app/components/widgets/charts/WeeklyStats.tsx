import CodePreview from '@/app/components/shared/CodePreview'
import WeeklyStatsCode from './code/WeeklyStatsCode'

const WeeklyStatsChart = () => {
  return (
    <>
      <CodePreview
        component={<WeeklyStatsCode />}
        filePath='src/app/components/widgets/charts/code/WeeklyStatsCode.tsx'
        title='Weekly Stats Chart'
      />
    </>
  )
}

export default WeeklyStatsChart

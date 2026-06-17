import CodePreview from '@/app/components/shared/CodePreview'
import FollowersChartCode from './code/FollowersChartCode'

const followerChart = () => {
  return (
    <>
      <CodePreview
        component={<FollowersChartCode />}
        filePath='src/app/components/widgets/charts/code/FollowersChartCode.tsx'
        title='Follower Chart'
      />
    </>
  )
}

export default followerChart

import CodePreview from '@/app/components/shared/CodePreview'
import ProjectsCode from './code/ProjectsCode'

const ProjectsChart = () => {
  return (
    <>
      <CodePreview
        component={<ProjectsCode />}
        filePath='src/app/components/widgets/charts/code/ProjectsCode.tsx'
        title='Projects Chart'
      />
    </>
  )
}

export default ProjectsChart

import CodePreview from '@/app/components/shared/CodePreview'
import TaskListCode from './code/TaskListCode'

const TaskList = () => {
  return (
    <>
      <CodePreview
        component={<TaskListCode />}
        filePath='src/app/components/widgets/cards/code/TaskListCode.tsx'
        title='Task List Card'
      />
    </>
  )
}

export default TaskList

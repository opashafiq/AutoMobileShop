import CodePreview from '@/app/components/shared/CodePreview'
import RecentTransactionCardCode from './code/RecentTransactionCardCode'

const RecentTransections = () => {
  return (
    <>
      <CodePreview
        component={<RecentTransactionCardCode />}
        filePath='src/app/components/widgets/cards/code/RecentTransactionCardCode.tsx'
        title='Recent Transaction Cards'
      />
    </>
  )
}

export default RecentTransections

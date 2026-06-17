'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import GroupItem from './Codes/GroupItemCode'

const GroupingItems = () => {
  return (
    <div>
      <CodePreview
        component={<GroupItem />}
        filePath='src/app/components/headless-ui/Dropdown/Codes/GroupItemCode.tsx'
        title='Grouping Items'
      />
    </div>
  )
}

export default GroupingItems

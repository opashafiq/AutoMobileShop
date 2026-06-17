'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import ListingTabChange from './Code/ListingTabChangeCode'

const ListingForChangeTab = () => {
  return (
    <div>
      <CodePreview
        component={<ListingTabChange />}
        filePath='src/app/components/headless-ui/Tabs/Code/ListingTabChangeCode.tsx'
        title='Listening For Changes Tab'
      />
    </div>
  )
}

export default ListingForChangeTab

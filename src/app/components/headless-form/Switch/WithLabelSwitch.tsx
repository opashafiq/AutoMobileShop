'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import WithLabelswitch from './Codes/WithLabelSwitchCode'

const WithLabelSwitch = () => {
  return (
    <div>
      <CodePreview
        component={<WithLabelswitch />}
        filePath='src/app/components/headless-form/Switch/Codes/WithLabelSwitchCode.tsx'
        title='Adding a Label'
      />
    </div>
  )
}

export default WithLabelSwitch
